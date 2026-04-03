# Plan: Chat2Response v2 Bug Fixes & Minor Enhancements

**Source of Truth:** `.omk/specs/deep-interview-chat2response.md`  
**Target Project:** `/Users/hao/chat2response-v2`  
**Generated:** 2026-04-03  
**Mode:** Ralplan Consensus — Short (Iteration 2)

---

## Requirements Summary

Conduct a comprehensive review of `chat2response-v2` to identify and fix bugs, with authority to perform minor enhancements and small-scale refactoring. Must preserve backward compatibility of `/v1/responses` and `/v1/chat/completions` endpoints. Success is measured by clean build, passing `test-streaming.js`, and verified correctness of provider transformations and streaming behavior.

---

## RALPLAN-DR Summary

### Principles
1. **Fix root causes, not symptoms** — prefer structural fixes over band-aids.
2. **Preserve API compatibility** — existing `/v1/responses` and `/v1/chat/completions` behavior must remain unchanged for non-buggy paths.
3. **Minimal surface area** — keep changes tight to the identified bugs; avoid architectural churn.
4. **Evidence-based verification** — every fix must be justified by a concrete failure mode and validated by build + tests.
5. **Enhance only where it removes ambiguity** — minor enhancements should reduce error rates or improve correctness, not add scope.

### Decision Drivers
1. **Correctness of OpenAI Responses API event contract** — streaming responses must emit all required events, including tool calls.
2. **Provider-specific request integrity** — transformations must not silently drop fields required for multi-turn behavior.
3. **Developer experience** — model listing and model-name matching should be predictable and not surprise users.

### Viable Options

#### Option A: Surgical bug fixes only
- Fix streaming tool-call emission.
- Fix GLM/MiniMax `tool_call_id` preservation.
- Tighten Kimi model matching.
- **Pros:** Minimal risk, fastest to verify, zero API surface change.
- **Cons:** Leaves `/v1/models` and MiniMax naming inconsistencies unaddressed.

#### Option B: Bug fixes + targeted enhancements
- All fixes from Option A.
- Add a `models` array to `ProviderConfig` (defaulting to `[defaultModel]`) so `/v1/models` can iterate it.
- Unify MiniMax naming logic and remove dead code.
- **Pros:** Better DX, fewer foot-guns, aligns with "minor enhancements" authorization, avoids lying about model availability.
- **Cons:** Slightly larger diff than Option A, but still reviewable in a single pass.

#### Option C: Refactor converter into a class-based state machine
- Extract streaming state into a dedicated `StreamConverter` class.
- **Pros:** Easier to extend, cleaner separation.
- **Cons:** Unnecessary for current scope; higher regression risk; violates minimal-surface-area principle.

**Chosen:** **Option B** — the task explicitly authorizes minor enhancements, and Option B fixes known inconsistencies without major structural changes. Option C is invalidated because the current functional style already works for non-buggy paths, and a class refactor would add regression risk without fixing a root cause. Option A is viable but leaves known UX rough edges.

---

## Implementation Steps

### Step 1 — Audit & catalog issues
- **Files:** `src/converter.ts`, `src/providers/index.ts`, `src/app.ts`
- **Actions:**
  1. Confirm streaming tool calls are accumulated but never emitted (lines 452–466 in `converter.ts`).
  2. Confirm GLM and MiniMax transforms drop `tool_call_id` from `role: 'tool'` messages.
  3. Confirm Kimi model check uses `.includes('kimi')` (line 67, `providers/index.ts`).
  4. Confirm `mapModelName` is unused dead code.
  5. Confirm `/v1/models` only returns one entry per provider.
- **Output:** A short bug catalog comment block at the top of the PR (not in source files).

### Step 2 — Fix streaming tool-call support
- **File:** `src/converter.ts`
- **Actions:**
  1. Extend `StreamState` to track an array of completed tool calls.
  2. When `choice.delta.tool_calls` is received, accumulate arguments. On `finish_reason === 'tool_calls'` (or stream end), emit the proper Response API events:
     - `response.output_item.added` for each tool call
     - `response.function_call_arguments.delta` for argument chunks
     - `response.function_call_arguments.done` when finished
     - `response.output_item.done` for each tool call
  3. **Interleaving rule:** if a single delta contains both `content` and `tool_calls`, emit text deltas first, then tool-call deltas, maintaining the overall stream order.
  4. Ensure `response.completed` still fires after all tool-call events.
- **Verification:** `test-streaming.js` must still pass. Additionally, a tool-call streaming request must emit the exact sequence:
  1. `response.output_item.added`
  2. `response.function_call_arguments.delta` (one or more)
  3. `response.function_call_arguments.done`
  4. `response.output_item.done`
  5. `response.completed`

### Step 3 — Fix provider-specific message transformations
- **File:** `src/providers/index.ts`
- **Actions:**
  1. In GLM `transformRequest`, when flattening messages to strings, preserve `tool_call_id` for `role: 'tool'` messages.
  2. In MiniMax `transformRequest`, preserve `tool_call_id` for `role: 'tool'` messages.
