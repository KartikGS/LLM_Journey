/**
 * Shared utilities for server-side generation API routes.
 * Extracted from /api/frontier/base-generate and /api/adaptation/generate.
 */

export type FallbackReasonCode =
    | 'missing_config'
    | 'quota_limited'
    | 'timeout'
    | 'upstream_auth'
    | 'upstream_error'
    | 'invalid_provider_response'
    | 'empty_provider_output';

export function extractProviderErrorMessage(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
        return null;
    }

    const root = payload as Record<string, unknown>;

    const directMessage = root.message;
    if (typeof directMessage === 'string' && directMessage.trim().length > 0) {
        return directMessage.trim();
    }

    const errorObj = root.error;
    if (typeof errorObj === 'object' && errorObj !== null) {
        const errorRecord = errorObj as Record<string, unknown>;
        const nestedMessage = errorRecord.message;
        if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
            return nestedMessage.trim();
        }
    }

    return null;
}

export function mapProviderFailure(
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
