import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ADAPTATION_GENERATION_CONFIG } from '@/lib/config/generation';
import logger from '@/lib/otel/logger';
import {
    safeMetric,
    getAdaptationGenerateRequestsCounter,
    getAdaptationGenerateFallbacksCounter,
} from '@/lib/otel/metrics';
import { getTracer } from '@/lib/otel/tracing';
import {
    type FallbackReasonCode,
    extractProviderErrorMessage,
    mapProviderFailure,
} from '@/lib/server/generation/shared';
import { parseChatChunk, createSseRelayStream } from '@/lib/server/generation/streaming';

const ROUTE_PATH = '/api/adaptation/generate';
const PROMPT_MAX_CHARS = 2000;

const ADAPTATION_OUTPUT_MAX_CHARS = ADAPTATION_GENERATION_CONFIG.outputMaxChars;

const STRATEGY_VALUES = ['full-finetuning', 'lora-peft', 'prompt-prefix'] as const;
type StrategyId = typeof STRATEGY_VALUES[number];

// Server-side only — MUST NOT appear in response payload, logs, or span attributes.
const ADAPTATION_SYSTEM_PROMPT =
    'You are a helpful assistant. Answer the following question clearly and concisely.\n\n';

const FALLBACK_TEXT: Record<StrategyId, string> = {
    'full-finetuning':
        'Full fine-tuning retrains all model weights on task-specific data, producing highly aligned behavior at the cost of significant compute. This is a deterministic fallback — the live fine-tuned model is not configured for this environment.',
    'lora-peft':
        'LoRA adapts a frozen base model with small rank-decomposed matrices, achieving specialization at a fraction of full fine-tune cost. This is a deterministic fallback — the LLaMAntino specialist model is not available in this environment.',
    'prompt-prefix':
        'Prompt steering prepends a fixed instruction to every query without touching model weights — fastest to iterate, least robust. Base models respond less predictably than instruct variants. This is a deterministic fallback — the base model endpoint is not configured.',
};

const requestSchema = z.object({
    prompt: z.string().trim().min(1).max(PROMPT_MAX_CHARS),
    strategy: z.enum(STRATEGY_VALUES),
});



type AdaptationModelMetadata = {
    strategy: StrategyId;
    modelId: string;
};

type FallbackModeResponse = {
    mode: 'fallback';
    output: string;
    reason: {
        code: FallbackReasonCode;
        message: string;
    };
    metadata: AdaptationModelMetadata;
};

type RequestErrorResponse = {
    error: {
        code: 'invalid_json' | 'invalid_prompt' | 'invalid_strategy';
        message: string;
    };
};

type AdaptationConfig = {
    apiUrl: string;
    modelId: string;
    apiKey: string;
    timeoutMs: number;
    configured: boolean;
    issueCode?: 'missing_config' | 'invalid_config';
};



function loadAdaptationConfig(strategy: StrategyId): AdaptationConfig {
    const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';
    const modelId = ADAPTATION_GENERATION_CONFIG.models[strategy];

    if (!apiKey) {
        return {
            apiUrl: ADAPTATION_GENERATION_CONFIG.apiUrl,
            modelId,
            apiKey,
            timeoutMs: ADAPTATION_GENERATION_CONFIG.timeoutMs,
            configured: false,
            issueCode: 'missing_config',
        };
    }

    return {
        apiUrl: ADAPTATION_GENERATION_CONFIG.apiUrl,
        modelId,
        apiKey,
        timeoutMs: ADAPTATION_GENERATION_CONFIG.timeoutMs,
        configured: true,
    };
}

