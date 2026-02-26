# Handoff: Tech Lead → Frontend Agent

## Subject
`CR-021 — Frontier and Adaptation Response Streaming: Frontend Implementation`

## Status
`issued`

## Pre-Replacement Check (Conversation Freshness)
- Prior content: `CR-017` (`Small Backlog Fixes: Transformers Heading Copy Rename`)
- Evidence 1 (plan artifact exists): `agent-docs/plans/CR-017-plan.md` ✓
- Evidence 2 (prior CR closed): `CR-017` status `Completed` per `agent-docs/project-log.md` ✓
- Result: replacement allowed.

---

## Execution Mode
`feature-ui`

---

## Objective

Replace the buffered `await response.json()` call in both `FrontierBaseChat.tsx` and `AdaptationChat.tsx` with an SSE stream reader that renders tokens progressively as they arrive from the server. The server now returns `Content-Type: text/event-stream` for successful live-path responses.

The existing JSON fallback/error paths (non-200 responses and pre-stream fallback JSON) remain completely unchanged.

---

## Known Environmental Caveats

- **Node.js runtime**: System runtime may be below `>=20.x`. Run `node -v` first. If below 20.x, activate via `nvm use 20`. If nvm unavailable, classify as `environmental` in your report.
- **pnpm**: Use `pnpm` exclusively.

---

## Confirmed SSE Protocol (from Backend Agent — verified by Tech Lead)

The routes now emit typed SSE events to the client. Frontend must handle exactly these four event types:

```
event: start
data: {"mode":"live","metadata":{...}}

event: token
data: {"text":" hello"}

event: done
data: {}

event: error
data: {"code":"timeout"|"upstream_error","message":"..."}
```

**Contract rules (Backend-confirmed):**
- `start` is always emitted before the first `token`.
- `token` events preserve whitespace exactly (`text` field may begin with a space).
- Exactly one `done` event per stream — emitted on upstream `[DONE]`, on output cap (4000 chars), or on natural stream end. Never follows an `error`.
- `error` is emitted on mid-stream read failure. No `done` follows.
- Client detection: `response.headers.get('content-type')` containing `'text/event-stream'` → SSE. `'application/json'` → existing JSON fallback (unchanged).

**`start` metadata shapes:**
- Frontier: `{ label: string, modelId: string, assistantTuned: false, adaptation: 'none', note: string }`
- Adaptation: `{ strategy: string, modelId: string }`

**Pre-stream error paths (non-200 or non-streaming OK):** unchanged — still return `NextResponse.json()` with the existing fallback/error shape. No SSE events emitted for these paths.

---

## Files to Modify

1. `app/foundations/transformers/components/FrontierBaseChat.tsx`
2. `app/models/adaptation/components/AdaptationChat.tsx`

---

## State Model Change

**Remove** `isLoading: boolean` (lines 38 / 92).

**Add** two new state variables in its place:
```ts
const [isStreaming, setIsStreaming] = useState(false);
const [hasFirstToken, setHasFirstToken] = useState(false);
```

`hasGeneratedText` **stays** — it continues to track output visibility for the JSON fallback/live paths.

State machine:
| Event | `isStreaming` | `hasFirstToken` | `hasGeneratedText` | Effect |
|---|---|---|---|---|
| Submit | `true` | reset `false` | reset `false` | Loader shown |
| SSE `start` | (unchanged) | (unchanged) | (unchanged) | Update `modelId` from metadata |
| SSE first `token` | (unchanged) | `true` | (unchanged) | Loader → output area; cursor appears |
| SSE subsequent `token` | (unchanged) | (unchanged) | (unchanged) | Append `text` to output |
| SSE `done` | `false` | (unchanged) | (unchanged) | Cursor removed; finalize `statusText` |
| SSE `error` | `false` | (unchanged) | (unchanged) | Cursor removed; set error status/statusText |
| JSON fallback/live (non-SSE) | `false` (set in `finally`) | (unchanged) | `true` (existing path) | Output shown; no cursor |

**Input/button `disabled` condition:** `disabled={isLoading}` → `disabled={isStreaming}` (all occurrences).

**`handleInputChange` guard** (FrontierBaseChat line 54 / AdaptationChat line 120):
```ts
if (hasGeneratedText && !isLoading) {  →  if ((hasGeneratedText || hasFirstToken) && !isStreaming) {
```

**`sampleInput` / `handleSamplePrompt` / `handleTabChange`:** also reset `hasFirstToken`:
```ts
setHasFirstToken(false);
```
(Add alongside existing `setHasGeneratedText(false)` calls in each reset function.)

