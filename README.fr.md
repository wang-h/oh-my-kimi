# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Votre codex n'est pas seul.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[Guide d’intégration OpenClaw](./docs/openclaw-integration.fr.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Couche d'orchestration multi-agents pour [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Nouveautés de la v0.9.0 — Spark Initiative

Spark Initiative est la version qui renforce la voie native d’exploration et d’inspection dans OMK.

- **Harness natif pour `omk explore`** — exécute l’exploration read-only du dépôt via une voie Rust plus rapide et plus stricte.
- **`omk sparkshell`** — surface native orientée opérateur, avec résumés de sorties longues et capture explicite de panneaux tmux.
- **Artifacts natifs multiplateformes** — le chemin d’hydratation de `omk-explore-harness`, `omk-sparkshell` et `native-release-manifest.json` fait désormais partie du pipeline de release.
- **CI/CD renforcé** — ajoute une configuration explicite de la toolchain Rust dans le job `build`, ainsi que `cargo fmt --check` et `cargo clippy -- -D warnings`.

Voir aussi les [notes de version v0.9.0](./docs/release-notes-0.9.0.md) et le [corps de release](./docs/release-body-0.9.0.md).

## Première session

Dans Codex :

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Depuis le terminal :

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Flux recommandé

1. `$deep-interview` — quand le périmètre ou les limites restent flous.
2. `$ralplan` — pour transformer ce périmètre clarifié en plan validé d’architecture et d’implémentation.
3. `$team` ou `$ralph` — utilisez `$team` pour une exécution parallèle coordonnée, ou `$ralph` pour une boucle persistante de finalisation/vérification avec un seul responsable.

## Modèle de base

