## Testing Philosophy

- Unit tests validate isolated logic and components
- Integration tests validate component interaction
- E2E tests validate user-critical flows

The project currently prioritizes:
- Correct rendering
- Basic user interaction
- Stability of critical paths

# Testing

This project uses **Jest** and **React Testing Library** for unit and integration testing.

## Unit Tests

We use Jest for unit testing. The configuration is located in `jest.config.ts`.

### Running Tests

- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`

### Test Structure

Tests are located in `__tests__` directories or next to the files they test (e.g. `ComponentName.test.tsx`).
We currently check for basic rendering and interactions.

## Future Plans

- Integration testing using React Testing Library (expanded coverage)
- E2E testing using Playwright
- Evals for LLMs