# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>你的 Codex，從不孤行。</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[官方網站](https://github.com/wang-h/oh-my-kimi)** | **[說明文件](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI 參考手冊](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[工作流程](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[OpenClaw 整合指南](./docs/openclaw-integration.zh-TW.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

[Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/) 的多智能體編排層。

## v0.9.0 新功能 — Spark Initiative

Spark Initiative 是一個強化 OMK 原生探索與檢查路徑的版本發布。

- **`omk explore` 原生 harness** —— 以 Rust 原生 harness 更快且更嚴格地執行唯讀儲存庫探索。
- **`omk sparkshell`** —— 面向操作員的原生檢查介面，支援長輸出摘要與 tmux pane 擷取。
- **跨平台原生釋出資產** —— `omk-explore-harness`、`omk-sparkshell` 與 `native-release-manifest.json` 的 hydration 路徑已納入釋出流程。
- **強化的 CI/CD** —— 在 `build` job 中加入明確的 Rust toolchain 設定，並新增 `cargo fmt --check` 與 `cargo clippy -- -D warnings`。

詳細內容請參閱 [v0.9.0 版本說明](./docs/release-notes-0.9.0.md) 與 [釋出正文](./docs/release-body-0.9.0.md)。

## 首次會話

在 Codex 內部：

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

從終端機：

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## 建議工作流程

1. `$deep-interview` — 當範圍或邊界仍不清楚時，先用它釐清需求。
2. `$ralplan` — 把釐清後的範圍整理成可核准的架構與實作計畫。
3. `$team` 或 `$ralph` — 需要協調平行執行時用 `$team`，需要單一負責人持續推進到完成並驗證時用 `$ralph`。

## 核心模型

OMK 安裝並串接以下各層：

```text
使用者
  -> Kimi Code CLI
    -> AGENTS.md（編排大腦）
    -> ~/.codex/prompts/*.md（代理提示詞目錄）
    -> ~/.codex/skills/*/SKILL.md（技能目錄）
    -> ~/.codex/config.toml（功能、通知、MCP）
    -> .omk/（執行期狀態、記憶、計畫、日誌）
```

## 主要指令

```bash
omk                  # 啟動 Codex（可用時在 tmux 中附帶 HUD）
omk setup            # 依範圍安裝提示詞/技能/設定 + 專案 .omk + 範圍專屬 AGENTS.md
omk doctor           # 安裝/執行期診斷
omk doctor --team    # 團隊/群集診斷
omk ask ...          # 詢問本地供應商顧問（claude|gemini），結果寫入 .omk/artifacts/*
omk team ...         # 啟動/狀態/恢復/關閉團隊工作進程（預設為互動式 tmux）
omk status           # 顯示目前活動模式
omk cancel           # 取消活動中的執行模式
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...    # init|status|validate|test
omk hooks ...        # init|status|validate|test（插件擴充工作流程）
omk hud ...          # --watch|--json|--preset
omk help
```

Ask 指令範例：

```bash
omk ask claude "review this diff"
omk ask gemini "brainstorm alternatives"
omk ask claude --agent-prompt executor "implement feature X with tests"
omk ask gemini --agent-prompt=planner --prompt "draft a rollout plan"
# 底層供應商 CLI 說明中的旗標：
# claude -p|--print "<prompt>"
# gemini -p|--prompt "<prompt>"
```

非 tmux 團隊啟動（進階）：

```bash
OMK_TEAM_WORKER_LAUNCH_MODE=prompt omk team 2:executor "task"
```

## Hooks 擴充（附加介面）

OMK 現已包含 `omk hooks`，用於插件鷹架建立與驗證。

- `omk tmux-hook` 持續受支援，行為不變。
- `omk hooks` 屬於附加功能，不會取代 tmux-hook 工作流程。
- 插件檔案位於 `.omk/hooks/*.mjs`。
- 插件預設關閉；使用 `OMK_HOOK_PLUGINS=1` 啟用。

完整的擴充工作流程與事件模型，請參閱 `docs/hooks-extension.md`。

