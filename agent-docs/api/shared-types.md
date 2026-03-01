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

## Frontier Base Generate
```typescript
interface FrontierBaseGenerateRequest {
  prompt: string;
}

interface FrontierBaseGenerateMetadata {
  label: 'Frontier Base Model';
  modelId: string;
  assistantTuned: false;
  adaptation: 'none';
  note: string;
}

interface FrontierBaseGenerateLiveResponse {
  mode: 'live';
  output: string;
  metadata: FrontierBaseGenerateMetadata;
}

interface FrontierBaseGenerateFallbackResponse {
  mode: 'fallback';
  output: string;
  reason: {
    code:
      | 'missing_config'
      | 'invalid_config'
      | 'quota_limited'
      | 'timeout'
      | 'upstream_auth'
      | 'upstream_error'
      | 'invalid_provider_response'
      | 'empty_provider_output';
    message: string;
  };
  metadata: FrontierBaseGenerateMetadata;
}

interface FrontierBaseGenerateErrorResponse {
  error: {
    code: 'invalid_json' | 'invalid_prompt';
    message: string;
  };
}
```
