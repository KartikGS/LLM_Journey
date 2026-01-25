import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { generateTelemetryToken } from '@/lib/otel/token';
import { getTelemetryTokenRequestsCounter, safeMetric } from '@/lib/otel/metrics';

export async function GET(req: NextRequest) {
    safeMetric(() => getTelemetryTokenRequestsCounter().add(1));

    let sessionId = req.cookies.get('anon_session')?.value;

    if (!sessionId) {
        sessionId = crypto.randomUUID();
    }

    const token = generateTelemetryToken(sessionId);

    const res = NextResponse.json({ token });

    // Persist anonymous session
    res.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });

    return res;
}
