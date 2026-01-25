/**
 * @jest-environment node
 */

import { readStreamWithLimit } from "@/lib/security/contentLength";
import type { NextRequest } from 'next/server';

/**
 * Utility to create a mock NextRequest with a real ReadableStream body.
 */
function mockNextRequest(
  chunks: Uint8Array[],
  options?: { delayMs?: number }
): NextRequest {
  const delayMs = options?.delayMs ?? 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return {
    body: stream,
  } as unknown as NextRequest;
}

describe('readStreamWithLimit', () => {
  it('reads body successfully within limits', async () => {
    const data = new TextEncoder().encode('hello');
    const req = mockNextRequest([data]);

    const result = await readStreamWithLimit(req, 10, 10);

    expect(result.error).toBeUndefined();
    expect(new TextDecoder().decode(result.body)).toBe('hello');
  });

  it('returns 400 if request body is missing', async () => {
    const req = { body: null } as unknown as NextRequest;

    const result = await readStreamWithLimit(req, 10, 10);

    expect(result.error).toEqual({
      status: 400,
      message: 'Bad Request',
    });
    expect(result.body.length).toBe(0);
  });

  it('rejects when payload exceeds limit', async () => {
    const data = new Uint8Array(20);
    const req = mockNextRequest([data]);

    const result = await readStreamWithLimit(req, 10, 20);

    expect(result.error?.status).toBe(413);
    expect(result.error?.message).toBe('Payload too large');
  });

  it('rejects when payload exceeds declared contentLength', async () => {
    const chunk1 = new Uint8Array(5);
    const chunk2 = new Uint8Array(6);
    const req = mockNextRequest([chunk1, chunk2]);

    const result = await readStreamWithLimit(req, 20, 10);

    expect(result.error?.status).toBe(413);
    expect(result.error?.message).toBe('Payload too large');
  });

  it('returns 408 on stream read timeout', async () => {
    const chunk = new Uint8Array(5);
    const req = mockNextRequest([chunk], { delayMs: 50 });

    const result = await readStreamWithLimit(req, 10, 10, 10);

    expect(result.error?.status).toBe(408);
    expect(result.error?.timeout).toBe(true);
    expect(result.body.length).toBe(0);
  });

  it('handles multiple chunks correctly', async () => {
    const chunk1 = new TextEncoder().encode('hello ');
    const chunk2 = new TextEncoder().encode('world');
    const req = mockNextRequest([chunk1, chunk2]);

    const result = await readStreamWithLimit(req, 20, 20);

    expect(result.error).toBeUndefined();
    expect(new TextDecoder().decode(result.body)).toBe('hello world');
  });
});