---

## Implementation: `onSubmit` Changes

### Step 1 — Replace submit state initialization

**FrontierBaseChat** (around line 74):
```ts
// Remove:
setIsLoading(true);
// Add:
setIsStreaming(true);
setHasFirstToken(false);
```

**AdaptationChat** (around line 140): same change.

### Step 2 — Replace the response handling block

**Current structure (both components):**
```ts
try {
  const response = await fetch(...);
  let payload: unknown;
  try {
    payload = await response.json();  // ← REPLACE THIS BLOCK
  } catch { ... }
  if (!response.ok) { ... }
  // live/fallback payload handling
} catch (error) { ... }
finally {
  setIsLoading(false);  // ← REPLACE
}
```

**New structure:**
```ts
try {
  const response = await fetch(...);

  // Non-200: same JSON error path — UNCHANGED
  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      setStatus('error');
      setStatusText('...(existing unreadable JSON message)...');
      setOutput('');
      setHasGeneratedText(false);
      return;
    }
    const payloadRecord = toRecord(payload);
    // ...existing !response.ok error handling unchanged...
    return;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('text/event-stream')) {
    // Non-streaming OK: same JSON live/fallback path — UNCHANGED
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      setStatus('error');
      setStatusText('...(existing unreadable JSON message)...');
      setOutput('');
      setHasGeneratedText(false);
      return;
    }
    const payloadRecord = toRecord(payload);
    // ...existing outputText/metadata/mode handling unchanged...
    return;
  }

  // SSE streaming path
  await readSseStream(response);

} catch (error) {
  setStatus('error');
  setStatusText(`Request failed: ${getErrorMessage(error)}`);
  setOutput('');
  setHasGeneratedText(false);
  setHasFirstToken(false);
} finally {
  setIsStreaming(false);  // ← replaces setIsLoading(false)
}
```

### Step 3 — Implement `readSseStream`

Define as a local `async function` inside `onSubmit` (or as a helper inside the component — your choice, as long as it closes over the state setters). This function must handle the four SSE event types:

```ts
async function readSseStream(response: Response): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  // For statusText finalization on done — capture modelId locally
  let streamModelId = 'model-unknown';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          let data: Record<string, unknown> = {};
          try { data = JSON.parse(dataStr); } catch { continue; }

          if (currentEvent === 'start') {
            const metadata = toRecord(data.metadata);
            const mid = typeof metadata?.modelId === 'string' ? metadata.modelId : 'model-unknown';
            streamModelId = mid;
            setModelId(mid);
            // mode is always 'live' for SSE — no status text change yet
          } else if (currentEvent === 'token') {
            const text = typeof data.text === 'string' ? data.text : '';
            if (text) {
              setHasFirstToken(true);
              setOutput((prev) => prev + text);
            }
          } else if (currentEvent === 'done') {
            setStatus('live');
            // FrontierBaseChat:
            setStatusText(`Mode: live. Response came from configured frontier base model (${streamModelId}).`);
            // AdaptationChat:
            // setStatusText(`Mode: live. Response from ${streamModelId}.`);
            return;
          } else if (currentEvent === 'error') {
            const message = typeof data.message === 'string' ? data.message : 'Streaming was interrupted.';
            setStatus('error');
            setStatusText(message);
            setOutput('');
            setHasFirstToken(false);
            return;
          }
          currentEvent = '';
        }
      }
    }
  } finally {
    try { reader.releaseLock(); } catch { /* already released */ }
  }
}
```

**Note on statusText strings — use exact existing formats:**
- Frontier `done`: `Mode: live. Response came from configured frontier base model (${streamModelId}).`
- Adaptation `done`: `Mode: live. Response from ${streamModelId}.`

These match the existing JSON live-path statusText strings in each component exactly.

---

## Render Changes

### Loader condition

**Current** (FrontierBaseChat line 279, AdaptationChat line 417):
```tsx
{isLoading ? (
  <span ...>Querying frontier endpoint...</span>
```

**New:**
```tsx
{isStreaming && !hasFirstToken ? (
  <span ...>Querying frontier endpoint...</span>
```

### Output area + cursor

**Current** (FrontierBaseChat lines 284–289, AdaptationChat lines 422–427):
```tsx
) : hasGeneratedText ? (
  <p ...>{output}</p>
  <span className="animate-pulse inline-block w-2 h-4 bg-emerald-300 ml-1 align-middle" />
```

