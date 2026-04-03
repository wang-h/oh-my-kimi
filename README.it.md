# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Il tuo codex non è solo.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[Guida all’integrazione OpenClaw](./docs/openclaw-integration.it.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Livello di orchestrazione multi-agente per [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Novità nella v0.9.0 — Spark Initiative

Spark Initiative è la release che rafforza il percorso nativo di esplorazione e ispezione in OMK.

- **Harness nativo per `omk explore`** — esegue l’esplorazione del repository in sola lettura tramite un percorso Rust più rapido e più rigoroso.
- **`omk sparkshell`** — superficie nativa per operatori con riepiloghi dell’output lungo e cattura esplicita dei pannelli tmux.
- **Asset nativi multipiattaforma** — il percorso di hydration per `omk-explore-harness`, `omk-sparkshell` e `native-release-manifest.json` ora fa parte della pipeline di release.
- **CI/CD rafforzato** — aggiunge la configurazione esplicita della toolchain Rust nel job `build`, oltre a `cargo fmt --check` e `cargo clippy -- -D warnings`.

Vedi anche le [note di rilascio v0.9.0](./docs/release-notes-0.9.0.md) e il [testo della release](./docs/release-body-0.9.0.md).

## Prima sessione

All'interno di Codex:

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Dal terminale:

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Flusso consigliato

1. `$deep-interview` — quando ambito o confini non sono ancora chiari.
2. `$ralplan` — per trasformare l’ambito chiarito in un piano approvato di architettura e implementazione.
3. `$team` o `$ralph` — usa `$team` per l’esecuzione parallela coordinata, oppure `$ralph` per un loop persistente di completamento/verifica con un solo responsabile.

## Modello di base

