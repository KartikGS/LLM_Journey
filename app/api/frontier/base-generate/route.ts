import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FRONTIER_GENERATION_CONFIG, type FrontierProvider } from '@/lib/config/generation';
import logger from '@/lib/otel/logger';
import {
    safeMetric,
    getFrontierGenerateRequestsCounter,
    getFrontierGenerateFallbacksCounter,
} from '@/lib/otel/metrics';
import { getTracer } from '@/lib/otel/tracing';
import {
    type FallbackReasonCode,
    extractProviderErrorMessage,
    mapProviderFailure,
} from '@/lib/server/generation/shared';
import { parseCompletionsChunk, createSseRelayStream } from '@/lib/server/generation/streaming';

const ROUTE_PATH = '/api/frontier/base-generate';
const PROMPT_MAX_CHARS = 2000;
const FRONTIER_OUTPUT_MAX_CHARS = 4000;
const HF_MAX_NEW_TOKENS = 256;

const FALLBACK_SAMPLES = [
    'A frontier base model is strong at broad pattern recall but often inconsistent at instruction-following without adaptation.',
    'Base pretraining gives scale and fluency, yet assistant behavior typically needs post-training and fine-tuning objectives.',
    'Internet-scale pretraining improves coverage, but reliability, tone control, and task adherence usually remain uneven.',
] as const;

const requestSchema = z.object({
    prompt: z.string().trim().min(1).max(PROMPT_MAX_CHARS),
});



type BaseModelMetadata = {
    label: 'Frontier Base Model';
    modelId: string;
    assistantTuned: false;
    adaptation: 'none';
    note: 'Pretrained on internet-scale text; not assistant fine-tuned.';
};

type FallbackModeResponse = {
    mode: 'fallback';
    output: string;
    reason: {
        code: FallbackReasonCode;
        message: string;
    };
    metadata: BaseModelMetadata;
};

type RequestErrorResponse = {
    error: {
        code: 'invalid_json' | 'invalid_prompt';
        message: string;
    };
};

type FrontierConfig = {
    apiUrl: string;
    modelId: string;
    apiKey: string;
    timeoutMs: number;
    configured: boolean;
    issueCode?: 'missing_config' | 'invalid_config';
    provider: FrontierProvider;
};

const metadataForModel = (modelId: string): BaseModelMetadata => ({
    label: 'Frontier Base Model',
    modelId,
    assistantTuned: false,
    adaptation: 'none',
    note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
});



function loadFrontierConfig(): FrontierConfig {
    const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';

    if (!apiKey) {
        return {
            apiUrl: FRONTIER_GENERATION_CONFIG.apiUrl,
            modelId: FRONTIER_GENERATION_CONFIG.modelId,
            apiKey,
            timeoutMs: FRONTIER_GENERATION_CONFIG.timeoutMs,
            configured: false,
            issueCode: 'missing_config',
            provider: FRONTIER_GENERATION_CONFIG.provider,
        };
    }

    return {
        apiUrl: FRONTIER_GENERATION_CONFIG.apiUrl,
        modelId: FRONTIER_GENERATION_CONFIG.modelId,
        apiKey,
        timeoutMs: FRONTIER_GENERATION_CONFIG.timeoutMs,
        configured: true,
        provider: FRONTIER_GENERATION_CONFIG.provider,
    };
}

function selectFallbackSample(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i += 1) {
        hash = (hash * 31 + prompt.charCodeAt(i)) % 2_147_483_647;
    }
    return FALLBACK_SAMPLES[hash % FALLBACK_SAMPLES.length];
}

function buildProviderRequestBody(
    provider: FrontierProvider,
    prompt: string,
    modelId: string
): Record<string, unknown> {
    if (provider === 'huggingface') {
        return {
            model: modelId,
            prompt,
            max_tokens: HF_MAX_NEW_TOKENS,
            temperature: 0.4,
            stream: true,
        };
    }

    return {
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
    };
}

function createFallbackResponse(
    prompt: string,
    reasonCode: FallbackReasonCode,
    reasonMessage: string,
    modelId: string
): FallbackModeResponse {
    return {
        mode: 'fallback',
        output: selectFallbackSample(prompt),
        reason: {
            code: reasonCode,
            message: reasonMessage,
        },
        metadata: metadataForModel(modelId),
    };
}