- **Verification:** Add a lightweight inline verification script `test-transforms.js` that imports `transformRequest` for GLM and MiniMax, passes a mock `role: 'tool'` message with `tool_call_id`, and asserts the `tool_call_id` is preserved. Run it as part of the verification step.

### Step 4 — Tighten model-name matching and remove dead code
- **File:** `src/providers/index.ts`
- **Actions:**
  1. Change Kimi check from `.includes('kimi')` to `.startsWith('kimi')`.
  2. Delete the unused `mapModelName` function entirely.
- **Verification:** `npm run build` passes; grep `src/` confirms `mapModelName` is gone.

### Step 5 — Minimal enhancement to `/v1/models`
- **Files:** `src/providers/index.ts`, `src/app.ts`
- **Actions:**
  1. Add a `models: string[]` field to each `ProviderConfig`, defaulting to `[provider.defaultModel]`.
  2. Update `/v1/models` in `src/app.ts` to iterate `provider.models ?? [provider.defaultModel]` instead of only the default.
- **Verification:** Endpoint returns the default model(s) per provider; JSON shape matches OpenAI `list` format. No broad hard-coded catalog is added.

### Step 6 — Build, test, and regression check
- **Actions:**
  1. Run `npm run build` — must pass with zero TypeScript errors.
  2. Run `node test-streaming.js` — must produce the expected 10-event sequence for text-only streams.
  3. Run `node test-transforms.js` — must assert `tool_call_id` preservation for GLM and MiniMax.
  4. Do a quick static review of `src/app.ts` to ensure `/v1/responses` and `/v1/chat/completions` signatures are unchanged.
  5. Run a quick smoke test: start the server briefly and curl `/health` and `/v1/models`.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tool-call streaming events mismatch OpenAI spec | High | Emit events in the exact order documented; verify event sequence manually with a tool-call test. |
| Provider transforms accidentally break non-tool calls | Medium | Preserve original message shape for `user`/`assistant`/`system` roles; only add `tool_call_id` for `tool` role. |
| `/v1/models` enhancement breaks client parsing | Low | Keep `id`, `object`, `created`, `owned_by` fields exactly as before; only add more list entries when a provider legitimately has multiple models. |
| `npm run build` fails after changes | Low | Fix all TypeScript errors iteratively; no new dependencies required. |

---

## Verification Steps

1. `cd /Users/hao/chat2response-v2 && npm run build` → exit 0, zero errors.
2. `node test-streaming.js` → prints expected event sequence 1–10 and "Test completed!".
3. `node test-transforms.js` → passes assertions for GLM and MiniMax `tool_call_id` preservation.
4. `node -e "require('./dist/app').listen(3456, () => { console.log('ok'); process.exit(0); })"` → server boots.
5. Manual inspection of diff confirms:
   - No changes to public endpoint URL paths.
   - No changes to request/response JSON schemas for existing successful flows.
   - `mapModelName` is removed.

---

## ADR (Architecture Decision Record)

### Decision
Adopt Option B (surgical fixes + targeted enhancements) and keep the functional converter style rather than a class-based refactor. Specifically:
- Do not populate a broad hard-coded model catalog; only add the `models` array structure defaulting to `[defaultModel]`.
- Remove unused `mapModelName` dead code rather than fixing it.

### Drivers
- User explicitly authorized minor enhancements.
- Known bugs have narrow, well-understood root causes.
- A large refactor would delay delivery and increase regression risk without improving correctness.

### Alternatives Considered
- **Option A (fixes only):** Rejected because it would leave predictable DX issues (`/v1/models` uselessness, MiniMax naming inconsistency).
- **Option C (class refactor):** Rejected because it introduces unnecessary structural churn.

### Consequences
- Slightly larger diff than Option A, but still reviewable in a single pass.
- No new dependencies.
- API compatibility preserved.

### Follow-ups
- If future providers need complex transformation pipelines, reconsider a class-based converter.
- If OpenAI updates the Responses API event spec, revisit streaming event generation.

---

## Available-Agent-Types Roster & Follow-up Staffing

### For `$ralph` (recommended for this scope)
- **executor** × 1: performs the code edits across `converter.ts`, `providers/index.ts`, `app.ts`.
- **verifier** × 1: runs `npm run build`, `test-streaming.js`, `test-transforms.js`, and smoke tests; validates diff against acceptance criteria.
- **Suggested reasoning:** Standard for executor, Standard for verifier.

### For `$team` (viable if user wants faster parallel lanes)
- **Lane 1 — converter fixes:** executor focused on `converter.ts` streaming tool-call logic.
- **Lane 2 — provider fixes:** executor focused on `providers/index.ts` transforms and model listing.
- **Lane 3 — verification:** verifier runs build/tests and checks API compatibility.
- **Launch hint:** `omk team --plan .omk/plans/chat2response-bugfix-plan.md`
- **Team verification path:** All lanes merge; verifier runs full build + test + smoke test before shutdown.

### Recommended Path
Use `$ralph` because the task is a single codebase with sequential dependencies (provider config changes must be in place before endpoint changes compile).
