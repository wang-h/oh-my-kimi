# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Tu codex no está solo.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[Guía de integración de OpenClaw](./docs/openclaw-integration.es.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Capa de orquestación multiagente para [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Novedades en v0.9.0 — Spark Initiative

Spark Initiative es la versión que refuerza la ruta nativa de exploración e inspección en OMK.

- **Harness nativo para `omk explore`** — ejecuta exploración de repositorio en modo solo lectura con una vía Rust más rápida y más estricta.
- **`omk sparkshell`** — superficie nativa para operadores, con resúmenes de salidas largas y captura explícita de paneles tmux.
- **Assets nativos multiplataforma** — la ruta de hidratación de `omk-explore-harness`, `omk-sparkshell` y `native-release-manifest.json` ya forma parte del pipeline de release.
- **CI/CD reforzado** — se añadió configuración explícita de Rust en el job `build`, además de `cargo fmt --check` y `cargo clippy -- -D warnings`.

Consulta también las [notas de lanzamiento v0.9.0](./docs/release-notes-0.9.0.md) y el [release body](./docs/release-body-0.9.0.md).

## Primera sesión

Dentro de Codex:

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Desde la terminal:

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Flujo recomendado

1. `$deep-interview` — cuando el alcance o los límites aún no están claros.
2. `$ralplan` — para convertir ese alcance aclarado en un plan acordado de arquitectura e implementación.
3. `$team` o `$ralph` — usa `$team` para ejecución paralela coordinada, o `$ralph` para un bucle persistente de finalización/verificación con un solo responsable.

## Modelo central

OMK instala y conecta estas capas:

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (cerebro de orquestación)
    -> ~/.codex/prompts/*.md (catálogo de prompts de agentes)
    -> ~/.codex/skills/*/SKILL.md (catálogo de skills)
    -> ~/.codex/config.toml (características, notificaciones, MCP)
    -> .omk/ (estado en ejecución, memoria, planes, registros)
