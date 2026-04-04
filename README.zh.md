# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>你的 Kimi 并不孤单。</em>
</p>

[![GitHub repo](https://img.shields.io/badge/GitHub-wang--h%2Foh--my--kimi-black)](https://github.com/wang-h/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)


> **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[入门文档](./docs/getting-started.html)** | **[兼容性说明](./docs/oh-my-kimi-v1-compatibility.md)** | **[OpenClaw 集成指南](./docs/openclaw-integration.zh.md)**

> **项目致谢：** `oh-my-kimi` 源自 [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) 的 Kimi-first 分叉版本，原项目与上游设计工作应归功于 **Yeachan-Heo**。
>
> **当前说明：** 本 fork 由 **hao**（`wang-h`）维护；`oh-my-kimi` 的迁移、品牌替换与适配工作是在 **oh-my-codex** 的基础上完成的，迁移过程中也明确使用了 **OpenAI Codex / Codex CLI 工作流** 来协助执行与推进。

面向 **Kimi Code CLI** 的多智能体编排层，`omk` 是主命令名，`omk` 目前保留为兼容别名。

> **Kimi CLI 调用说明：** Kimi Code CLI 并不原生保证支持 `$ralplan`、`$deep-interview`、`$team`、`$ralph` 这类 OMK 简写语法。实际使用中，最稳妥的方式是显式写 `/skill:ralplan ...`、`/skill:deep-interview ...`、`/skill:team ...`、`/skill:ralph ...`；只有在你当前的 Kimi 环境明确支持 `$name` 简写时，才建议直接使用 `$...`。

## v0.9.0 新特性 — Spark Initiative

Spark Initiative 是一次强化 OMK 原生探索与检查路径的版本发布。

- **`omk explore` 原生 harness** —— 通过 Rust 原生 harness 更快、更严格地执行只读仓库探索。
- **`omk sparkshell`** —— 面向操作者的原生检查界面，支持长输出摘要与 tmux pane 捕获。
- **跨平台原生发布资产** —— `omk-explore-harness`、`omk-sparkshell` 与 `native-release-manifest.json` 的 hydration 路径现已纳入发布流水线。
- **增强的 CI/CD** —— 为 `build` job 增加显式 Rust toolchain 设置，并加入 `cargo fmt --check` 与 `cargo clippy -- -D warnings`。

详情请参阅 [v0.9.0 发布说明](./docs/release-notes-0.9.0.md) 和 [发布正文](./docs/release-body-0.9.0.md)。

## 首次会话

在 Kimi 内部，建议优先这样调用：

```text
/skill:deep-interview 澄清这个需求
/skill:ralplan 审阅并批准这个实施计划
/skill:ralph 持续推进到完成
/skill:team 3:executor "并行执行这个任务"
```

从终端（推荐使用 `omk`）：

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## 推荐工作流

1. `/skill:deep-interview` — 当范围或边界还不清楚时，先用它澄清需求。
2. `/skill:ralplan` — 把澄清后的范围整理成可批准的架构与实施计划。
3. `/skill:team` 或 `/skill:ralph` — 需要协调并行执行时用 `/skill:team`，需要单一负责人持续推进到完成并验证时用 `/skill:ralph`。

## 核心模型

OMK 安装并连接以下层：

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (编排大脑)
    -> ~/.kimi/agents/ 与 skills/prompts（运行时入口）
    -> ~/.kimi/config.toml / MCP / 插件配置


```

## 主要命令

```bash
omk                # 启动 Kimi（在 tmux 中附带 HUD）
omk setup          # 按作用域安装 prompt/skill/config + 项目 .omk + 作用域专属 AGENTS.md
omk doctor         # 安装/运行时诊断
omk doctor --team  # Team/swarm 诊断
omk team ...       # 启动/状态/恢复/关闭 tmux 团队 worker
omk status         # 显示活动模式
omk cancel         # 取消活动执行模式
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test（插件扩展工作流）
omk hud ...        # --watch|--json|--preset
omk help
```

## Hooks 扩展（附加表面）

OMK 现在包含用于插件脚手架和验证的 `omk hooks`。

- `omk tmux-hook` 继续支持且未更改。
- `omk hooks` 是附加的，不会替代 tmux-hook 工作流。
- 插件文件位于 `.omk/hooks/*.mjs`。
- 插件默认关闭；使用 `OMK_HOOK_PLUGINS=1` 启用。

完整的扩展工作流和事件模型请参阅 `docs/hooks-extension.md`。

## 启动标志

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # 仅用于 setup
```

`--madmax` 会映射到当前运行时的危险绕过模式；仅在可信/隔离环境中使用。
仅在可信/外部沙箱环境中使用。

### MCP workingDirectory 策略（可选加固）

默认情况下，MCP state/memory/trace 工具接受调用方提供的 `workingDirectory`。
要限制此行为，请设置允许的根目录列表：

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

设置后，超出这些根目录的 `workingDirectory` 值将被拒绝。

## Codex-First Prompt 控制

默认情况下，OMK 注入：

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

这会将 `CODEX_HOME` 中的 `AGENTS.md` 与项目 `AGENTS.md`（如果存在）合并，然后再附加运行时 overlay。
扩展 Codex 行为，但不会替换/绕过 Codex 核心系统策略。

控制：

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # 禁用 AGENTS.md 注入
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## 团队模式

对于受益于并行 worker 的大规模工作，使用团队模式。OMK 现已支持 Kimi 原生并行，不再强制依赖 tmux。

### 两种执行模式：

1. **原生模式 (默认)**：在当前 Kimi 会话中通过 `spawn_agent` 直接启动子智能体。所有输出保留在当前窗口，适合标准并行任务。
2. **Tmux 模式 (`--tmux`)**：在独立的 tmux 面板中启动 worker。适合需要独立工作区 (Worktrees) 或极长运行时间的超大规模任务。

### 操作命令：

```bash
$team "任务描述"             # 使用原生并行（推荐）
$team --tmux "大型重构任务"   # 使用传统 tmux 模式
omk team status <team-name>  # 仅用于 tmux 模式的状态查询
omk team shutdown <team-name> # 仅用于 tmux 模式的关闭
```

注意：原生模式下，Leader 智能体会自动协调子任务并集成结果，无需手动管理面板。

团队 worker 的 Worker CLI 选择：

```bash
OMK_TEAM_WORKER_CLI=auto    # 默认；当 worker --model 包含 "claude" 时使用 claude
OMK_TEAM_WORKER_CLI=kimi    # 如后续支持可改为 Kimi worker；当前仍以兼容层为主
OMK_TEAM_WORKER_CLI=claude  # 强制 Claude CLI worker
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # 每个 worker 的 CLI 混合（长度=1 或 worker 数量）
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # 可选：禁用自适应 queue->resend 回退
```

注意：
- Worker 启动参数仍通过 `OMK_TEAM_WORKER_LAUNCH_ARGS` 共享。
- `OMK_TEAM_WORKER_CLI_MAP` 覆盖 `OMK_TEAM_WORKER_CLI` 以实现每个 worker 的选择。
- 触发器提交默认使用自适应重试（queue/submit，需要时使用安全的 clear-line+resend 回退）。
- 在 Claude worker 模式下，OMK 以普通 `claude` 启动 worker（无额外启动参数），并忽略显式的 `--model` / `--config` / `--effort` 覆盖，使 Claude 使用默认 `settings.json`。

## `omk setup` 写入的内容

- `.omk/setup-scope.json`（持久化的设置作用域）
- 依赖作用域的安装：
  - `user`：`~/.codex/prompts/`、`~/.codex/skills/`、`~/.codex/config.toml`、`~/.omk/agents/`、`~/.codex/AGENTS.md`
  - `project`：`./.codex/prompts/`、`./.codex/skills/`、`./.codex/config.toml`、`./.omk/agents/`、`./AGENTS.md`
- 启动行为：如果持久化的作用域是 `project`，`omk` 启动时自动使用 `CODEX_HOME=./.codex`（除非 `CODEX_HOME` 已设置）。
- 启动指令会合并 `~/.codex/AGENTS.md`（或被覆盖的 `CODEX_HOME/AGENTS.md`）与项目 `./AGENTS.md`，然后附加运行时 overlay。
- 现有 `AGENTS.md` 文件绝不会被静默覆盖：交互式 TTY 下 setup 会先询问是否替换；非交互模式下除非传入 `--force`，否则会跳过替换（活动会话安全检查仍然适用）。
- `config.toml` 更新（两种作用域均适用）：
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP 服务器条目（`omx_state`、`omx_memory`、`omx_code_intel`、`omx_trace`）
  - `[tui] status_line`
- 作用域专属 `AGENTS.md`
- `.omk/` 运行时目录和 HUD 配置

## 代理和技能

- Prompt：`prompts/*.md`（`user` 安装到 `~/.codex/prompts/`，`project` 安装到 `./.codex/prompts/`）
- Skill：`skills/*/SKILL.md`（`user` 安装到 `~/.codex/skills/`，`project` 安装到 `./.codex/skills/`）

示例：
- 代理：`architect`、`planner`、`executor`、`debugger`、`verifier`、`security-reviewer`
- 技能：`deep-interview`、`ralplan`、`team`、`ralph`、`plan`、`cancel`

## 项目结构

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

## 开发

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## 文档

- **[完整文档](https://github.com/wang-h/oh-my-kimi#readme)** — 完整指南
- **[CLI 参考](https://github.com/wang-h/oh-my-kimi#command-reference)** — 所有 `omk` 命令、标志和工具
- **[通知指南](https://github.com/wang-h/oh-my-kimi#notifications)** — Discord、Telegram、Slack 和 webhook 设置
- **[推荐工作流](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — 用于常见任务的经过实战检验的 skill 链
- **[发行说明](https://github.com/wang-h/oh-my-kimi#release-notes)** — 每个版本的新功能

## 备注

- 完整变更日志：`CHANGELOG.md`
- 迁移指南（v0.4.4 后的 mainline）：`docs/migration-mainline-post-v0.4.4.md`
- 覆盖率和对等说明：`COVERAGE.md`
- Hook 扩展工作流：`docs/hooks-extension.md`
- 设置和贡献详情：`CONTRIBUTING.md`

## 致谢

受 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) 启发，为 Kimi Code CLI 适配。

## 许可证

MIT
