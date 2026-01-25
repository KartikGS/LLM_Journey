// ---- Mocks (must be hoisted) ----
jest.mock('@/lib/otel/metrics', () => ({
    getTelemetryTokenErrorsCounter: () => ({
        add: jest.fn(),
    }),
}));

jest.mock('@/lib/otel/logger', () => ({
    error: jest.fn(),
}));

const TEST_SECRET = 'test-telemetry-secret';
const SESSION_ID = 'session-123';

describe('Telemetry Token', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules(); // IMPORTANT
        process.env = {
            ...originalEnv,
            TELEMETRY_SECRET: TEST_SECRET,
        };

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
        process.env = originalEnv;
    });

    // ------------------------
    // generateTelemetryToken
    // ------------------------

    describe('generateTelemetryToken', () => {
        it('returns null if TELEMETRY_SECRET is not set', async () => {
            process.env.TELEMETRY_SECRET = undefined;

            const { generateTelemetryToken } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID);
            expect(token).toBeNull();
        });

        it('returns a base64 encoded token when secret is set', async () => {
            const { generateTelemetryToken } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(() =>
                Buffer.from(token!, 'base64').toString()
            ).not.toThrow();
        });

        it('embeds sessionId and expiresAt in the payload', async () => {
            const { generateTelemetryToken } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;

            const decoded = JSON.parse(
                Buffer.from(token, 'base64').toString()
            );

            const payload = JSON.parse(decoded.payload);

            expect(payload.sessionId).toBe(SESSION_ID);
            expect(payload.expiresAt).toBeGreaterThan(Date.now());
        });
    });

    // ------------------------
    // validateTelemetryToken
    // ------------------------

    describe('validateTelemetryToken', () => {
        it('returns true for a valid token and matching sessionId', async () => {
            const {
                generateTelemetryToken,
                validateTelemetryToken,
            } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;
            const result = validateTelemetryToken(token, SESSION_ID);

            expect(result).toBe(true);
        });

        it('returns false if sessionId does not match', async () => {
            const {
                generateTelemetryToken,
                validateTelemetryToken,
            } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;
            const result = validateTelemetryToken(token, 'wrong-session');

            expect(result).toBe(false);
        });

        it('returns false for an expired token', async () => {
            const {
                generateTelemetryToken,
                validateTelemetryToken,
            } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;

            jest.advanceTimersByTime(16 * 60 * 1000);

            expect(validateTelemetryToken(token, SESSION_ID)).toBe(false);
        });

        it('returns false if payload is tampered with', async () => {
            const {
                generateTelemetryToken,
                validateTelemetryToken,
            } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;

            const decoded = JSON.parse(
                Buffer.from(token, 'base64').toString()
            );

            const payload = JSON.parse(decoded.payload);
            payload.sessionId = 'attacker';

            decoded.payload = JSON.stringify(payload);

            const tamperedToken = Buffer.from(
                JSON.stringify(decoded)
            ).toString('base64');

            expect(validateTelemetryToken(tamperedToken, SESSION_ID)).toBe(false);
        });

        it('returns false if signature is invalid', async () => {
            const {
                generateTelemetryToken,
                validateTelemetryToken,
            } = await import('@/lib/otel/token');

            const token = generateTelemetryToken(SESSION_ID)!;

            const decoded = JSON.parse(
                Buffer.from(token, 'base64').toString()
            );

            decoded.signature = '0'.repeat(decoded.signature.length);

            const invalidToken = Buffer.from(
                JSON.stringify(decoded)
            ).toString('base64');

            expect(validateTelemetryToken(invalidToken, SESSION_ID)).toBe(false);
        });

        it('returns false for malformed tokens', async () => {
            const { validateTelemetryToken } = await import('@/lib/otel/token');

            expect(
                validateTelemetryToken('not-a-token', SESSION_ID)
            ).toBe(false);
        });
    });
});