```

## Comandos principales

```bash
omk                # Lanzar Codex (+ HUD en tmux cuando está disponible)
omk setup          # Instalar prompts/skills/config por alcance + .omk del proyecto + AGENTS.md específico del alcance
omk doctor         # Diagnósticos de instalación/ejecución
omk doctor --team  # Diagnósticos de Team/swarm
omk team ...       # Iniciar/estado/reanudar/apagar workers tmux del equipo
omk status         # Mostrar modos activos
omk cancel         # Cancelar modos de ejecución activos
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (flujo de trabajo de extensión de plugins)
omk hud ...        # --watch|--json|--preset
omk help
```

## Extensión de Hooks (Superficie adicional)

OMK ahora incluye `omk hooks` para scaffolding y validación de plugins.

- `omk tmux-hook` sigue siendo compatible y no ha cambiado.
- `omk hooks` es aditivo y no reemplaza los flujos de trabajo de tmux-hook.
- Los archivos de plugins se encuentran en `.omk/hooks/*.mjs`.
- Los plugins están desactivados por defecto; actívalos con `OMK_HOOK_PLUGINS=1`.

Consulta `docs/hooks-extension.md` para el flujo de trabajo completo de extensiones y el modelo de eventos.

## Flags de inicio

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # solo para setup
```

`--madmax` se mapea a Codex `--dangerously-bypass-approvals-and-sandbox`.
Úsalo solo en entornos sandbox de confianza o externos.

### Política de workingDirectory MCP (endurecimiento opcional)

Por defecto, las herramientas MCP de state/memory/trace aceptan el `workingDirectory` proporcionado por el llamador.
Para restringir esto, establece una lista de raíces permitidas:

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Cuando se establece, los valores de `workingDirectory` fuera de estas raíces son rechazados.

## Control de prompts Codex-First

Por defecto, OMK inyecta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Esto combina el `AGENTS.md` de `CODEX_HOME` con el `AGENTS.md` del proyecto (si existe) y luego añade la superposición de runtime.
Extiende el comportamiento de Codex, pero no reemplaza ni elude las políticas centrales del sistema Codex.

Controles:

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # desactivar inyección de AGENTS.md
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Modo equipo

Usa el modo equipo para trabajo amplio que se beneficia de workers paralelos.

Ciclo de vida:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandos operacionales:

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Regla importante: no apagues mientras las tareas estén en estado `in_progress` a menos que estés abortando.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Selección de Worker CLI para los workers del equipo:

```bash
OMK_TEAM_WORKER_CLI=auto    # predeterminado; usa claude cuando worker --model contiene "claude"
OMK_TEAM_WORKER_CLI=codex   # forzar workers Kimi Code CLI
OMK_TEAM_WORKER_CLI=claude  # forzar workers Claude CLI
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # mezcla de CLI por worker (longitud=1 o cantidad de workers)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # opcional: desactivar fallback adaptativo queue->resend
```

Notas:
- Los argumentos de inicio de workers se comparten a través de `OMK_TEAM_WORKER_LAUNCH_ARGS`.
- `OMK_TEAM_WORKER_CLI_MAP` anula `OMK_TEAM_WORKER_CLI` para selección por worker.
- El envío de triggers usa reintentos adaptativos por defecto (queue/submit, luego fallback seguro clear-line+resend cuando es necesario).
- En modo Claude worker, OMK lanza workers como `claude` simple (sin argumentos de inicio extra) e ignora anulaciones explícitas de `--model` / `--config` / `--effort` para que Claude use el `settings.json` predeterminado.

## Qué escribe `omk setup`

- `.omk/setup-scope.json` (alcance de instalación persistido)
- Instalaciones dependientes del alcance:
  - `user`: `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project`: `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Comportamiento de inicio: si el alcance persistido es `project`, el lanzamiento de `omk` usa automáticamente `CODEX_HOME=./.codex` (a menos que `CODEX_HOME` ya esté establecido).
- Las instrucciones de inicio combinan `~/.codex/AGENTS.md` (o `CODEX_HOME/AGENTS.md` si se sobrescribe) con `./AGENTS.md` del proyecto y luego añaden la superposición de runtime.
- Los archivos `AGENTS.md` existentes nunca se sobrescriben silenciosamente: en TTY interactivo se pregunta antes de reemplazar; en modo no interactivo se omite salvo que pases `--force` (las verificaciones de seguridad de sesiones activas siguen aplicándose).
- Actualizaciones de `config.toml` (para ambos alcances):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entradas de servidores MCP (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- `AGENTS.md` específico del alcance
- Directorios `.omk/` de ejecución y configuración de HUD

## Agentes y skills

- Prompts: `prompts/*.md` (instalados en `~/.codex/prompts/` para `user`, `./.codex/prompts/` para `project`)
- Skills: `skills/*/SKILL.md` (instalados en `~/.codex/skills/` para `user`, `./.codex/skills/` para `project`)

Ejemplos:
- Agentes: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `deep-interview`, `ralplan`, `team`, `ralph`, `plan`, `cancel`

## Estructura del proyecto

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

## Desarrollo

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Documentación

- **[Documentación completa](https://github.com/wang-h/oh-my-kimi#readme)** — Guía completa
- **[Referencia CLI](https://github.com/wang-h/oh-my-kimi#command-reference)** — Todos los comandos `omk`, flags y herramientas
- **[Guía de notificaciones](https://github.com/wang-h/oh-my-kimi#notifications)** — Configuración de Discord, Telegram, Slack y webhooks
- **[Flujos de trabajo recomendados](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Cadenas de skills probadas en batalla para tareas comunes
- **[Notas de versión](https://github.com/wang-h/oh-my-kimi#release-notes)** — Novedades en cada versión

## Notas

- Registro de cambios completo: `CHANGELOG.md`
- Guía de migración (post-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Notas de cobertura y paridad: `COVERAGE.md`
- Flujo de trabajo de extensión de hooks: `docs/hooks-extension.md`
- Detalles de instalación y contribución: `CONTRIBUTING.md`

## Agradecimientos

Inspirado en [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adaptado para Kimi Code CLI.

## Licencia

MIT
