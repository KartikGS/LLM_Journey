# Shared Types

## Telemetry
```typescript
interface TelemetryEvent {
  name: string;
  attributes: Record<string, string | number>;
}
```

## LLM
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```
