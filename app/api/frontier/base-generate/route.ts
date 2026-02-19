import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import logger from '@/lib/otel/logger';
import { getTracer } from '@/lib/otel/tracing';

const ROUTE_PATH = '/api/frontier/base-generate';
const PROMPT_MAX_CHARS = 2000;
const FRONTIER_OUTPUT_MAX_CHARS = 4000;
const DEFAULT_TIMEOUT_MS = 8000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 20000;
const HF_MAX_NEW_TOKENS = 256;

const FALLBACK_SAMPLES = [
    'A frontier base model is strong at broad pattern recall but often inconsistent at instruction-following without adaptation.',
    'Base pretraining gives scale and fluency, yet assistant behavior typically needs post-training and fine-tuning objectives.',
    'Internet-scale pretraining improves coverage, but reliability, tone control, and task adherence usually remain uneven.',
] as const;

const requestSchema = z.object({
    prompt: z.string().trim().min(1).max(PROMPT_MAX_CHARS),
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

type LiveModeResponse = {
    mode: 'live';
    output: string;
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
    provider: 'openai' | 'huggingface';
};

const metadataForModel = (modelId: string): BaseModelMetadata => ({
    label: 'Frontier Base Model',
    modelId,
    assistantTuned: false,
    adaptation: 'none',
    note: 'Pretrained on internet-scale text; not assistant fine-tuned.',
});

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

function loadFrontierConfig(): FrontierConfig {
    const apiUrl = process.env.FRONTIER_API_URL?.trim() ?? '';
    const modelId = process.env.FRONTIER_MODEL_ID?.trim() ?? '';
    const apiKey = process.env.FRONTIER_API_KEY?.trim() ?? '';
    const timeoutMs = parseTimeout(process.env.FRONTIER_TIMEOUT_MS);
    const rawProvider = process.env.FRONTIER_PROVIDER?.trim();

    if (rawProvider && rawProvider !== 'openai' && rawProvider !== 'huggingface') {
        return {
            apiUrl,
            modelId,
            apiKey,
            timeoutMs,
            configured: false,
            issueCode: 'invalid_config',
            provider: 'openai',
        };
    }

    const provider: 'openai' | 'huggingface' = rawProvider === 'huggingface' ? 'huggingface' : 'openai';

    if (!apiUrl || !modelId || !apiKey) {
        return {
            apiUrl,
            modelId,
            apiKey,
            timeoutMs,
            configured: false,
            issueCode: 'missing_config',
            provider,
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
            provider,
        };
    }

    return {
        apiUrl,
        modelId,
        apiKey,
        timeoutMs,
        configured: true,
        provider,
    };
}

function selectFallbackSample(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i += 1) {
        hash = (hash * 31 + prompt.charCodeAt(i)) % 2_147_483_647;
    }
    return FALLBACK_SAMPLES[hash % FALLBACK_SAMPLES.length];
}

function toRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function extractContentText(content: unknown): string | null {
    if (typeof content === 'string') {
        const trimmed = content.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (!Array.isArray(content)) {
        return null;
    }

    for (const item of content) {
        const record = toRecord(item);
        const text = record?.text;
        if (typeof text === 'string' && text.trim().length > 0) {
            return text.trim();
        }
    }

    return null;
}

function buildProviderRequestBody(
    provider: 'openai' | 'huggingface',
    prompt: string,
    modelId: string
): Record<string, unknown> {
    if (provider === 'huggingface') {
        return {
            inputs: prompt,
            parameters: {
                max_new_tokens: HF_MAX_NEW_TOKENS,
                temperature: 0.4
            },
        };
    }

    return {
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
    };
}

function extractProviderOutput(payload: unknown): string | null {
    // HF: [{ generated_text: "..." }]
    if (Array.isArray(payload) && payload.length > 0) {
        const first = toRecord(payload[0]);
        const text = first?.generated_text;
        if (typeof text === 'string' && text.trim().length > 0) {
            return text.trim();
        }
        return null; // HF array found but no usable text → empty_provider_output fallback
    }

    const root = toRecord(payload);
    if (!root) {
        return null;
    }

    const choices = root.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const firstChoice = toRecord(choices[0]);
        if (firstChoice) {
            const message = toRecord(firstChoice.message);
            const messageText = extractContentText(message?.content);
            if (messageText) {
                return messageText;
            }

            const text = firstChoice.text;
            if (typeof text === 'string' && text.trim().length > 0) {
                return text.trim();
            }
        }
    }

    const anthropicLike = root.content;
    if (Array.isArray(anthropicLike) && anthropicLike.length > 0) {
        for (const item of anthropicLike) {
            const record = toRecord(item);
            if (!record) {
                continue;
            }

            const text = record.text;
            if (typeof text === 'string' && text.trim().length > 0) {
                return text.trim();
            }
        }
    }

    return null;
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

function mapProviderFailure(status: number, providerMessage: string | null): {
    code: FallbackReasonCode;
    message: string;
} {
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
                const configuredModelId = frontierConfig.modelId || 'unconfigured-frontier-base';

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

                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(prompt, reasonCode, reasonMessage, frontierConfig.modelId),
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
                        'Frontier provider returned non-OK status'
                    );

                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', mappedFailure.code);
                    span.setAttribute('frontier.upstream_status', upstreamResponse.status);
                    span.setStatus({ code: SpanStatusCode.OK, message: mappedFailure.message });

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

                let providerPayload: unknown;
                try {
                    providerPayload = await upstreamResponse.json();
                } catch {
                    const reasonMessage = 'Frontier provider returned an unreadable payload. Showing deterministic fallback output.';
                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', 'invalid_provider_response');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

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

                const extractedOutput = extractProviderOutput(providerPayload);
                if (!extractedOutput) {
                    const reasonMessage = 'Frontier provider returned empty output. Showing deterministic fallback output.';
                    span.setAttribute('frontier.mode', 'fallback');
                    span.setAttribute('frontier.reason_code', 'empty_provider_output');
                    span.setStatus({ code: SpanStatusCode.OK, message: reasonMessage });

                    return NextResponse.json<FallbackModeResponse>(
                        createFallbackResponse(
                            prompt,
                            'empty_provider_output',
                            reasonMessage,
                            frontierConfig.modelId
                        ),
                        { status: 200 }
                    );
                }

                const liveOutput = extractedOutput.slice(0, FRONTIER_OUTPUT_MAX_CHARS);
                const response: LiveModeResponse = {
                    mode: 'live',
                    output: liveOutput,
                    metadata: metadataForModel(frontierConfig.modelId),
                };

                span.setAttribute('frontier.mode', 'live');
                span.setStatus({ code: SpanStatusCode.OK });

                return NextResponse.json<LiveModeResponse>(response, { status: 200 });
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
                span.end();
            }
        }
    );
}
