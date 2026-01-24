import { parseArgs } from '@/lib/otel/logger';

describe('parseArgs', () => {
    it('returns message when called with a string', () => {
        const result = parseArgs('hello world');

        expect(result).toEqual({
            message: 'hello world',
        });
    });

    it('returns attributes and message when called with (attributes, message)', () => {
        const attrs = { userId: '123', success: true };

        const result = parseArgs(attrs, 'operation completed');

        expect(result).toEqual({
            message: 'operation completed',
            attributes: attrs,
        });
    });

    it('uses default message when attributes are provided without a message', () => {
        const attrs = { retry: 3 };

        const result = parseArgs(attrs);

        expect(result).toEqual({
            message: '[log]',
            attributes: attrs,
        });
    });

    it('does not mutate the attributes object', () => {
        const attrs = { count: 1 };
        const original = { ...attrs };

        parseArgs(attrs, 'test');

        expect(attrs).toEqual(original);
    });
});
