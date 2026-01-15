// This token is not meant to authenticate users.
// It only limits anonymous telemetry ingestion abuse.

import crypto from 'crypto';
import { timingSafeEqual } from 'crypto';

const TELEMETRY_SECRET = process.env.TELEMETRY_SECRET || 'default_secret_change_me_in_production';
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function generateTelemetryToken(sessionId: string): string {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payload = JSON.stringify({ sessionId, expiresAt });
    const signature = crypto
        .createHmac('sha256', TELEMETRY_SECRET)
        .update(payload)
        .digest('hex');

    return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

export function validateTelemetryToken(token: string, sessionId: string): boolean {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const { payload, signature } = decoded;

        const expectedSignature = crypto
            .createHmac('sha256', TELEMETRY_SECRET)
            .update(payload)
            .digest('hex');


        const sigOk = timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );

        if (!sigOk) return false;

        // if (signature !== expectedSignature) {
        //     return false;
        // }

        const { sessionId: tokenSessionId, expiresAt } = JSON.parse(payload);

        if (tokenSessionId !== sessionId) {
            return false;
        }

        if (Date.now() > expiresAt) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}
