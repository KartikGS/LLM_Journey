/**
 * Generic type guard: returns the value cast to Record<string, unknown> if it is
 * a non-null object, or null otherwise.
 *
 * Used to safely access dynamic JSON object properties without type assertions at
 * every call site.
 */
export function toRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}
