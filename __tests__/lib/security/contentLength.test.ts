import { validateContentLength } from '@/lib/security/contentLength';

describe('validateContentLength', () => {
    const MAX_SIZE = 1000;

    it('should return error if content-length is missing but required', () => {
        const result = validateContentLength(null, true, MAX_SIZE);
        expect(result).toEqual({
            valid: false,
            status: 411,
            error: 'Content-Length required',
        });
    });

    it('should return valid if content-length is missing and not required', () => {
        const result = validateContentLength(null, false, MAX_SIZE);
        expect(result).toEqual({
            valid: true,
            length: 0,
        });
    });

    it('should return valid for valid content-length', () => {
        const result = validateContentLength('500', true, MAX_SIZE);
        expect(result).toEqual({
            valid: true,
            length: 500,
        });
    });

    it('should return error for non-numeric content-length', () => {
        const result = validateContentLength('abc', true, MAX_SIZE);
        expect(result).toEqual({
            valid: false,
            status: 400,
            error: 'Invalid Content-Length',
        });
    });

    it('should return error if content-length exceeds max size', () => {
        const result = validateContentLength('1001', true, MAX_SIZE);
        expect(result).toEqual({
            valid: false,
            status: 413,
            error: 'Payload too large',
        });
    });

    it('should return error for negative content-length', () => {
        const result = validateContentLength('-1', true, MAX_SIZE);
        expect(result).toEqual({
            valid: false,
            status: 400,
            error: 'Invalid Content-Length',
        });
    });

    it('should return error for unsafe integer', () => {
         const unsafe = Number.MAX_SAFE_INTEGER + 1;
         const result = validateContentLength(unsafe.toString(), true, MAX_SIZE);
         // Even though it is larger than MAX_SIZE, it checks isSafeInteger first
         expect(result).toEqual({
             valid: false,
             status: 400,
             error: 'Invalid Content-Length',
         });
    });
});
