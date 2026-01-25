function splitRespectingQuotes(input: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        const prevChar = input[i - 1];

        if (char === '"' && prevChar !== "\\") {
            inQuotes = !inQuotes;
            current += char;
            continue;
        }

        if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
            continue;
        }

        current += char;
    }

    if (current) {
        result.push(current.trim());
    }

    return result;
}

function isQuoted(value: string): boolean {
    return value.startsWith('"') && value.endsWith('"');
}

function unquote(value: string): string {
    return value
        .slice(1, -1) // remove surrounding quotes
        .replace(/\\"/g, '"'); // unescape quotes
}


export type ParsedHeaders = Record<string, string>;

export interface ParseHeaderOptions {
    /**
     * Throw an error if an invalid header is encountered
     * instead of silently ignoring it.
     */
    strict?: boolean;

    /**
     * Allow empty values: key=
     * Default: false
     */
    allowEmptyValues?: boolean;
}

/**
 * Parses a comma-separated header string into an object.
 *
 * Supports:
 * - Quoted values: key="value, with, commas"
 * - Escaped quotes: key="some \"quoted\" value"
 * - Values containing '='
 *
 * Example:
 * Authorization="Bearer a=b=c", Content-Type=application/json
 */
export function parseHeaderString(
    headerStr?: string,
    options: ParseHeaderOptions = {}
): ParsedHeaders {
    const { strict = false, allowEmptyValues = false } = options;

    if (!headerStr || typeof headerStr !== "string") {
        return {};
    }

    const headers: ParsedHeaders = {};
    const pairs = splitRespectingQuotes(headerStr);

    for (const pair of pairs) {
        const [rawKey, ...rawValueParts] = pair.split("=");

        if (rawValueParts.length === 0) {
            if (strict) {
                throw new Error(`Invalid header format: "${pair}"`);
            }
            continue;
        }

        const key = rawKey.trim();
        let value = rawValueParts.join("=").trim();

        if (!key) {
            if (strict) {
                throw new Error(`Header key is empty in "${pair}"`);
            }
            continue;
        }

        // Remove surrounding quotes if present
        if (isQuoted(value)) {
            value = unquote(value);
        }

        if (!value && !allowEmptyValues) {
            if (strict) {
                throw new Error(`Header "${key}" has an empty value`);
            }
            continue;
        }

        headers[key] = value;
    }

    return headers;
}
