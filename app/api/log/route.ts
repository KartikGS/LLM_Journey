import { NextRequest, NextResponse } from 'next/server';

const AXIOM_API_TOKEN = process.env.AXIOM_API_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_URL = process.env.AXIOM_URL;

export async function POST(request: NextRequest) {
    if (!AXIOM_API_TOKEN || !AXIOM_DATASET || !AXIOM_URL) {
        return NextResponse.json({ error: 'Logging not configured' }, { status: 503 });
    }

    try {
        const logData = await request.json();

        // Forward to Axiom
        await fetch(`${AXIOM_URL}/${AXIOM_DATASET}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([logData]),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to forward log to Axiom:', error);
        return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
    }
}