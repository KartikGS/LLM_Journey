import { NextRequest, NextResponse } from 'next/server';
import { loggerServer } from '@/lib/utils/logger/server';
import { ClientLogPayload } from '@/types/logs';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const data: ClientLogPayload = await req.json();
    switch (data.level) {
        case 'error':
            loggerServer.error(data.message, data.error);
            break;
        case 'warn':
            loggerServer.warn(data.message);
            break;
        case 'info':
            loggerServer.info(data.message);
            break;
    }

    return NextResponse.json({ success: true });
}
