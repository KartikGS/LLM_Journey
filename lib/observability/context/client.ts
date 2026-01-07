'use client';

import { ClientLogContext } from "@/types/logs";

export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    const key = '__llm_journey_session_id__';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
        if (typeof crypto?.randomUUID === 'function') {
            sessionId = crypto.randomUUID();
        }
        else {
            sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
        sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
}

// Generate request ID for current request
export function generateRequestId(): string {
    if (typeof crypto?.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    else {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
}

export function getSessionContext(): ClientLogContext | {} {
    if (typeof window === "undefined") return {};

    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
    };
}