export async function POST(req: NextRequest) {
    const tracer = getTracer();

    return tracer.startActiveSpan(
        'frontier.base_generate',
        { kind: SpanKind.SERVER },
        async (span) => {
            span.setAttribute('http.method', 'POST');
            span.setAttribute('http.route', ROUTE_PATH);
            safeMetric(() => getFrontierGenerateRequestsCounter().add(1));

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
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Invalid prompt payload' });
                    return NextResponse.json<RequestErrorResponse>(
                        {
                            error: {
                                code: 'invalid_prompt',
                                message: `prompt must be a non-empty string up to ${PROMPT_MAX_CHARS} characters.`,
                            },
                        },
                        { status: 400 }
                    );
                }

                const prompt = parsed.data.prompt;
                const frontierConfig = loadFrontierConfig();
                const configuredModelId = frontierConfig.modelId || 'model-not-configured';

                span.setAttribute('frontier.configured', frontierConfig.configured);
                span.setAttribute('frontier.timeout_ms', frontierConfig.timeoutMs);
                span.setAttribute('frontier.model_id', configuredModelId);
                span.setAttribute('frontier.provider', frontierConfig.provider);

                if (!frontierConfig.configured) {
                    const issueCode = frontierConfig.issueCode ?? 'missing_config';
                    const issueMessage = issueCode === 'invalid_config'
                        ? 'Frontier provider configuration is invalid. Showing deterministic fallback output.'
                        : 'Frontier provider is not configured. Showing deterministic fallback output.';

                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', issueCode);
                    span.setStatus({ code: SpanStatusCode.OK, message: issueMessage });

                    safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: issueCode }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(prompt, issueCode, issueMessage, configuredModelId),
                        { status: 200 }
                    );
                }

                const controller = new AbortController();
                const timeoutHandle = setTimeout(() => controller.abort(), frontierConfig.timeoutMs);

                let upstreamResponse: Response;
                try {
                    upstreamResponse = await fetch(frontierConfig.apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${frontierConfig.apiKey}`,
                        },
                        body: JSON.stringify(buildProviderRequestBody(frontierConfig.provider, prompt, frontierConfig.modelId)),
                        signal: controller.signal,
                    });
                } catch (error) {
                    clearTimeout(timeoutHandle);
                    const isAbort = error instanceof Error && error.name === 'AbortError';
                    const reasonCode: FallbackReasonCode = isAbort ? 'timeout' : 'upstream_error';
                    const reasonMessage = isAbort
                        ? 'Frontier provider timed out. Showing deterministic fallback output.'
                        : 'Frontier provider request failed. Showing deterministic fallback output.';

                    if (!isAbort) {
                        logger.error(
                            {
                                route: ROUTE_PATH,
                                errorName: error instanceof Error ? error.name : 'unknown',
                            },
                            'Frontier provider request failed'
                        );
                    }

                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', reasonCode);
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: reasonCode }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(prompt, reasonCode, reasonMessage, frontierConfig.modelId),
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
                        'Frontier provider returned non-OK status'
                    );

                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', mappedFailure.code);
                    span.setAttribute('frontier.upstream_status', upstreamResponse.status);
                    span.setStatus({ code: SpanStatusCode.OK, message: mappedFailure.message });

                    safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: mappedFailure.code }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            prompt,
                            mappedFailure.code,
                            mappedFailure.message,
                            frontierConfig.modelId
                        ),
                        { status: 200 }
                    );
                }

                const contentType = upstreamResponse.headers.get('content-type') ?? '';
                if (!contentType.includes('text/event-stream')) {
                    clearTimeout(timeoutHandle);
                    const reasonMessage = 'Frontier provider returned non-streaming response. Showing deterministic fallback output.';
                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', 'invalid_provider_response');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: 'invalid_provider_response' }));
                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            prompt,
                            'invalid_provider_response',
                            reasonMessage,
                            frontierConfig.modelId
                        ),
                        { status: 200 }
                    );
                }

                span.setAttribute('frontier.mode', 'live');
                span.setStatus({ code: SpanStatusCode.OK });
                streamingActive = true;

                const stream = createSseRelayStream({
                    upstreamResponse,
                    parseChunk: parseCompletionsChunk,
                    startEventData: {
                        mode: 'live',
                        metadata: metadataForModel(frontierConfig.modelId),
                    },
                    outputMaxChars: FRONTIER_OUTPUT_MAX_CHARS,
                    timeoutHandle,
                    onDone: () => { span.end(); },
                    onMidStreamError: (code) => {
                        safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: code }));
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
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'Unhandled frontier route error' });

                logger.error(
                    {
                        route: ROUTE_PATH,
                        errorName: error instanceof Error ? error.name : 'unknown',
                    },
                    'Unhandled frontier route error'
                );

                safeMetric(() => getFrontierGenerateFallbacksCounter().add(1, { reason_code: 'upstream_error' }));
                return NextResponse.json<FallbackModeResponse>(
                    createFallbackResponse(
                        'fallback',
                        'upstream_error',
                        'Unexpected server error occurred. Showing deterministic fallback output.',
                        'frontier-base-unknown'
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
