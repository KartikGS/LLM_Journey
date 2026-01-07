import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

type CheckStatus = 'ok' | 'degraded' | 'failed';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    buildId: string;
    environment: string;
    checks: {
        api: CheckStatus;
        [key: string]: CheckStatus;
    };
}

export async function GET() {
    const checks: HealthStatus['checks'] = {
        api: process.uptime() > 0 ? 'ok' : 'failed',
    };

    // Determine overall status
    const hasFailures = Object.values(checks).some(status => status === 'failed');
    const hasDegraded = Object.values(checks).some(status => status === 'degraded');

    const status: HealthStatus['status'] = hasFailures
        ? 'unhealthy'
        : hasDegraded
            ? 'degraded'
            : 'healthy';

    const healthStatus: HealthStatus = {
        status,
        timestamp: new Date().toISOString(),
        version: config.observability.version,
        buildId: config.observability.buildId,
        environment: process.env.NODE_ENV || 'development',
        checks,
    };

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-store',
        }
    });
}

// Also support HEAD request for simple health checks
export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}

