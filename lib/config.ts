import { LogLevel } from '@/types/logs';

export const config = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    observability: {
        // Log levels
        logLevel: (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
        clientLogLevel: (process.env.CLIENT_LOG_LEVEL?.toLowerCase() as LogLevel) || (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'),
        
        // Sampling
        logSamplingRate: parseFloat(process.env.LOG_SAMPLING_RATE || '1.0'), // 0.0 to 1.0
        traceSamplingRate: parseFloat(process.env.TRACE_SAMPLING_RATE || '0.1'), // 0.0 to 1.0
        
        // Metrics
        metricsEnabled: process.env.METRICS_ENABLED !== 'false',
        metricsPrefix: process.env.METRICS_PREFIX || 'llm_journey',
        
        // Client logging
        clientLogBatchingEnabled: process.env.CLIENT_LOG_BATCHING !== 'false',
        clientLogBatchSize: parseInt(process.env.CLIENT_LOG_BATCH_SIZE || '10', 10),
        clientLogBatchDelay: parseInt(process.env.CLIENT_LOG_BATCH_DELAY || '5000', 10), // ms
        clientLogRetryAttempts: parseInt(process.env.CLIENT_LOG_RETRY_ATTEMPTS || '3', 10),
        clientLogRetryDelay: parseInt(process.env.CLIENT_LOG_RETRY_DELAY || '1000', 10), // ms
        
        // Version info
        version: process.env.APP_VERSION || process.env.npm_package_version || '0.1.0',
        buildId: process.env.NEXT_BUILD_ID || process.env.BUILD_ID || 'dev',
    },
};