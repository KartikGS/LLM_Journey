// app/ClientBootstrap.tsx
"use client";

import { useEffect } from "react";
import { loggerClient } from "@/lib/observability/logger/client";
import { getSessionId } from "@/lib/observability/context/client";
import { getSessionContext } from "@/lib/observability/context/client";
import { initializeOpenTelemetryClient } from "@/lib/observability/otel/client";

export function ClientBootstrap() {
    useEffect(() => {
        // Initialize OpenTelemetry on client side
        initializeOpenTelemetryClient();

        const sessionId = getSessionId();

        loggerClient.info("Client session started", {
            sessionId,
            ...getSessionContext(),
        });
    }, []);

    return null;
}
