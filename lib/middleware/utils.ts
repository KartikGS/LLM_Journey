type RequestLike = {
    headers: Headers;
    ip?: string;
};

/**
 * Extract a stable client IP.
 * Used only for coarse abuse protection (not identity or auth).
 */
export function getClientIp(request: RequestLike): string {
    const forwardedFor = request.headers.get('x-forwarded-for');

    return (
        request.ip ??
        forwardedFor?.split(',')[0]?.trim() ??
        'unknown'
    );
}

/**
 * Generate a cryptographically strong random nonce in base64 format.
 * Compatible with Edge Runtime (avoids Buffer).
 */
export function generateNonce(): string {
    const nonceArray = new Uint8Array(16); // 16 bytes is fine; 32 bytes would be extra conservative, but unnecessary
    crypto.getRandomValues(nonceArray);
    return btoa(String.fromCharCode(...nonceArray));
}