**New:**
```tsx
) : (hasGeneratedText || hasFirstToken) ? (
  <p ...>{output}</p>
  {isStreaming && hasFirstToken && (
    <span className="animate-pulse inline-block w-2 h-4 bg-emerald-300 ml-1 align-middle" />
  )}
```

Cursor is shown only during active streaming after the first token; removed on `done`/`error` (both set `isStreaming = false` via `finally`).

### Submit button icon

**Current** (FrontierBaseChat line 255, AdaptationChat line 393):
```tsx
{isLoading ? <Loader2 .../> : <Send .../>}
```

**New:**
```tsx
{isStreaming ? <Loader2 .../> : <Send .../>}
```

---

## `data-testid` Contracts — All Preserved (AC-12)

No `data-testid` values may be renamed, removed, or added. Required contracts:

**Frontier:** `frontier-form`, `frontier-input`, `frontier-submit`, `frontier-output`, `frontier-status`

**Adaptation:** `adaptation-chat`, `adaptation-chat-tab-{full-finetuning,lora-peft,prompt-prefix}`, `adaptation-chat-input`, `adaptation-chat-submit`, `adaptation-chat-form`, `adaptation-chat-output`, `adaptation-chat-status`

Confirm each still present in your report.

---

## Input Disabled During Full Streaming Duration (AC-9, AC-10)

After replacing `disabled={isLoading}` → `disabled={isStreaming}`, both input and submit button must remain disabled for the entire duration of streaming (from submit until `done` or `error`). The `finally` block setting `setIsStreaming(false)` ensures re-enable on completion.

---

## Out-of-Scope

- Do NOT change any styling, layout, copy, or accessibility attributes beyond what is specified.
- Do NOT add, remove, or rename any `data-testid`.
- Do NOT modify route files, test files, config files, or any file outside the two component files.
- Do NOT add `console.log` statements, TODO markers, or debug artifacts.
- Do NOT change the JSON fallback path behavior — it must be bit-for-bit identical to the current path for non-SSE responses.

---

## Assumptions to Validate (Mandatory)

1. `FrontierBaseChat.tsx` line 89: `payload = await response.json()` — confirm before editing.
2. `AdaptationChat.tsx` line 155: `payload = await response.json()` — confirm before editing.
3. `isLoading` is the only boolean controlling `disabled` on all inputs/buttons — confirm no other loading flag.
4. `hasGeneratedText` is used in both render and `handleInputChange` guard — confirm it is not redundant with any other existing state.

---

## Definition of Done

- [ ] AC-2: `FrontierBaseChat` renders tokens progressively into `data-testid="frontier-output"`
- [ ] AC-4: `AdaptationChat` renders tokens progressively into `data-testid="adaptation-chat-output"`
- [ ] AC-5: Blinking cursor visible in frontier output during streaming; removed on completion
- [ ] AC-6: Blinking cursor visible in adaptation output during streaming; removed on completion
- [ ] AC-7: Frontier "Querying frontier endpoint..." loader shown until first token; transitions on first token
- [ ] AC-8: Adaptation "Querying adaptation endpoint..." loader shown until first token; transitions on first token
- [ ] AC-9: `frontier-submit` and `frontier-input` disabled for full streaming duration; re-enabled on done/error
- [ ] AC-10: `adaptation-chat-submit` and `adaptation-chat-input` disabled for full streaming duration; re-enabled on done/error
- [ ] AC-11: Mid-stream error surfaces error status and message in status area; no cursor shown
- [ ] AC-12: All existing `data-testid` contracts preserved without rename
- [ ] AC-13: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` all pass

---

## Clarification Loop

Post preflight concerns to `agent-docs/conversations/frontend-to-tech-lead.md`. Tech Lead responds in the same file.

---

## Verification

Run in sequence under Node 20:
```
node -v
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

All must pass. Cite exact file:line in your report for:
- The replaced `await response.json()` in each component
- The new `isStreaming` + `hasFirstToken` state declarations

---

## Scope Extension Control

If any feedback expands implementation beyond this handoff scope, mark it `scope extension requested` in your report. Wait for explicit `scope extension approved` from Tech Lead before implementing expanded work.

---

## Report Back

Write completion report to `agent-docs/conversations/frontend-to-tech-lead.md` using `agent-docs/conversations/TEMPLATE-frontend-to-tech-lead.md`.

Status vocabulary: `in_progress` | `completed` | `blocked` | `partial` | `needs_environment_verification`
