# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Seu codex não está sozinho.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[Guia de integração OpenClaw](./docs/openclaw-integration.pt.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Camada de orquestração multiagente para [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Novidades na v0.9.0 — Spark Initiative

Spark Initiative é a versão que fortalece o caminho nativo de exploração e inspeção no OMK.

- **Harness nativo para `omk explore`** — executa exploração de repositório somente leitura com uma via em Rust mais rápida e mais restrita.
- **`omk sparkshell`** — superfície nativa voltada ao operador, com resumos de saídas longas e captura explícita de painéis tmux.
- **Assets nativos multiplataforma** — o caminho de hidratação de `omk-explore-harness`, `omk-sparkshell` e `native-release-manifest.json` agora faz parte do pipeline de release.
- **CI/CD reforçado** — adiciona configuração explícita de Rust no job `build`, além de `cargo fmt --check` e `cargo clippy -- -D warnings`.

Veja também as [notas de release da v0.9.0](./docs/release-notes-0.9.0.md) e o [corpo do release](./docs/release-body-0.9.0.md).

## Primeira sessão

Dentro do Codex:

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Do terminal:

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Fluxo recomendado

1. `$deep-interview` — quando escopo ou limites ainda não estão claros.
2. `$ralplan` — para transformar esse escopo esclarecido em um plano aprovado de arquitetura e implementação.
3. `$team` ou `$ralph` — use `$team` para execução paralela coordenada, ou `$ralph` para um loop persistente de conclusão/verificação com um único responsável.

## Modelo central

OMK instala e conecta estas camadas:

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (cérebro de orquestração)
    -> ~/.codex/prompts/*.md (catálogo de prompts de agentes)
    -> ~/.codex/skills/*/SKILL.md (catálogo de skills)
    -> ~/.codex/config.toml (funcionalidades, notificações, MCP)
    -> .omk/ (estado de execução, memória, planos, logs)
