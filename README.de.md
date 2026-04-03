# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Dein Codex ist nicht allein.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[OpenClaw-Integrationsleitfaden](./docs/openclaw-integration.de.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Multi-Agenten-Orchestrierungsschicht für [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Neu in v0.9.0 — Spark Initiative

Spark Initiative ist das Release, das den nativen Pfad für Exploration und Inspektion in OMK stärkt.

- **Nativer Harness für `omk explore`** — führt Read-only-Repository-Exploration über einen schnelleren und strengeren Rust-Pfad aus.
- **`omk sparkshell`** — native Operator-Oberfläche für Inspektion mit Zusammenfassungen langer Ausgaben und expliziter tmux-Pane-Erfassung.
- **Plattformübergreifende native Release-Artefakte** — der Hydration-Pfad für `omk-explore-harness`, `omk-sparkshell` und `native-release-manifest.json` ist jetzt Teil der Release-Pipeline.
- **Gehärtetes CI/CD** — ergänzt ein explizites Rust-Toolchain-Setup im `build`-Job sowie `cargo fmt --check` und `cargo clippy -- -D warnings`.

Siehe auch die [Release Notes zu v0.9.0](./docs/release-notes-0.9.0.md) und den [Release-Text](./docs/release-body-0.9.0.md).

## Erste Sitzung

Innerhalb von Codex:

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Vom Terminal:

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Empfohlener Workflow

1. `$deep-interview` — wenn Scope oder Grenzen noch unklar sind.
2. `$ralplan` — um daraus einen abgestimmten Architektur- und Umsetzungsplan zu machen.
3. `$team` oder `$ralph` — nutzen Sie `$team` für koordinierte parallele Ausführung oder `$ralph` für einen hartnäckigen Abschluss-/Verifikations-Loop mit einer verantwortlichen Instanz.

## Kernmodell

OMK installiert und verbindet diese Schichten:

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (Orchestrierungs-Gehirn)
    -> ~/.codex/prompts/*.md (Agenten-Prompt-Katalog)
    -> ~/.codex/skills/*/SKILL.md (Skill-Katalog)
    -> ~/.codex/config.toml (Features, Benachrichtigungen, MCP)
    -> .omk/ (Laufzeitzustand, Speicher, Pläne, Protokolle)
