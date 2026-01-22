import { redactUrl } from '@/lib/security/redaction';

describe('redactUrl', () => {
    const BASE_URL = 'http://example.com';

    it('should redact sensitive keys in query parameters', () => {
        const url = '/api?api_key=secret123&other=value';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('api_key=%5BREDACTED%5D');
        expect(redacted).toContain('other=value');
    });

    it('should redact multiple sensitive keys', () => {
        const url = '/login?token=abc&password=123';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('token=%5BREDACTED%5D');
        expect(redacted).toContain('password=%5BREDACTED%5D');
    });

    it('should be case insensitive for keys', () => {
        const url = '/api?API_KEY=secret';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('API_KEY=%5BREDACTED%5D');
    });

    it('should not modify url if no sensitive keys are present', () => {
        const url = '/api?query=hello';
        const result = redactUrl(url, BASE_URL);
        expect(result).toBe(url);
    });

    it('should return original string if url is invalid', () => {
        // invalid url that fails new URL()
        // But since we provide a base, almost anything is valid unless base is invalid or url is completely broken.
        // If we pass an invalid absolute URL as first arg?
        const invalidUrl = 'http://:invalid';
        const result = redactUrl(invalidUrl, BASE_URL);
        expect(result).toBe(invalidUrl);
    });

    it('should handle partial matches in keys', () => {
        // SENSITIVE_KEYS = ['prompt', 'input', 'api_key', 'token', 'password', 'secret', 'credential'];
        // logic: key.toLowerCase().includes(k)

        const url = '/api?my_secret_value=123';
        const redacted = redactUrl(url, BASE_URL);
        expect(redacted).toContain('my_secret_value=%5BREDACTED%5D');
    });
});
