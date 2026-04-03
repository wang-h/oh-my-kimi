# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Start Kimi stronger, then let OMK add better prompts, workflows, and runtime help when the work grows.</em>
</p>

[![GitHub repo](https://img.shields.io/badge/GitHub-wang--h%2Foh--my--kimi-black)](https://github.com/wang-h/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

**GitHub:** https://github.com/wang-h/oh-my-kimi  
**Website:** https://wang-h.github.io/oh-my-kimi-website/  
**Docs:** [Getting Started](./docs/getting-started.html) · [Agents](./docs/agents.html) · [Skills](./docs/skills.html) · [Integrations](./docs/integrations.html) · [Demo](./DEMO.md) · [OpenClaw guide](./docs/openclaw-integration.md)

> **Attribution:** oh-my-kimi is a Kimi-first fork derived from [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex). The original project and upstream design work are credited to **Yeachan-Heo**.
>
> **Fork note:** this fork is maintained by **hao** (`wang-h`). The porting, branding, and adaptation work for oh-my-kimi was carried out on top of the oh-my-codex foundation, with substantial execution help from **OpenAI Codex / Codex CLI workflows** during the migration process.

> **Port status:** this repository is now the Kimi-first fork. The main runtime, setup path, and focused verification suite have been moved to Kimi-first behavior. For the current compatibility boundary and unsupported disclosures, see the [oh-my-kimi v1 compatibility guide](./docs/oh-my-kimi-v1-compatibility.md).

OMK is a workflow layer for Kimi Code CLI.
`omk` is the primary command name; `omk` is currently kept as a compatibility alias during migration.

> **Kimi CLI command note:** Kimi Code CLI does not natively guarantee the `$ralplan` / `$deep-interview` / `$team` / `$ralph` shorthand syntax. In practice, the most reliable way to invoke OMK workflows inside Kimi is with explicit skill commands such as `/skill:ralplan ...`, `/skill:deep-interview ...`, `/skill:team ...`, and `/skill:ralph ...`. Use `$name` shorthands only when your current Kimi environment explicitly supports them.

It keeps Kimi Code CLI as the execution engine and makes it easier to:
- start a stronger Kimi session by default
- run one consistent workflow from clarification to completion
- invoke the canonical skills with `$deep-interview`, `$ralplan`, `$team`, and `$ralph`
- keep project guidance, plans, logs, and state in `.omk/`

## Recommended default flow

If you want the default OMK experience, start here:

```bash
npm install -g oh-my-kimi
omk setup
omk --madmax --high
```

Then work inside Kimi Code CLI using the reliable explicit skill entrypoints:

```text
/skill:deep-interview clarify the authentication change
/skill:ralplan approve the auth plan and review tradeoffs
/skill:ralph carry the approved plan to completion
/skill:team 3:executor "execute the approved plan in parallel"
```

That is the main path.
Start OMK strongly, clarify first when needed, approve the plan, then choose `$team` for coordinated parallel execution or `$ralph` for the persistent completion loop.

## What OMK is for

Use OMK if you already like Kimi Code and want a better day-to-day runtime around it:
- a standard workflow built around `$deep-interview`, `$ralplan`, `$team`, and `$ralph`
- specialist roles and supporting skills when the task needs them
- project guidance through scoped `AGENTS.md`
- durable state under `.omk/` for plans, logs, memory, and mode tracking

If you want plain Kimi Code CLI with no extra workflow layer, you probably do not need OMK.

## Quick start

### Requirements

- Node.js 20+
- Kimi Code CLI installed
- Kimi authentication configured
- `tmux` on macOS/Linux if you later want the durable team runtime
- `psmux` on native Windows if you later want Windows team mode

### A good first session

Launch OMK the recommended way:

```bash
omk --madmax --high
```

Then try the canonical workflow via explicit skill calls:

```text
/skill:deep-interview clarify the authentication change
/skill:ralplan approve the safest implementation path
/skill:ralph carry the approved plan to completion
/skill:team 3:executor "execute the approved plan in parallel"
```

Use `$team` when the approved plan needs coordinated parallel work, or `$ralph` when one persistent owner should keep pushing to completion.

## A simple mental model

OMK does **not** replace Kimi Code CLI.

It adds a better working layer around it:
- **Kimi Code CLI** does the actual agent work
- **OMK role keywords** make useful roles reusable
- **OMK skills** make common workflows reusable
- **`.omk/`** stores plans, logs, memory, and runtime state

Most users should think of OMK as **better task routing + better workflow + better runtime**, not as a command surface to operate manually all day.

## Start here if you are new

1. Run `omk setup`
2. Launch with `omk --madmax --high`
3. Use `/skill:deep-interview ...` when the request or boundaries are still unclear
4. Use `/skill:ralplan ...` to approve the plan and review tradeoffs
5. Choose `/skill:team ...` for coordinated parallel execution or `/skill:ralph ...` for persistent completion loops

## Recommended workflow

1. `/skill:deep-interview` — clarify scope when the request or boundaries are still vague.
2. `/skill:ralplan` — turn that clarified scope into an approved architecture and implementation plan.
3. `/skill:team` or `/skill:ralph` — use `/skill:team` for coordinated parallel execution, or `/skill:ralph` when you want a persistent completion loop with one owner.

## Common in-session surfaces

| Surface | Use it for |
| --- | --- |
| `/skill:deep-interview ...` | clarifying intent, boundaries, and non-goals |
| `/skill:ralplan ...` | approving the implementation plan and tradeoffs |
| `/skill:ralph ...` | persistent completion and verification loops |
| `/skill:team ...` | coordinated parallel execution when the work is big enough |
| `/skills` | browsing installed skills and supporting helpers |

## Advanced / operator surfaces

These are useful, but they are not the main onboarding path.

### Team runtime

Use the team runtime when you specifically need durable tmux/worktree coordination, not as the default way to begin using OMK.

```bash
omk team 3:executor "fix the failing tests with verification"
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

### Setup, doctor, and HUD

These are operator/support surfaces:
- `omk setup` installs prompts, skills, config, and AGENTS scaffolding
- `omk doctor` verifies the install when something seems wrong
- `omk hud --watch` is a monitoring/status surface, not the primary user workflow
- `omk ...` still works as a temporary alias while the port is being cleaned up

### Explore and sparkshell

- `omk explore --prompt "..."` is for read-only repository lookup
- `omk sparkshell <command>` is for shell-native inspection and bounded verification

Examples:

```bash
omk explore --prompt "find where team state is written"
omk sparkshell git status
omk sparkshell --tmux-pane %12 --tail-lines 400
```

### Platform notes for team mode

`omk team` needs a tmux-compatible backend:

| Platform | Install |
| --- | --- |
| macOS | `brew install tmux` |
| Ubuntu/Debian | `sudo apt install tmux` |
| Fedora | `sudo dnf install tmux` |
| Arch | `sudo pacman -S tmux` |
| Windows | `winget install psmux` |
| Windows (WSL2) | `sudo apt install tmux` |

## Known issues

### Intel Mac: high `syspolicyd` / `trustd` CPU during startup

On some Intel Macs, OMK startup — especially with `--madmax --high` — can spike `syspolicyd` / `trustd` CPU usage while macOS Gatekeeper validates many concurrent process launches.

If this happens, try:
- `xattr -dr com.apple.quarantine $(which omk)`
- adding your terminal app to the Developer Tools allowlist in macOS Security settings
- using lower concurrency (for example, avoid `--madmax --high`)

## Documentation

- [Getting Started](./docs/getting-started.html)
- [Demo guide](./DEMO.md)
- [Agent catalog](./docs/agents.html)
- [Skills reference](./docs/skills.html)
- [Integrations](./docs/integrations.html)
- [OpenClaw / notification gateway guide](./docs/openclaw-integration.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Languages

- [English](./README.md)
- [한국어](./README.ko.md)
- [日本語](./README.ja.md)
- [简体中文](./README.zh.md)
- [繁體中文](./README.zh-TW.md)
- [Tiếng Việt](./README.vi.md)
- [Español](./README.es.md)
- [Português](./README.pt.md)
- [Русский](./README.ru.md)
- [Türkçe](./README.tr.md)
- [Deutsch](./README.de.md)
- [Français](./README.fr.md)
- [Italiano](./README.it.md)
- [Ελληνικά](./README.el.md)
- [Polski](./README.pl.md)

## Contributors

| Role | Name | GitHub |
| --- | --- | --- |
| Original creator | Yeachan Heo | [@Yeachan-Heo](https://github.com/Yeachan-Heo) |
| Kimi fork maintainer | wang-h | [@wang-h](https://github.com/wang-h) |

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=wang-h/oh-my-kimi&type=date&legend=top-left)](https://www.star-history.com/#wang-h/oh-my-kimi&type=date&legend=top-left)

## License

MIT
