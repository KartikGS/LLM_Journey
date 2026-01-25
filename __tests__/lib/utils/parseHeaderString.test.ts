import { parseHeaderString } from '@/lib/utils/parseHeaderString';

describe('parseHeaderString', () => {
    it('should return empty object for empty input', () => {
        expect(parseHeaderString('')).toEqual({});
        expect(parseHeaderString(undefined)).toEqual({});
    });

    it('should treat empty quoted value as empty and ignore by default', () => {
        expect(parseHeaderString('key=""')).toEqual({});
    });


    it('should parse simple key-value pairs', () => {
        const input = 'key1=value1, key2=value2';
        const expected = {
            key1: 'value1',
            key2: 'value2',
        };
        expect(parseHeaderString(input)).toEqual(expected);
    });

    it('should handle quoted values', () => {
        const input = 'key1="value 1", key2="value, 2"';
        const expected = {
            key1: 'value 1',
            key2: 'value, 2',
        };
        expect(parseHeaderString(input)).toEqual(expected);
    });

    it('should handle escaped quotes within quoted values', () => {
        const input = 'message="Hello \\"World\\""';
        const expected = {
            message: 'Hello "World"',
        };
        expect(parseHeaderString(input)).toEqual(expected);
    });

    it('should handle values containing equal signs', () => {
        const input = 'Authorization="Bearer token=123"';
        const expected = {
            Authorization: 'Bearer token=123',
        };
        expect(parseHeaderString(input)).toEqual(expected);
    });

    it('should ignore empty values by default', () => {
        const input = 'key1=value1, key2=';
        const expected = {
            key1: 'value1',
        };
        expect(parseHeaderString(input)).toEqual(expected);
    });

    describe('strict mode', () => {
        it('should throw error for invalid format', () => {
            expect(() => parseHeaderString('invalid', { strict: true })).toThrow(
                'Invalid header format: "invalid"'
            );
        });

        it('should throw error for empty key', () => {
            expect(() => parseHeaderString('=value', { strict: true })).toThrow(
                'Header key is empty in "=value"'
            );
        });

        it('should throw error for empty value when allowEmptyValues is false', () => {
            expect(() => parseHeaderString('key=', { strict: true })).toThrow(
                'Header "key" has an empty value'
            );
        });
    });

    describe('options', () => {
        it('should allow empty values when allowEmptyValues is true', () => {
            const input = 'key1=, key2=value2';
            const expected = {
                key1: '',
                key2: 'value2',
            };
            expect(parseHeaderString(input, { allowEmptyValues: true })).toEqual(expected);
        });
    });
});
