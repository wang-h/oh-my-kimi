# oh-my-kimi v1 compatibility and review guide

This document is the review-and-documentation lane artifact for the planned Kimi-first fork of `oh-my-codex`.
It is intentionally evidence-based: it distinguishes the **target v1 behavior** from the **current upstream-derived repository state** so the project does not over-claim parity before the provider-boundary work lands.

## Current repository state

The current checkout is partially migrated to Kimi-first behavior, but the documentation and some metadata still lag the implementation.
The review lane confirmed the current state below:

- `package.json` now identifies the package as `oh-my-kimi`, describes Kimi Code CLI, and exposes `omk` plus a temporary `omk` alias.
- `src/utils/paths.ts` now resolves provider paths through `.kimi` / `KIMI_HOME` with legacy `CODEX_HOME` fallback.
- `src/config/generator.ts` now emits Kimi-first top-level comments and developer instructions.
- `README.md` still documents a mostly Codex-first install and runtime story.
- `package.json` repository/homepage/bugs metadata still points to upstream `oh-my-codex` locations.
- `src/agents/native-config.ts` is still designed around Codex TOML agent generation.
- `src/team/runtime.ts` still assumes the in-product tmux-heavy team runtime exists.

## Local Kimi runtime evidence

Local `kimi --help` output confirms the following surfaces are available on the target runtime:

- `mcp`
- `plugin`
- `--agent-file`
- `--skills-dir`
- `--max-ralph-iterations`

These are the evidence-backed reasons the port can reasonably target skills, AGENTS-based orchestration, MCP/plugin integrations, and Ralph-style iteration on Kimi.

## Compatibility matrix

| Surface | Target v1 status | Current repo state | Review / documentation requirement |
| --- | --- | --- | --- |
| Skills discovery | adapted | path layer migrated; docs lag | Document Kimi skills discovery and any `--skills-dir` override story. |
| `AGENTS.md` orchestration contract | adapted | mixed | Preserve OMK workflow semantics, but retarget runtime wording to Kimi where appropriate. |
| `.omk/` persistence | supported | already portable | Keep `.omk/` state stable; do not move it into provider-specific homes. |
| Ralph loop semantics | adapted | evidence present; user docs lag | Tie the Kimi story to `--max-ralph-iterations` and keep unsupported claims out of user docs. |
| GitHub integration path | adapted | not yet documented clearly | Describe Kimi MCP/plugin parity as an integration path, not a guaranteed 1:1 clone of every existing workflow. |
| Native agents / subagents | adapted or unsupported | Codex-oriented implementation remains | Only claim support if Kimi agent-file generation is actually implemented; otherwise document the gap explicitly. |
| In-product `$team` runtime | unsupported unless proven otherwise | tmux/Codex-specific today | Separate the external OMK team workflow used to build this project from the product feature shipped to end users. |

## Provider-boundary review checklist

### Branding and packaging
- Rename project/package/install copy from `oh-my-codex` to `oh-my-kimi`.
- Replace OpenAI Codex CLI positioning with Kimi Code positioning.
- If a compatibility alias is kept, document `omk` as primary and explain the `omk` alias explicitly.

### Paths and setup
- Remove hardcoded `~/.codex` and `CODEX_HOME` assumptions from user-facing documentation unless they are part of a clearly named compatibility layer.
- Document the provider-resolved Kimi home/config/skills/agents locations.
- Keep `.omk/` project state described as stable and provider-agnostic.

### Generated config and instructions
- Ensure generated developer instructions stop describing Codex as the runtime target when Kimi is intended.
- Keep AGENTS/skills workflow language intact unless behavior truly changes.

### Unsupported and deferred areas
- Do not imply native-agent parity until Kimi agent-file generation exists and is validated.
- Do not imply in-product `$team` parity until there is evidence beyond the current tmux/Codex runtime.
- Prefer explicit `unsupported` notes over vague “coming soon” language when a surface is not ready.

## Documentation acceptance checklist

The documentation lane is ready to sign off when all of the following are true:

1. README/install docs are Kimi-first.
2. The compatibility matrix is present and linked from user-facing docs.
3. Unsupported or deferred surfaces are called out explicitly.
4. Path guidance explains what moves to Kimi-specific directories and what stays in `.omk/`.
5. Local validation evidence includes a captured `kimi --help` pass.
6. Docs do not advertise Codex-only behavior as if it already works on Kimi.

## Verification checklist for this migration lane

- `npm run build`
- `npm test`
- `npm run lint`
- setup/config smoke against the shipped CLI entrypoint
- `kimi --help`
- manual review of README + compatibility docs for naming and claim accuracy