## 啟動旗標

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # 僅用於 setup
```

`--madmax` 對應 Codex 的 `--dangerously-bypass-approvals-and-sandbox`。
僅在信任環境或外部沙箱環境中使用。

### MCP workingDirectory 策略（選用強化）

預設情況下，MCP 狀態/記憶/追蹤工具接受呼叫方提供的 `workingDirectory`。
若要限制此行為，請設定允許的根目錄清單：

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

設定後，超出這些根目錄的 `workingDirectory` 值將被拒絕。

## Codex 優先的提示詞控制

預設情況下，OMK 注入：

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

這會將 `CODEX_HOME` 中的 `AGENTS.md` 與專案的 `AGENTS.md`（若存在）合併，然後再附加執行期 overlay。
此舉擴充了 Codex 的行為，但不會取代或繞過 Codex 核心系統策略。

控制方式：

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # 停用 AGENTS.md 注入
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## 團隊模式

對於能從平行工作進程獲益的大規模工作，請使用團隊模式。

生命週期：

```text
啟動 -> 分配有界通道 -> 監控 -> 驗證終端任務 -> 關閉
```

作業指令：

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

重要規則：除非要中止，否則請勿在任務仍處於 `in_progress` 狀態時關閉。

### Ralph 後續流程

若協調式 Team 執行之後仍需要單一負責人的持續修正 / 驗證迴圈，
請在 Team 工作完成後另外執行 `omk ralph ...`。舊的 linked-Ralph 團隊路徑已不再是建議或支援的標準路徑。

團隊工作進程的 Worker CLI 選擇：

```bash
OMK_TEAM_WORKER_CLI=auto    # 預設；當 worker --model 包含 "claude" 時使用 claude
OMK_TEAM_WORKER_CLI=codex   # 強制使用 Kimi Code CLI 工作進程
OMK_TEAM_WORKER_CLI=claude  # 強制使用 Claude CLI 工作進程
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # 每個工作進程的 CLI 混合（長度為 1 或等於工作進程數量）
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # 選用：停用自適應 queue->resend 回退機制
```

注意事項：
- 工作進程啟動參數仍透過 `OMK_TEAM_WORKER_LAUNCH_ARGS` 共享。
- `OMK_TEAM_WORKER_CLI_MAP` 會覆寫 `OMK_TEAM_WORKER_CLI`，以實現每個工作進程的個別選擇。
- 觸發提交預設使用自適應重試（queue/submit，必要時採用安全的清除行 + 重傳回退）。
- 在 Claude 工作進程模式下，OMK 以純 `claude` 啟動工作進程（無額外啟動參數），並忽略明確的 `--model` / `--config` / `--effort` 覆寫，讓 Claude 使用預設的 `settings.json`。

## `omk setup` 寫入的內容

- `.omk/setup-scope.json`（持久化的設定範圍）
- 依範圍的安裝內容：
  - `user`：`~/.codex/prompts/`、`~/.codex/skills/`、`~/.codex/config.toml`、`~/.omk/agents/`、`~/.codex/AGENTS.md`
  - `project`：`./.codex/prompts/`、`./.codex/skills/`、`./.codex/config.toml`、`./.omk/agents/`、`./AGENTS.md`
- 啟動行為：若持久化範圍為 `project`，`omk` 啟動時自動使用 `CODEX_HOME=./.codex`（除非已設定 `CODEX_HOME`）。
- 啟動指令會合併 `~/.codex/AGENTS.md`（或覆寫後的 `CODEX_HOME/AGENTS.md`）與專案 `./AGENTS.md`，然後再附加執行期 overlay。
- 現有的 `AGENTS.md` 檔案絕不會被靜默覆寫：互動式 TTY 執行時 setup 會先詢問；非互動執行時若沒有 `--force` 就會跳過替換（仍適用活動會話安全檢查）。
- `config.toml` 更新（兩種範圍均適用）：
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP 伺服器項目（`omx_state`、`omx_memory`、`omx_code_intel`、`omx_trace`）
  - `[tui] status_line`
- 範圍專屬 `AGENTS.md`
- `.omk/` 執行期目錄與 HUD 設定

## 代理與技能

- 提示詞：`prompts/*.md`（`user` 安裝至 `~/.codex/prompts/`，`project` 安裝至 `./.codex/prompts/`）
- 技能：`skills/*/SKILL.md`（`user` 安裝至 `~/.codex/skills/`，`project` 安裝至 `./.codex/skills/`）

範例：
- 代理：`architect`、`planner`、`executor`、`debugger`、`verifier`、`security-reviewer`
- 技能：`deep-interview`、`ralplan`、`team`、`ralph`、`plan`、`cancel`

### 視覺品管迴圈（`$visual-verdict`）

當任務需要視覺保真度驗證（參考圖片 + 生成截圖）時，請使用 `$visual-verdict`。

- 回傳結構化 JSON：`score`、`verdict`、`category_match`、`differences[]`、`suggestions[]`、`reasoning`
- 建議通過門檻：**90 分以上**
- 對於視覺任務，在每次下一輪編輯前先執行 `$visual-verdict`
- 使用像素差異 / pixelmatch 疊加圖作為**輔助除錯工具**（而非主要通過/失敗判斷依據）

## 專案結構

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

## 開發

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run lint
npm run build
npm test
```

## 說明文件

- **[完整說明文件](https://github.com/wang-h/oh-my-kimi#readme)** — 完整指南
- **[CLI 參考手冊](https://github.com/wang-h/oh-my-kimi#command-reference)** — 所有 `omk` 指令、旗標與工具
- **[通知設定指南](https://github.com/wang-h/oh-my-kimi#notifications)** — Discord、Telegram、Slack 及 Webhook 設定
- **[推薦工作流程](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — 實戰驗證的技能鏈，適用常見任務
- **[版本發行說明](https://github.com/wang-h/oh-my-kimi#release-notes)** — 每個版本的新功能

## 附註

- 完整變更日誌：`CHANGELOG.md`
- 遷移指南（v0.4.4 後的主線版本）：`docs/migration-mainline-post-v0.4.4.md`
- 覆蓋率與同等性說明：`COVERAGE.md`
- Hook 擴充工作流程：`docs/hooks-extension.md`
- 設定與貢獻詳情：`CONTRIBUTING.md`

## 致謝

靈感來自 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)，為 Kimi Code CLI 量身改編。

## 授權條款

MIT