function buildMessages(
    strategy: StrategyId,
    prompt: string
): Array<{ role: string; content: string }> {
    if (strategy === 'prompt-prefix') {
        return [
            { role: 'system', content: ADAPTATION_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
        ];
    }

    return [{ role: 'user', content: prompt }];
}

function createFallbackResponse(
    strategy: StrategyId,
    reasonCode: FallbackReasonCode,
    reasonMessage: string,
    modelId: string
): FallbackModeResponse {
    return {
        mode: 'fallback',
        output: FALLBACK_TEXT[strategy],
        reason: {
            code: reasonCode,
            message: reasonMessage,
        },
        metadata: {
            strategy,
            modelId,
        },
    };
}

export async function POST(req: NextRequest) {
    const tracer = getTracer();

    return tracer.startActiveSpan(
        'adaptation.generate',
        { kind: SpanKind.SERVER },
        async (span) => {
            span.setAttribute('http.method', 'POST');
            span.setAttribute('http.route', ROUTE_PATH);
            safeMetric(() => getAdaptationGenerateRequestsCounter().add(1));

            let streamingActive = false;

            try {
                let rawBody: unknown;

                try {
                    rawBody = await req.json();
                } catch {
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid JSON body' });
                    return NextResponse.json<RequestErrorResponse>(
                        {
                            error: {
                                code: 'invalid_json',
                                message: 'Request body must be valid JSON.',
                            },
                        },
                        { status: 400 }
                    );
                }

                const parsed = requestSchema.safeParse(rawBody);
                if (!parsed.success) {
                    const issues = parsed.error.issues;
                    const isStrategyError = issues.some((i) => i.path.includes('strategy'));
                    const errorCode = isStrategyError ? 'invalid_strategy' : 'invalid_prompt';
                    const errorMessage = isStrategyError
                        ? `strategy must be one of: ${STRATEGY_VALUES.join(', ')}.`
                        : `prompt must be a non-empty string up to ${PROMPT_MAX_CHARS} characters.`;

                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: `Invalid ${isStrategyError ? 'strategy' : 'prompt'} payload`,
                    });
                    return NextResponse.json<RequestErrorResponse>(
                        { error: { code: errorCode, message: errorMessage } },
                        { status: 400 }
                    );
                }

                const { prompt, strategy } = parsed.data;
                const config = loadAdaptationConfig(strategy);
                const configuredModelId = config.modelId || 'model-not-configured';

                span.setAttribute('adaptation.strategy', strategy);
                span.setAttribute('adaptation.configured', config.configured);
                span.setAttribute('adaptation.model_id', configuredModelId);

                if (!config.configured) {
                    const issueCode = config.issueCode ?? 'missing_config';
                    const issueMessage =
                        issueCode === 'invalid_config'
                            ? 'Adaptation provider configuration is invalid. Showing deterministic fallback output.'
                            : 'Adaptation provider is not configured. Showing deterministic fallback output.';

                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', issueCode);
                    span.setStatus({ code: SpanStatusCode.OK, message: issueMessage });

                    safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: issueCode }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(strategy, issueCode, issueMessage, configuredModelId),
                        { status: 200 }
                    );
                }

                const controller = new AbortController();
                const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);

                const requestBody = {
                    model: config.modelId,
                    messages: buildMessages(strategy, prompt),
                    temperature: 0.4,
                    stream: true,
                };

                let upstreamResponse: Response;
                try {
                    upstreamResponse = await fetch(config.apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${config.apiKey}`,
                        },
                        body: JSON.stringify(requestBody),
                        signal: controller.signal,
                    });
                } catch (error) {
                    clearTimeout(timeoutHandle);
                    const isAbort = error instanceof Error && error.name === 'AbortError';
                    const reasonCode: FallbackReasonCode = isAbort ? 'timeout' : 'upstream_error';
                    const reasonMessage = isAbort
                        ? 'Adaptation provider timed out. Showing deterministic fallback output.'
                        : 'Adaptation provider request failed. Showing deterministic fallback output.';

                    if (!isAbort) {
                        logger.error(
                            {
                                route: ROUTE_PATH,
                                errorName: error instanceof Error ? error.name : 'unknown',
                            },
                            'Adaptation provider request failed'
                        );
                    }

                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', reasonCode);
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: reasonCode }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(strategy, reasonCode, reasonMessage, config.modelId),
                        { status: 200 }
                    );
                }

                if (!upstreamResponse.ok) {
                    clearTimeout(timeoutHandle);
                    let providerMessage: string | null = null;
                    try {
                        providerMessage = extractProviderErrorMessage(await upstreamResponse.json());
                    } catch {
                        providerMessage = null;
                    }

                    const mappedFailure = mapProviderFailure(upstreamResponse.status, providerMessage);

                    logger.warn(
                        {
                            route: ROUTE_PATH,
                            upstreamStatus: upstreamResponse.status,
                            reasonCode: mappedFailure.code,
                        },
                        'Adaptation provider returned non-OK status'
                    );

                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', mappedFailure.code);
                    span.setAttribute('adaptation.upstream_status', upstreamResponse.status);
                    span.setStatus({ code: SpanStatusCode.OK, message: mappedFailure.message });

                    safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: mappedFailure.code }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            strategy,
                            mappedFailure.code,
                            mappedFailure.message,
                            config.modelId
                        ),
                        { status: 200 }
                    );
                }

                const contentType = upstreamResponse.headers.get('content-type') ?? '';
                if (!contentType.includes('text/event-stream')) {
                    clearTimeout(timeoutHandle);
                    const reasonMessage =
                        'Adaptation provider returned non-streaming response. Showing deterministic fallback output.';
                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', 'invalid_provider_response');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: 'invalid_provider_response' }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            strategy,
                            'invalid_provider_response',
                            reasonMessage,
                            config.modelId
                        ),
                        { status: 200 }
                    );
                }

                span.setAttribute('adaptation.mode', 'live');
                span.setStatus({ code: SpanStatusCode.OK });
                streamingActive = true;

                const stream = createSseRelayStream({
                    upstreamResponse,
                    parseChunk: parseChatChunk,
                    startEventData: {
                        mode: 'live',
                        metadata: {
                            strategy,
                            modelId: config.modelId,
                        },
                    },
                    outputMaxChars: ADAPTATION_OUTPUT_MAX_CHARS,
                    timeoutHandle,
                    onDone: () => { span.end(); },
                    onMidStreamError: (code) => {
                        safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: code }));
                        span.end();
                    },
                });

                return new Response(stream, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });
            } catch (error) {
                span.recordException(error as Error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Unhandled adaptation route error' });

                logger.error(
                    {
                        route: ROUTE_PATH,
                        errorName: error instanceof Error ? error.name : 'unknown',
                    },
                    'Unhandled adaptation route error'
                );

                safeMetric(() => getAdaptationGenerateFallbacksCounter().add(1, { reason_code: 'upstream_error' }));
                return NextResponse.json<FallbackModeResponse>(
                    createFallbackResponse(
                        'full-finetuning',
                        'upstream_error',
                        'Unexpected server error occurred. Showing deterministic fallback output.',
                        'adaptation-unknown'
                    ),
                    { status: 200 }
                );
            } finally {
                if (!streamingActive) {
                    span.end();
                }
            }
        }
    );
}
