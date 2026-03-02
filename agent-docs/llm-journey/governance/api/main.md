# API Contracts

This directory contains the source-of-truth descriptions for system interfaces.

## Contract Rules
- Every new or modified `/app/api/**` endpoint must have a matching contract doc in this directory.
- Route contract docs should follow `route-contract-template.md`.
- Keep contract docs provider-agnostic unless the route intentionally exposes provider-specific behavior.

## Index Maintenance
- The Backend agent is responsible for adding new entries to the Contents list below when a new route contract doc is created.
- The Tech Lead adversarial review must verify the Contents list is current before issuing the BA handoff. A missing entry is a blocking finding.

## Contents
-   `shared-types.md`: Common data structures used across Frontend and Backend.
-   `route-contract-template.md`: Required structure for per-route contract docs.
-   `frontier-base-generate.md`: Contract for `POST /api/frontier/base-generate`.
-   `adaptation-generate.md`: Contract for `POST /api/adaptation/generate`.
-   `openapi.yaml`: (Optional) Open API Specification.