OMK installe et connecte ces couches :

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (cerveau d'orchestration)
    -> ~/.codex/prompts/*.md (catalogue de prompts d'agents)
    -> ~/.codex/skills/*/SKILL.md (catalogue de skills)
    -> ~/.codex/config.toml (fonctionnalités, notifications, MCP)
    -> .omk/ (état d'exécution, mémoire, plans, journaux)
```

## Commandes principales

```bash
omk                # Lancer Codex (+ HUD dans tmux si disponible)
omk setup          # Installer prompts/skills/config par scope + .omk du projet + AGENTS.md propre au scope
omk doctor         # Diagnostics d'installation/exécution
omk doctor --team  # Diagnostics Team/Swarm
omk team ...       # Démarrer/statut/reprendre/arrêter les workers d'équipe tmux
omk status         # Afficher les modes actifs
omk cancel         # Annuler les modes d'exécution actifs
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (workflow d'extension de plugins)
omk hud ...        # --watch|--json|--preset
omk help
```

## Extension Hooks (Surface additive)

OMK inclut désormais `omk hooks` pour l'échafaudage et la validation de plugins.

- `omk tmux-hook` reste supporté et inchangé.
- `omk hooks` est additif et ne remplace pas les workflows tmux-hook.
- Les fichiers de plugins se trouvent dans `.omk/hooks/*.mjs`.
- Les plugins sont désactivés par défaut ; activez-les avec `OMK_HOOK_PLUGINS=1`.

Consultez `docs/hooks-extension.md` pour le workflow d'extension complet et le modèle d'événements.

## Flags de lancement

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # uniquement pour setup
```

`--madmax` correspond à Codex `--dangerously-bypass-approvals-and-sandbox`.
À utiliser uniquement dans des environnements sandbox de confiance/externes.

### Politique MCP workingDirectory (durcissement optionnel)

Par défaut, les outils MCP état/mémoire/trace acceptent le `workingDirectory` fourni par l'appelant.
Pour restreindre cela, définissez une liste d'autorisation de racines :

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Lorsque défini, les valeurs `workingDirectory` en dehors de ces racines sont rejetées.

## Contrôle Codex-First des prompts

Par défaut, OMK injecte :

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Cela fusionne le `AGENTS.md` de `CODEX_HOME` avec le `AGENTS.md` du projet (s'il existe), puis ajoute l'overlay d'exécution.
Cela étend le comportement de Codex, mais ne remplace/contourne pas les politiques système de base de Codex.

Contrôles :

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # désactiver l'injection AGENTS.md
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Mode équipe

Utilisez le mode équipe pour les travaux importants qui bénéficient de workers parallèles.

Cycle de vie :

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Commandes opérationnelles :

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Règle importante : n'arrêtez pas tant que des tâches sont encore `in_progress`, sauf en cas d'abandon.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Sélection du CLI worker pour les workers d'équipe :

```bash
OMK_TEAM_WORKER_CLI=auto    # par défaut ; utilise claude quand worker --model contient "claude"
OMK_TEAM_WORKER_CLI=codex   # forcer les workers Kimi Code CLI
OMK_TEAM_WORKER_CLI=claude  # forcer les workers Claude CLI
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # mix CLI par worker (longueur=1 ou nombre de workers)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # optionnel : désactiver le fallback adaptatif queue->resend
```

Notes :
- Les arguments de lancement des workers sont toujours partagés via `OMK_TEAM_WORKER_LAUNCH_ARGS`.
- `OMK_TEAM_WORKER_CLI_MAP` remplace `OMK_TEAM_WORKER_CLI` pour la sélection par worker.
- La soumission de déclencheurs utilise par défaut des tentatives adaptatives (queue/submit, puis fallback sécurisé clear-line+resend si nécessaire).
- En mode worker Claude, OMK lance les workers en tant que simple `claude` (pas d'arguments de lancement supplémentaires) et ignore les surcharges explicites `--model` / `--config` / `--effort` pour que Claude utilise le `settings.json` par défaut.

## Ce que `omk setup` écrit

- `.omk/setup-scope.json` (scope de setup persisté)
- Installations dépendantes du scope :
  - `user` : `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project` : `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Comportement au lancement : si le scope persisté est `project`, le lancement `omk` utilise automatiquement `CODEX_HOME=./.codex` (sauf si `CODEX_HOME` est déjà défini).
- Les instructions de lancement fusionnent `~/.codex/AGENTS.md` (ou `CODEX_HOME/AGENTS.md` s'il est redéfini) avec `./AGENTS.md` du projet, puis ajoutent l'overlay d'exécution.
- Les fichiers `AGENTS.md` existants ne sont jamais écrasés silencieusement : en TTY interactif, setup demande avant de remplacer ; en non-interactif, le remplacement est ignoré sauf avec `--force` (les vérifications de sécurité de session active s'appliquent toujours).
- Mises à jour de `config.toml` (pour les deux scopes) :
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entrées de serveurs MCP (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- `AGENTS.md` spécifique au scope
- Répertoires d'exécution `.omk/` et configuration HUD

## Agents et Skills

- Prompts : `prompts/*.md` (installés dans `~/.codex/prompts/` pour `user`, `./.codex/prompts/` pour `project`)
- Skills : `skills/*/SKILL.md` (installés dans `~/.codex/skills/` pour `user`, `./.codex/skills/` pour `project`)

Exemples :
- Agents : `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills : `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Structure du projet

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

## Développement

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Documentation

- **[Documentation complète](https://github.com/wang-h/oh-my-kimi#readme)** — Guide complet
- **[Référence CLI](https://github.com/wang-h/oh-my-kimi#command-reference)** — Toutes les commandes `omk`, flags et outils
- **[Guide des notifications](https://github.com/wang-h/oh-my-kimi#notifications)** — Configuration Discord, Telegram, Slack et webhooks
- **[Workflows recommandés](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Chaînes de skills éprouvées pour les tâches courantes
- **[Notes de version](https://github.com/wang-h/oh-my-kimi#release-notes)** — Nouveautés de chaque version

## Notes

- Journal des modifications complet : `CHANGELOG.md`
- Guide de migration (post-v0.4.4 mainline) : `docs/migration-mainline-post-v0.4.4.md`
- Notes de couverture et parité : `COVERAGE.md`
- Workflow d'extension hooks : `docs/hooks-extension.md`
- Détails de configuration et contribution : `CONTRIBUTING.md`

## Remerciements

Inspiré par [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adapté pour Kimi Code CLI.

## Licence

MIT
