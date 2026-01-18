export const SENSITIVE_KEYS = ['prompt', 'input', 'api_key', 'token', 'password', 'secret', 'credential'];
export const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-telemetry-token', 'x-api-key'];

export const redactUrl = (url: string, base: string) => {
    try {
        const parsedUrl = new URL(url, base);
        let changed = false;
        parsedUrl.searchParams.forEach((_, key) => {
            if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
                parsedUrl.searchParams.set(key, '[REDACTED]');
                changed = true;
            }
        });
        return changed ? parsedUrl.toString() : url;
    } catch {
        return url;
    }
};