```

## Hauptbefehle

```bash
omk                # Codex starten (+ HUD in tmux wenn verfügbar)
omk setup          # Prompts/Skills/Config nach Bereich installieren + Projekt-.omk + bereichsspezifische AGENTS.md
omk doctor         # Installations-/Laufzeitdiagnose
omk doctor --team  # Team/Swarm-Diagnose
omk team ...       # tmux-Team-Worker starten/Status/fortsetzen/herunterfahren
omk status         # Aktive Modi anzeigen
omk cancel         # Aktive Ausführungsmodi abbrechen
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (Plugin-Erweiterungs-Workflow)
omk hud ...        # --watch|--json|--preset
omk help
```

## Hooks-Erweiterung (Additive Oberfläche)

OMK enthält jetzt `omk hooks` für Plugin-Gerüstbau und -Validierung.

- `omk tmux-hook` wird weiterhin unterstützt und ist unverändert.
- `omk hooks` ist additiv und ersetzt keine tmux-hook-Workflows.
- Plugin-Dateien befinden sich unter `.omk/hooks/*.mjs`.
- Plugins sind standardmäßig deaktiviert; aktivieren mit `OMK_HOOK_PLUGINS=1`.

Siehe `docs/hooks-extension.md` für den vollständigen Erweiterungs-Workflow und das Ereignismodell.

## Start-Flags

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # nur bei setup
```

`--madmax` entspricht Codex `--dangerously-bypass-approvals-and-sandbox`.
Nur in vertrauenswürdigen/externen Sandbox-Umgebungen verwenden.

### MCP workingDirectory-Richtlinie (optionale Härtung)

Standardmäßig akzeptieren MCP-Zustand/Speicher/Trace-Tools das vom Aufrufer bereitgestellte `workingDirectory`.
Um dies einzuschränken, setzen Sie eine Erlaubnisliste von Wurzelverzeichnissen:

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Wenn gesetzt, werden `workingDirectory`-Werte außerhalb dieser Wurzeln abgelehnt.

## Codex-First Prompt-Steuerung

Standardmäßig injiziert OMK:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Dies kombiniert `AGENTS.md` aus `CODEX_HOME` mit dem Projekt-`AGENTS.md` (falls vorhanden) und legt dann die Laufzeit-Überlagerung darüber.
Es erweitert das Codex-Verhalten, ersetzt/umgeht aber nicht die Codex-Kernsystemrichtlinien.

Steuerung:

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # AGENTS.md-Injektion deaktivieren
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Team-Modus

Verwenden Sie den Team-Modus für umfangreiche Arbeiten, die von parallelen Workern profitieren.

Lebenszyklus:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Operationelle Befehle:

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Wichtige Regel: Fahren Sie nicht herunter, während Aufgaben noch `in_progress` sind, es sei denn, Sie brechen ab.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Worker-CLI-Auswahl für Team-Worker:

```bash
OMK_TEAM_WORKER_CLI=auto    # Standard; verwendet claude wenn Worker --model "claude" enthält
OMK_TEAM_WORKER_CLI=codex   # Codex-CLI-Worker erzwingen
OMK_TEAM_WORKER_CLI=claude  # Claude-CLI-Worker erzwingen
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # CLI-Mix pro Worker (Länge=1 oder Worker-Anzahl)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # optional: adaptiven Queue->Resend-Fallback deaktivieren
```

Hinweise:
- Worker-Startargumente werden weiterhin über `OMK_TEAM_WORKER_LAUNCH_ARGS` geteilt.
- `OMK_TEAM_WORKER_CLI_MAP` überschreibt `OMK_TEAM_WORKER_CLI` für Worker-spezifische Auswahl.
- Trigger-Übermittlung verwendet standardmäßig adaptive Wiederholungsversuche (Queue/Submit, dann sicherer Clear-Line+Resend-Fallback bei Bedarf).
- Im Claude-Worker-Modus startet OMK Worker als einfaches `claude` (keine zusätzlichen Startargumente) und ignoriert explizite `--model` / `--config` / `--effort`-Überschreibungen, sodass Claude die Standard-`settings.json` verwendet.

## Was `omk setup` schreibt

- `.omk/setup-scope.json` (persistierter Setup-Bereich)
- Bereichsabhängige Installationen:
  - `user`: `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project`: `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Startverhalten: Wenn der persistierte Bereich `project` ist, verwendet `omk` automatisch `CODEX_HOME=./.codex` (sofern `CODEX_HOME` nicht bereits gesetzt ist).
- Startanweisungen kombinieren `~/.codex/AGENTS.md` (bzw. `CODEX_HOME/AGENTS.md`, wenn überschrieben) mit dem Projekt-`./AGENTS.md` und hängen anschließend die Runtime-Überlagerung an.
- Vorhandene `AGENTS.md`-Dateien werden nie stillschweigend überschrieben: Interaktive TTY-Läufe fragen vor dem Ersetzen, nicht-interaktive Läufe überspringen das Ersetzen ohne `--force` (aktive Sitzungs-Sicherheitsprüfungen gelten weiterhin).
- `config.toml`-Aktualisierungen (für beide Bereiche):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP-Server-Einträge (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- Bereichsspezifische `AGENTS.md`
- `.omk/`-Laufzeitverzeichnisse und HUD-Konfiguration

## Agenten und Skills

- Prompts: `prompts/*.md` (installiert nach `~/.codex/prompts/` für `user`, `./.codex/prompts/` für `project`)
- Skills: `skills/*/SKILL.md` (installiert nach `~/.codex/skills/` für `user`, `./.codex/skills/` für `project`)

Beispiele:
- Agenten: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `deep-interview`, `ralplan`, `team`, `ralph`, `plan`, `cancel`

## Projektstruktur

```text
oh-my-kimi/
  bin/omk.js
  src/
    cli/
    team/
    mcp/
    hooks/
    hud/
    config/
    modes/
    notifications/
    verification/
  prompts/
  skills/
  templates/
  scripts/
```

## Entwicklung

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Dokumentation

- **[Vollständige Dokumentation](https://github.com/wang-h/oh-my-kimi#readme)** — Kompletter Leitfaden
- **[CLI-Referenz](https://github.com/wang-h/oh-my-kimi#command-reference)** — Alle `omk`-Befehle, Flags und Tools
- **[Benachrichtigungs-Leitfaden](https://github.com/wang-h/oh-my-kimi#notifications)** — Discord, Telegram, Slack und Webhook-Einrichtung
- **[Empfohlene Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Praxiserprobte Skill-Ketten für häufige Aufgaben
- **[Versionshinweise](https://github.com/wang-h/oh-my-kimi#release-notes)** — Neuheiten in jeder Version

## Hinweise

- Vollständiges Änderungsprotokoll: `CHANGELOG.md`
- Migrationsleitfaden (nach v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Abdeckungs- und Paritätsnotizen: `COVERAGE.md`
- Hook-Erweiterungs-Workflow: `docs/hooks-extension.md`
- Setup- und Beitragsdetails: `CONTRIBUTING.md`

## Danksagungen

Inspiriert von [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), angepasst für Kimi Code CLI.

## Lizenz

MIT
