# Project Documentation

This folder contains architecture, security, and development documentation
for this project.

The documentation is intended for:
- New contributors onboarding to the project
- Reviewers understanding architectural decisions
- Maintaining long-term consistency as the codebase grows

---

## Architecture

- [Observability](./architecture/observability.md)  
  Overview of the observability architecture, telemetry flow, and local vs
  production setup.

- [Security](./architecture/security.md)  
  Security architecture, threat considerations, and framework-specific
  tradeoffs.

---

## Development

- [Development Guidelines](./development/guidelines.md)  
  Coding practices, conventions, and cross-cutting concerns such as
  observability, security, UI consistency, and testing.

- [Testing](./development/testing.md)  
  Testing strategy, tools used, and future testing plans.

---

## Notes

- Local observability uses Docker for development only
- Production observability uses Grafana Cloud
- Documentation is maintained as code and should be updated alongside
  architectural or behavioral changes
