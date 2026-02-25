import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import logger from '@/lib/otel/logger';
import { getTracer } from '@/lib/otel/tracing';
import { toRecord } from '@/lib/utils/record';

const ROUTE_PATH = '/api/adaptation/generate';
const PROMPT_MAX_CHARS = 2000;
const DEFAULT_TIMEOUT_MS = 8000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 20000;

const ADAPTATION_OUTPUT_MAX_CHARS =
    Math.max(1, parseInt(process.env.ADAPTATION_OUTPUT_MAX_CHARS ?? '4000', 10) || 4000);

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

const STRATEGY_MODEL_ENV: Record<StrategyId, string> = {
    'full-finetuning': 'ADAPTATION_FULL_FINETUNE_MODEL_ID',
    'lora-peft': 'ADAPTATION_LORA_MODEL_ID',
    'prompt-prefix': 'ADAPTATION_PROMPT_PREFIX_MODEL_ID',
};

const requestSchema = z.object({
    prompt: z.string().trim().min(1).max(PROMPT_MAX_CHARS),
    strategy: z.enum(STRATEGY_VALUES),
});

type FallbackReasonCode =
    | 'missing_config'
    | 'invalid_config'
    | 'quota_limited'
    | 'timeout'
    | 'upstream_auth'
    | 'upstream_error'
    | 'invalid_provider_response'
    | 'empty_provider_output';

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

type LiveModeResponse = {
    mode: 'live';
    output: string;
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

function parseTimeout(rawTimeout: string | undefined): number {
    if (!rawTimeout) {
        return DEFAULT_TIMEOUT_MS;
    }

    const parsed = Number.parseInt(rawTimeout, 10);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_TIMEOUT_MS;
    }

    return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, parsed));
}

function loadAdaptationConfig(strategy: StrategyId): AdaptationConfig {
    const apiUrl = process.env.ADAPTATION_API_URL?.trim() ?? '';
    const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';
    const timeoutMs = parseTimeout(process.env.FRONTIER_TIMEOUT_MS);
    const modelId = process.env[STRATEGY_MODEL_ENV[strategy]]?.trim() ?? '';

    if (!apiUrl || !apiKey || !modelId) {
        return {
            apiUrl,
            modelId,
            apiKey,
            timeoutMs,
            configured: false,
            issueCode: 'missing_config',
        };
    }

    try {
        // Validate URL eagerly so failures stay deterministic.
        new URL(apiUrl);
    } catch {
        return {
            apiUrl,
            modelId,
            apiKey,
            timeoutMs,
            configured: false,
            issueCode: 'invalid_config',
        };
    }

    return {
        apiUrl,
        modelId,
        apiKey,
        timeoutMs,
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

function extractChatOutput(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
        return null;
    }

    const root = payload as Record<string, unknown>;
    const choices = root.choices;

    if (!Array.isArray(choices) || choices.length === 0) {
        return null;
    }

    const firstChoice = choices[0];
    if (typeof firstChoice !== 'object' || firstChoice === null) {
        return null;
    }

    const message = (firstChoice as Record<string, unknown>).message;
    if (typeof message !== 'object' || message === null) {
        return null;
    }

    const content = (message as Record<string, unknown>).content;
    if (typeof content !== 'string') {
        return null;
    }

    const trimmed = content.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function extractProviderErrorMessage(payload: unknown): string | null {
    const root = toRecord(payload);
    if (!root) {
        return null;
    }

    const directMessage = root.message;
    if (typeof directMessage === 'string' && directMessage.trim().length > 0) {
        return directMessage.trim();
    }

    const errorObj = toRecord(root.error);
    const nestedMessage = errorObj?.message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
        return nestedMessage.trim();
    }

    return null;
}

function mapProviderFailure(
    status: number,
    providerMessage: string | null
): { code: FallbackReasonCode; message: string } {
    if (status === 429) {
        return {
            code: 'quota_limited',
            message: 'Live provider quota is currently unavailable. Showing deterministic fallback output.',
        };
    }

    if (status === 401 || status === 403) {
        return {
            code: 'upstream_auth',
            message: 'Live provider rejected authentication. Showing deterministic fallback output.',
        };
    }

    if (status >= 500) {
        return {
            code: 'upstream_error',
            message: 'Live provider is temporarily unavailable. Showing deterministic fallback output.',
        };
    }

    return {
        code: 'upstream_error',
        message: providerMessage ?? 'Live provider request failed. Showing deterministic fallback output.',
    };
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

                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(strategy, reasonCode, reasonMessage, config.modelId),
                        { status: 200 }
                    );
                } finally {
                    clearTimeout(timeoutHandle);
                }

                if (!upstreamResponse.ok) {
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

                let providerPayload: unknown;
                try {
                    providerPayload = await upstreamResponse.json();
                } catch {
                    const reasonMessage =
                        'Adaptation provider returned an unreadable payload. Showing deterministic fallback output.';
                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', 'invalid_provider_response');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

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

                const extractedOutput = extractChatOutput(providerPayload);
                if (!extractedOutput) {
                    const reasonMessage =
                        'Adaptation provider returned empty output. Showing deterministic fallback output.';
                    span.setAttribute('adaptation.mode', 'fallback');
                    span.setAttribute('adaptation.reason_code', 'empty_provider_output');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            strategy,
                            'empty_provider_output',
                            reasonMessage,
                            config.modelId
                        ),
                        { status: 200 }
                    );
                }

                span.setAttribute('adaptation.mode', 'live');
                span.setStatus({ code: SpanStatusCode.OK });

                return NextResponse.json<LiveModeResponse>(
                    {
                        mode: 'live',
                        output: extractedOutput.slice(0, ADAPTATION_OUTPUT_MAX_CHARS),
                        metadata: {
                            strategy,
                            modelId: config.modelId,
                        },
                    },
                    { status: 200 }
                );
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
                span.end();
            }
        }
    );
}
