import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

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

    //   transport: {
    //     target: 'pino-pretty',
    //     options: {
    //       colorize: true,
    //     },
    //   },
});

export default logger;