OMK installa e collega questi livelli:

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (cervello dell'orchestrazione)
    -> ~/.codex/prompts/*.md (catalogo prompt degli agenti)
    -> ~/.codex/skills/*/SKILL.md (catalogo skill)
    -> ~/.codex/config.toml (funzionalità, notifiche, MCP)
    -> .omk/ (stato di esecuzione, memoria, piani, log)
```

## Comandi principali

```bash
omk                # Avvia Codex (+ HUD in tmux se disponibile)
omk setup          # Installa prompt/skill/config per scope + .omk del progetto + AGENTS.md specifico dello scope
omk doctor         # Diagnostica installazione/esecuzione
omk doctor --team  # Diagnostica Team/Swarm
omk team ...       # Avvia/stato/riprendi/arresta i worker del team tmux
omk status         # Mostra le modalità attive
omk cancel         # Annulla le modalità di esecuzione attive
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (workflow estensione plugin)
omk hud ...        # --watch|--json|--preset
omk help
```

## Estensione Hooks (Superficie additiva)

OMK ora include `omk hooks` per lo scaffolding e la validazione dei plugin.

- `omk tmux-hook` resta supportato e invariato.
- `omk hooks` è additivo e non sostituisce i workflow tmux-hook.
- I file dei plugin si trovano in `.omk/hooks/*.mjs`.
- I plugin sono disattivati per impostazione predefinita; abilitali con `OMK_HOOK_PLUGINS=1`.

Consulta `docs/hooks-extension.md` per il workflow completo di estensione e il modello degli eventi.

## Flag di avvio

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # solo per setup
```

`--madmax` corrisponde a Codex `--dangerously-bypass-approvals-and-sandbox`.
Utilizzare solo in ambienti sandbox fidati/esterni.

### Policy MCP workingDirectory (hardening opzionale)

Per impostazione predefinita, gli strumenti MCP stato/memoria/trace accettano il `workingDirectory` fornito dal chiamante.
Per limitare questo, imposta una lista di directory root consentite:

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Quando impostato, i valori `workingDirectory` al di fuori di queste root vengono rifiutati.

## Controllo Codex-First dei prompt

Per impostazione predefinita, OMK inietta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Questo unisce l'`AGENTS.md` di `CODEX_HOME` con l'`AGENTS.md` del progetto (se presente) e poi aggiunge l'overlay di runtime.
Estende il comportamento di Codex, ma non sostituisce/aggira le policy di sistema core di Codex.

Controlli:

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # disabilita l'iniezione AGENTS.md
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Modalità team

Usa la modalità team per lavori ampi che beneficiano di worker paralleli.

Ciclo di vita:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandi operativi:

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Regola importante: non arrestare mentre i task sono ancora `in_progress`, a meno che non si stia abortendo.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Selezione CLI worker per i worker del team:

```bash
OMK_TEAM_WORKER_CLI=auto    # predefinito; usa claude quando worker --model contiene "claude"
OMK_TEAM_WORKER_CLI=codex   # forza i worker Kimi Code CLI
OMK_TEAM_WORKER_CLI=claude  # forza i worker Claude CLI
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # mix CLI per worker (lunghezza=1 o numero di worker)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # opzionale: disabilita il fallback adattivo queue->resend
```

Note:
- Gli argomenti di avvio dei worker sono ancora condivisi tramite `OMK_TEAM_WORKER_LAUNCH_ARGS`.
- `OMK_TEAM_WORKER_CLI_MAP` sovrascrive `OMK_TEAM_WORKER_CLI` per la selezione per singolo worker.
- L'invio dei trigger usa per impostazione predefinita tentativi adattivi (queue/submit, poi fallback sicuro clear-line+resend quando necessario).
- In modalità worker Claude, OMK avvia i worker come semplice `claude` (nessun argomento di avvio aggiuntivo) e ignora le sovrascritture esplicite `--model` / `--config` / `--effort` in modo che Claude usi il `settings.json` predefinito.

## Cosa scrive `omk setup`

- `.omk/setup-scope.json` (scope di setup persistito)
- Installazioni dipendenti dallo scope:
  - `user`: `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project`: `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Comportamento all'avvio: se lo scope persistito è `project`, l'avvio `omk` usa automaticamente `CODEX_HOME=./.codex` (a meno che `CODEX_HOME` non sia già impostato).
- Le istruzioni di avvio uniscono `~/.codex/AGENTS.md` (o `CODEX_HOME/AGENTS.md` se ridefinito) con `./AGENTS.md` del progetto, quindi aggiungono l'overlay di runtime.
- I file `AGENTS.md` esistenti non vengono mai sovrascritti in silenzio: in TTY interattivo il setup chiede prima di sostituire; in modalità non interattiva la sostituzione viene saltata salvo `--force` (i controlli di sicurezza della sessione attiva restano validi).
- Aggiornamenti `config.toml` (per entrambi gli scope):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Voci server MCP (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- `AGENTS.md` specifico dello scope
- Directory di esecuzione `.omk/` e configurazione HUD

## Agenti e Skill

- Prompt: `prompts/*.md` (installati in `~/.codex/prompts/` per `user`, `./.codex/prompts/` per `project`)
- Skill: `skills/*/SKILL.md` (installati in `~/.codex/skills/` per `user`, `./.codex/skills/` per `project`)

Esempi:
- Agenti: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skill: `deep-interview`, `ralplan`, `team`, `ralph`, `plan`, `cancel`

## Struttura del progetto

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

## Sviluppo

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Documentazione

- **[Documentazione completa](https://github.com/wang-h/oh-my-kimi#readme)** — Guida completa
- **[Riferimento CLI](https://github.com/wang-h/oh-my-kimi#command-reference)** — Tutti i comandi `omk`, flag e strumenti
- **[Guida alle notifiche](https://github.com/wang-h/oh-my-kimi#notifications)** — Configurazione Discord, Telegram, Slack e webhook
- **[Workflow consigliati](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Catene di skill collaudate per i compiti comuni
- **[Note di rilascio](https://github.com/wang-h/oh-my-kimi#release-notes)** — Novità di ogni versione

## Note

- Changelog completo: `CHANGELOG.md`
- Guida alla migrazione (post-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Note di copertura e parità: `COVERAGE.md`
- Workflow estensione hook: `docs/hooks-extension.md`
- Dettagli setup e contribuzione: `CONTRIBUTING.md`

## Ringraziamenti

Ispirato da [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adattato per Kimi Code CLI.

## Licenza

MIT
