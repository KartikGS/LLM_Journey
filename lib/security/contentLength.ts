import { NextRequest } from 'next/server';

export interface ContentLengthValidation {
    valid: boolean;
    status?: number;
    error?: string;
    length?: number;
}

/**
 * Validates Content-Length header against MAX_BODY_SIZE.
 */
export function validateContentLength(contentLength: string | null, required: boolean, maxBodySize: number): ContentLengthValidation {
    if (!contentLength && required) {
        return { valid: false, status: 411, error: 'Content-Length required' };
    }

    if (!contentLength) {
        return { valid: true, length: 0 };
    }

    const length = Number(contentLength);

    // A very large but finite integer will return 400, not 413
    if (!Number.isFinite(length) || !Number.isSafeInteger(length)) {
        return { valid: false, status: 400, error: 'Invalid Content-Length' };
    }

    if (length > maxBodySize) {
        return { valid: false, status: 413, error: 'Payload too large' };
    }

    if (length < 0) {
        return { valid: false, status: 400, error: 'Invalid Content-Length' };
    }

    return { valid: true, length };
}

/**
 * races read against a timer
 * @param promise 
 * @param timeoutMs 
 * @returns promise
 */
function readWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs?: number
): Promise<T> {
    if (!timeoutMs) return promise;

    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('READ_TIMEOUT')), timeoutMs)
        ),
    ]);
}


/**
 * Reads a NextRequest stream with a byte limit to check content length.
 */
export async function readStreamWithLimit(
    req: NextRequest,
    limit: number,
    contentLength: number,
    timeoutMs?: number
): Promise<{ body: Uint8Array; error?: { status: number; message: string; timeout?: boolean } }> {
    const reader = req.body?.getReader();
    if (!reader) {
        return { body: new Uint8Array(0), error: { status: 400, message: 'Bad Request' } };
    }

    // let timeoutId: NodeJS.Timeout | undefined;
    // let timedOut = false;
    // if (timeoutMs) {
    //     timeoutId = setTimeout(() => {
    //         timedOut = true;
    //         req.body?.cancel();
    //     }, timeoutMs);
    // }

    let buffer: Uint8Array | null = null;
    let offset = 0;

    try {
        while (true) {
            // const { done, value } = await reader.read();
            const { done, value } = await readWithTimeout(reader.read(), timeoutMs);
            if (done) break;

            if (offset + value.length > limit || offset + value.length > contentLength) {
                return { body: new Uint8Array(0), error: { status: 413, message: 'Payload too large' } };
            }

            if (!buffer) {
                buffer = new Uint8Array(Math.min(limit, contentLength));
            }
            buffer.set(value, offset);
            offset += value.length;
        }

        return { body: buffer?.slice(0, offset) ?? new Uint8Array(0) };
    } catch (err) {
        // if (timedOut) {
        //     return {
        //         body: new Uint8Array(0),
        //         error: { status: 408, message: 'Request body read timeout', timeout: true },
        //     };
        // }
        if ((err as Error).message === 'READ_TIMEOUT') {
            return {
                body: new Uint8Array(0),
                error: { status: 408, message: 'Request body read timeout', timeout: true },
            };
        }

        return { body: new Uint8Array(0), error: { status: 400, message: 'Bad Request' } };
    } finally {
        // if (timeoutId) clearTimeout(timeoutId);
        reader.releaseLock();
    }
}
