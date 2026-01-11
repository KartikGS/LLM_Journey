import pino from 'pino';
import { context, trace } from '@opentelemetry/api';
import path from 'path';

// Log file path - writes to ./logs/app.log for Alloy to collect
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'app.log');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    base: {
        service_name: 'llm-journey-server',
    },

    formatters: {
        log(object) {
            const span = trace.getSpan(context.active());
            if (!span) return object;

            const spanContext = span.spanContext();

            return {
                ...object,
                trace_id: spanContext.traceId,
                span_id: spanContext.spanId,
            };
        },
    },

    transport: {
        targets: [
            // Console output for development
            {
                target: 'pino/file',
                level: 'info',
                options: { destination: 1 }, // stdout
            },
            // File output for Alloy to collect
            {
                target: 'pino/file',
                level: 'info',
                options: { destination: LOG_FILE_PATH, mkdir: true },
            },
        ],
    },
});

export default logger;