```

## Comandos principais

```bash
omk                # Iniciar Codex (+ HUD no tmux quando disponível)
omk setup          # Instalar prompts/skills/config por escopo + .omk do projeto + AGENTS.md específico do escopo
omk doctor         # Diagnósticos de instalação/execução
omk doctor --team  # Diagnósticos de Team/swarm
omk team ...       # Iniciar/status/retomar/encerrar workers tmux da equipe
omk status         # Mostrar modos ativos
omk cancel         # Cancelar modos de execução ativos
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (fluxo de trabalho de extensão de plugins)
omk hud ...        # --watch|--json|--preset
omk help
```

## Extensão de Hooks (Superfície adicional)

OMK agora inclui `omk hooks` para scaffolding e validação de plugins.

- `omk tmux-hook` continua sendo suportado e não foi alterado.
- `omk hooks` é aditivo e não substitui os fluxos de trabalho do tmux-hook.
- Arquivos de plugins ficam em `.omk/hooks/*.mjs`.
- Plugins estão desativados por padrão; ative com `OMK_HOOK_PLUGINS=1`.

Consulte `docs/hooks-extension.md` para o fluxo de trabalho completo de extensões e modelo de eventos.

## Flags de inicialização

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # apenas para setup
```

`--madmax` mapeia para Codex `--dangerously-bypass-approvals-and-sandbox`.
Use apenas em ambientes sandbox confiáveis ou externos.

### Política de workingDirectory MCP (endurecimento opcional)

Por padrão, as ferramentas MCP de state/memory/trace aceitam o `workingDirectory` fornecido pelo chamador.
Para restringir isso, defina uma lista de raízes permitidas:

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Quando definido, valores de `workingDirectory` fora dessas raízes são rejeitados.

## Controle de prompts Codex-First

Por padrão, OMK injeta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Isso combina o `AGENTS.md` de `CODEX_HOME` com o `AGENTS.md` do projeto (se existir) e depois adiciona o overlay de runtime.
Estende o comportamento do Codex, mas não substitui nem contorna as políticas centrais do sistema Codex.

Controles:

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # desativar injeção de AGENTS.md
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Modo equipe

Use o modo equipe para trabalhos amplos que se beneficiam de workers paralelos.

Ciclo de vida:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandos operacionais:

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Regra importante: não encerre enquanto tarefas estiverem em estado `in_progress`, a menos que esteja abortando.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Seleção de Worker CLI para workers da equipe:

```bash
OMK_TEAM_WORKER_CLI=auto    # padrão; usa claude quando worker --model contém "claude"
OMK_TEAM_WORKER_CLI=codex   # forçar workers Kimi Code CLI
OMK_TEAM_WORKER_CLI=claude  # forçar workers Claude CLI
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # mix de CLI por worker (comprimento=1 ou quantidade de workers)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # opcional: desativar fallback adaptativo queue->resend
```

Notas:
- Argumentos de inicialização de workers são compartilhados via `OMK_TEAM_WORKER_LAUNCH_ARGS`.
- `OMK_TEAM_WORKER_CLI_MAP` sobrescreve `OMK_TEAM_WORKER_CLI` para seleção por worker.
- O envio de triggers usa retentativas adaptativas por padrão (queue/submit, depois fallback seguro clear-line+resend quando necessário).
- No modo Claude worker, OMK inicia workers como `claude` simples (sem argumentos extras de inicialização) e ignora substituições explícitas de `--model` / `--config` / `--effort` para que o Claude use o `settings.json` padrão.

## O que `omk setup` grava

- `.omk/setup-scope.json` (escopo de instalação persistido)
- Instalações dependentes do escopo:
  - `user`: `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project`: `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Comportamento de inicialização: se o escopo persistido for `project`, o lançamento do `omk` usa automaticamente `CODEX_HOME=./.codex` (a menos que `CODEX_HOME` já esteja definido).
- As instruções de inicialização combinam `~/.codex/AGENTS.md` (ou `CODEX_HOME/AGENTS.md`, quando sobrescrito) com o `./AGENTS.md` do projeto e depois adicionam o overlay de runtime.
- Arquivos `AGENTS.md` existentes nunca são sobrescritos silenciosamente: em TTY interativo o setup pergunta antes de substituir; em modo não interativo a substituição é ignorada, a menos que você use `--force` (verificações de segurança de sessões ativas continuam valendo).
- Atualizações do `config.toml` (para ambos os escopos):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entradas de servidores MCP (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- `AGENTS.md` específico do escopo
- Diretórios `.omk/` de execução e configuração do HUD

## Agentes e skills

- Prompts: `prompts/*.md` (instalados em `~/.codex/prompts/` para `user`, `./.codex/prompts/` para `project`)
- Skills: `skills/*/SKILL.md` (instalados em `~/.codex/skills/` para `user`, `./.codex/skills/` para `project`)

Exemplos:
- Agentes: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `deep-interview`, `ralplan`, `team`, `ralph`, `plan`, `cancel`

## Estrutura do projeto

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

## Desenvolvimento

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Documentação

- **[Documentação completa](https://github.com/wang-h/oh-my-kimi#readme)** — Guia completo
- **[Referência CLI](https://github.com/wang-h/oh-my-kimi#command-reference)** — Todos os comandos `omk`, flags e ferramentas
- **[Guia de notificações](https://github.com/wang-h/oh-my-kimi#notifications)** — Configuração de Discord, Telegram, Slack e webhooks
- **[Fluxos de trabalho recomendados](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Cadeias de skills testadas em batalha para tarefas comuns
- **[Notas de versão](https://github.com/wang-h/oh-my-kimi#release-notes)** — Novidades em cada versão

## Notas

- Log de alterações completo: `CHANGELOG.md`
- Guia de migração (pós-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Notas de cobertura e paridade: `COVERAGE.md`
- Fluxo de trabalho de extensão de hooks: `docs/hooks-extension.md`
- Detalhes de instalação e contribuição: `CONTRIBUTING.md`

## Agradecimentos

Inspirado em [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adaptado para Kimi Code CLI.

## Licença

MIT
