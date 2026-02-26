/**
 * SSE chunk parsers and relay stream factory for generation routes.
 * CR-021: shared parsing logic for frontier (/v1/completions) and adaptation (/v1/chat/completions).
 */

const SSE_ENCODER = new TextEncoder();

function formatSseEvent(event: string, data: Record<string, unknown>): Uint8Array {
    return SSE_ENCODER.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** Extracts token text from a /v1/completions SSE data line. Returns null to skip. */
export function parseCompletionsChunk(line: string): string | null {
    try {
        const parsed = JSON.parse(line) as unknown;
        if (typeof parsed !== 'object' || parsed === null) return null;
        const choices = (parsed as Record<string, unknown>).choices;
        if (!Array.isArray(choices) || choices.length === 0) return null;
        const first = choices[0] as Record<string, unknown>;
        const text = first.text;
        if (text === null || text === undefined || text === '') return null;
        return typeof text === 'string' ? text : null;
    } catch {
        return null;
    }
}

/** Extracts token text from a /v1/chat/completions SSE data line. Returns null to skip. */
export function parseChatChunk(line: string): string | null {
    try {
        const parsed = JSON.parse(line) as unknown;
        if (typeof parsed !== 'object' || parsed === null) return null;
        const choices = (parsed as Record<string, unknown>).choices;
        if (!Array.isArray(choices) || choices.length === 0) return null;
        const first = choices[0] as Record<string, unknown>;
        const delta = first.delta;
        if (typeof delta !== 'object' || delta === null) return null;
        const content = (delta as Record<string, unknown>).content;
        if (content === null || content === undefined || content === '') return null;
        return typeof content === 'string' ? content : null;
    } catch {
        return null;
    }
}

export interface SseRelayOptions {
    upstreamResponse: Response;
    parseChunk: (data: string) => string | null;
    startEventData: Record<string, unknown>;
    outputMaxChars: number;
    timeoutHandle: ReturnType<typeof setTimeout>;
    onDone: () => void;
    onMidStreamError: (code: 'timeout' | 'upstream_error') => void;
}

export function createSseRelayStream({
    upstreamResponse,
    parseChunk,
    startEventData,
    outputMaxChars,
    timeoutHandle,
    onDone,
    onMidStreamError,
}: SseRelayOptions): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(formatSseEvent('start', startEventData));

            const body = upstreamResponse.body;
            if (!body) {
                clearTimeout(timeoutHandle);
                controller.enqueue(
                    formatSseEvent('error', {
                        code: 'upstream_error',
                        message: 'Streaming was interrupted: no response body.',
                    })
                );
                try { controller.close(); } catch { /* already closed */ }
                onMidStreamError('upstream_error');
                return;
            }

            const reader = body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let charCount = 0;
            let midStreamErrorCode: 'timeout' | 'upstream_error' | null = null;
            let closed = false;

            try {
                while (!closed) {
                    let readResult: ReadableStreamReadResult<Uint8Array>;
                    try {
                        readResult = await reader.read();
                    } catch (readError) {
                        const isAbort = readError instanceof Error && readError.name === 'AbortError';
                        const errorCode: 'timeout' | 'upstream_error' = isAbort ? 'timeout' : 'upstream_error';
                        const errorMessage = isAbort
                            ? 'Streaming was interrupted: provider timed out.'
                            : 'Streaming was interrupted: connection error.';
                        controller.enqueue(formatSseEvent('error', { code: errorCode, message: errorMessage }));
                        midStreamErrorCode = errorCode;
                        closed = true;
                        continue;
                    }

                    const { done, value } = readResult;

                    if (done) {
                        controller.enqueue(formatSseEvent('done', {}));
                        closed = true;
                        continue;
                    }

                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                    }

                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            controller.enqueue(formatSseEvent('done', {}));
                            closed = true;
                            break;
                        }
                        const token = parseChunk(data);
                        if (token === null) continue;
                        controller.enqueue(formatSseEvent('token', { text: token }));
                        charCount += token.length;
                        if (charCount >= outputMaxChars) {
                            controller.enqueue(formatSseEvent('done', {}));
                            closed = true;
                            break;
                        }
                    }
                }
            } finally {
                clearTimeout(timeoutHandle);
                try { reader.releaseLock(); } catch { /* already released */ }
                try { controller.close(); } catch { /* already closed */ }
                if (midStreamErrorCode !== null) {
                    onMidStreamError(midStreamErrorCode);
                } else {
                    onDone();
                }
            }
        },
    });
}
