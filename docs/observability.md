This document is for people new to this project to understand the observability architecture and implementation.

Observability is implemented in this project using Traces, metrics and logs which are stored in Grafana tempo, prometheus and grafana loki respectfully. The telemetry is configured using opentelemetry instrumentation. The telemetry is sent to an onpentelemetry collector, from which the forwarded or scraped to their respective destinations. 

For local testing, docker is used to mock the telemetry setup. Grafana cloud is used for production use case.

NOTE: The docker setup is only meant for local testing and not for production deployment.