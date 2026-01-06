import { LogLevel } from '@/types/logs';

export const logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

export function shouldLog(
    level: LogLevel,
    configuredLevel: LogLevel
): boolean {
    return logLevelPriority[level] >= logLevelPriority[configuredLevel];
}
