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

    it('should redact keys containing sensitive substrings', () => {
        // SENSITIVE_KEYS = ['prompt', 'input', 'api_key', 'token', 'password', 'secret', 'credential'];
        // logic: key.toLowerCase().includes(k)

        const url = '/api?my_secret_value=123';
        const redacted = redactUrl(url, BASE_URL);
        expect(redacted).toContain('my_secret_value=%5BREDACTED%5D');
    });

    it('should redact multiple values for the same sensitive key (collapses to single value)', () => {
        const url = '/api?token=a&token=b';
        const redacted = redactUrl(url, BASE_URL);

        const parsed = new URL(redacted);

        expect(parsed.searchParams.getAll('token')).toEqual(['[REDACTED]']);
    });


    it('should keep already redacted values redacted', () => {
        const url = '/api?token=[REDACTED]';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('token=%5BREDACTED%5D');
    });

    it('should preserve URL fragments while redacting query params', () => {
        const url = '/api?token=abc#section1';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('token=%5BREDACTED%5D');
        expect(redacted).toContain('#section1');
    });

    it('should redact sensitive params in absolute URLs', () => {
        const url = 'https://example.com/api?api_key=secret';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('https://example.com/api');
        expect(redacted).toContain('api_key=%5BREDACTED%5D');
    });

    it('should only redact sensitive params and leave others unchanged', () => {
        const url = '/api?query=hello&password=123&limit=10';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toContain('password=%5BREDACTED%5D');
        expect(redacted).toContain('query=hello');
        expect(redacted).toContain('limit=10');
    });

    it('should return original url for empty query string', () => {
        const url = '/api';
        const redacted = redactUrl(url, BASE_URL);

        expect(redacted).toBe(url);
    });

});
