This document is for people new to this project to understand the security architecture and implementation.

In-Memory IP-based Rate Limiting is applied in the middleware.ts. We are also checking the content lenght of request body depending on the path in which the request is applied which is defined in the config. 
We perform Nonce generation for CSP. 

In route api/otel/trace content lenght check by reading stream using functionality defined contentLength.ts. Short lived telemetry token created for client traces which are verified in the handler.

Redacting Sensitive information configure in otel initialization.

Due to App Router limitations, Next.js-managed scripts and styles cannot be fully nonced. This CSP setup prioritizes script execution safety while allowing framework-managed styles.