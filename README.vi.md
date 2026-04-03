# oh-my-kimi (OMK)

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/oh-my-kimi/main/docs/shared/omk-character-spark-initiative.jpg" alt="oh-my-kimi character" width="280">
  <br>
  <em>Codex của bạn không đơn độc.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-kimi)](https://www.npmjs.com/package/oh-my-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[Website](https://github.com/wang-h/oh-my-kimi)** | **[Documentation](https://github.com/wang-h/oh-my-kimi#readme)** | **[CLI Reference](https://github.com/wang-h/oh-my-kimi#command-reference)** | **[Workflows](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** | **[Hướng dẫn tích hợp OpenClaw](./docs/openclaw-integration.vi.md)** | **[GitHub](https://github.com/wang-h/oh-my-kimi)** | **[npm](https://www.npmjs.com/package/oh-my-kimi)**

Lớp điều phối đa tác nhân cho [Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/).

## Điểm mới trong v0.9.0 — Spark Initiative

Spark Initiative là bản phát hành tăng cường đường đi native cho khám phá và kiểm tra trong OMK.

- **Native harness cho `omk explore`** — chạy khám phá kho mã chỉ đọc nhanh hơn và chặt chẽ hơn bằng harness Rust.
- **`omk sparkshell`** — bề mặt kiểm tra native cho operator, hỗ trợ tóm tắt đầu ra dài và chụp tmux pane.
- **Tài sản phát hành native đa nền tảng** — đường hydration cho `omk-explore-harness`, `omk-sparkshell` và `native-release-manifest.json` nay đã nằm trong pipeline phát hành.
- **CI/CD được tăng cường** — thêm thiết lập Rust toolchain tường minh cho `build` job cùng với `cargo fmt --check` và `cargo clippy -- -D warnings`.

Xem thêm tại [ghi chú phát hành v0.9.0](./docs/release-notes-0.9.0.md) và [release body](./docs/release-body-0.9.0.md).

## Phiên đầu tiên

Trong Codex:

```text
$deep-interview "clarify the auth change"
$ralplan "approve the auth plan and review tradeoffs"
$ralph "carry the approved plan to completion"
$team 3:executor "execute the approved plan in parallel"
```

Từ terminal:

```bash
omk team 4:executor "parallelize a multi-module refactor"
omk team status <team-name>
omk team shutdown <team-name>
```

## Quy trình được khuyến nghị

1. `$deep-interview` — khi phạm vi hoặc ranh giới vẫn chưa rõ.
2. `$ralplan` — để biến phạm vi đã làm rõ thành kế hoạch kiến trúc và triển khai đã được chốt.
3. `$team` hoặc `$ralph` — dùng `$team` cho thực thi song song có phối hợp, hoặc `$ralph` cho vòng lặp bền bỉ để hoàn tất/xác minh với một chủ sở hữu duy nhất.

## Mô hình cốt lõi

OMK cài đặt và kết nối các lớp sau:

```text
User
  -> Kimi Code CLI
    -> AGENTS.md (bộ não điều phối)
    -> ~/.codex/prompts/*.md (danh mục prompt tác nhân)
    -> ~/.codex/skills/*/SKILL.md (danh mục skill)
    -> ~/.codex/config.toml (tính năng, thông báo, MCP)
    -> .omk/ (trạng thái runtime, bộ nhớ, kế hoạch, nhật ký)
```

## Các lệnh chính

```bash
omk                # Khởi chạy Codex (+ HUD trong tmux khi có sẵn)
omk setup          # Cài đặt prompt/skill/config theo phạm vi + .omk của dự án + AGENTS.md theo phạm vi
omk doctor         # Chẩn đoán cài đặt/runtime
omk doctor --team  # Chẩn đoán Team/swarm
omk team ...       # Khởi động/trạng thái/tiếp tục/tắt worker tmux của đội
omk status         # Hiển thị các chế độ đang hoạt động
omk cancel         # Hủy các chế độ thực thi đang hoạt động
omk reasoning <mode> # low|medium|high|xhigh
omk tmux-hook ...  # init|status|validate|test
omk hooks ...      # init|status|validate|test (quy trình mở rộng plugin)
omk hud ...        # --watch|--json|--preset
omk help
```

## Mở rộng Hooks (Bề mặt bổ sung)

OMK hiện bao gồm `omk hooks` cho scaffolding và xác thực plugin.

- `omk tmux-hook` vẫn được hỗ trợ và không thay đổi.
- `omk hooks` là bổ sung và không thay thế quy trình tmux-hook.
- Tệp plugin nằm tại `.omk/hooks/*.mjs`.
- Plugin tắt theo mặc định; kích hoạt bằng `OMK_HOOK_PLUGINS=1`.

Xem `docs/hooks-extension.md` cho quy trình mở rộng đầy đủ và mô hình sự kiện.

## Cờ khởi chạy

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # chỉ dành cho setup
```

`--madmax` ánh xạ đến Codex `--dangerously-bypass-approvals-and-sandbox`.
Chỉ sử dụng trong môi trường sandbox tin cậy hoặc bên ngoài.

### Chính sách workingDirectory MCP (tăng cường tùy chọn)

Theo mặc định, các công cụ MCP state/memory/trace chấp nhận `workingDirectory` do người gọi cung cấp.
Để hạn chế điều này, đặt danh sách gốc được phép:

```bash
export OMK_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Khi được đặt, các giá trị `workingDirectory` ngoài các gốc này sẽ bị từ chối.

## Kiểm soát Prompt Codex-First

Theo mặc định, OMK tiêm:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Điều này kết hợp `AGENTS.md` trong `CODEX_HOME` với `AGENTS.md` của dự án (nếu có), rồi thêm lớp phủ runtime.
Mở rộng hành vi Codex, nhưng không thay thế/bỏ qua các chính sách hệ thống cốt lõi của Codex.

Điều khiển:

```bash
OMK_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omk     # tắt tiêm AGENTS.md
OMK_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omk
```

## Chế độ đội

Sử dụng chế độ đội cho công việc lớn được hưởng lợi từ worker song song.

Vòng đời:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Các lệnh vận hành:

```bash
omk team <args>
omk team status <team-name>
omk team resume <team-name>
omk team shutdown <team-name>
```

Quy tắc quan trọng: không tắt khi các tác vụ vẫn đang ở trạng thái `in_progress` trừ khi đang hủy bỏ.

### Team shutdown policy

Use `omk team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; legacy linked-Ralph shutdown handling is no longer a separate public workflow.

Chọn Worker CLI cho worker của đội:

```bash
OMK_TEAM_WORKER_CLI=auto    # mặc định; sử dụng claude khi worker --model chứa "claude"
OMK_TEAM_WORKER_CLI=codex   # ép buộc worker Kimi Code CLI
OMK_TEAM_WORKER_CLI=claude  # ép buộc worker Claude CLI
OMK_TEAM_WORKER_CLI_MAP=codex,codex,claude,claude  # hỗn hợp CLI theo worker (độ dài=1 hoặc số worker)
OMK_TEAM_AUTO_INTERRUPT_RETRY=0  # tùy chọn: tắt fallback thích ứng queue->resend
```

Lưu ý:
- Tham số khởi chạy worker vẫn được chia sẻ qua `OMK_TEAM_WORKER_LAUNCH_ARGS`.
- `OMK_TEAM_WORKER_CLI_MAP` ghi đè `OMK_TEAM_WORKER_CLI` cho lựa chọn theo worker.
- Gửi trigger sử dụng thử lại thích ứng theo mặc định (queue/submit, sau đó fallback an toàn clear-line+resend khi cần).
- Trong chế độ Claude worker, OMK khởi chạy worker dưới dạng `claude` thuần túy (không có tham số khởi chạy thêm) và bỏ qua các ghi đè rõ ràng `--model` / `--config` / `--effort` để Claude sử dụng `settings.json` mặc định.

## `omk setup` ghi những gì

- `.omk/setup-scope.json` (phạm vi cài đặt được lưu trữ)
- Cài đặt phụ thuộc phạm vi:
  - `user`: `~/.codex/prompts/`, `~/.codex/skills/`, `~/.codex/config.toml`, `~/.omk/agents/`, `~/.codex/AGENTS.md`
  - `project`: `./.codex/prompts/`, `./.codex/skills/`, `./.codex/config.toml`, `./.omk/agents/`, `./AGENTS.md`
- Hành vi khởi chạy: nếu phạm vi được lưu trữ là `project`, khởi chạy `omk` tự động sử dụng `CODEX_HOME=./.codex` (trừ khi `CODEX_HOME` đã được đặt).
- Hướng dẫn khởi chạy sẽ kết hợp `~/.codex/AGENTS.md` (hoặc `CODEX_HOME/AGENTS.md` nếu đã ghi đè) với `./AGENTS.md` của dự án, rồi thêm lớp phủ runtime.
- Các tệp `AGENTS.md` hiện có sẽ không bao giờ bị ghi đè âm thầm: ở TTY tương tác, setup hỏi trước khi thay thế; ở chế độ không tương tác, việc thay thế sẽ bị bỏ qua trừ khi dùng `--force` (kiểm tra an toàn phiên hoạt động vẫn áp dụng).
- Cập nhật `config.toml` (cho cả hai phạm vi):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Mục máy chủ MCP (`omx_state`, `omx_memory`, `omx_code_intel`, `omx_trace`)
  - `[tui] status_line`
- `AGENTS.md` theo phạm vi
- Thư mục `.omk/` runtime và cấu hình HUD

## Tác nhân và skill

- Prompt: `prompts/*.md` (cài vào `~/.codex/prompts/` cho `user`, `./.codex/prompts/` cho `project`)
- Skill: `skills/*/SKILL.md` (cài vào `~/.codex/skills/` cho `user`, `./.codex/skills/` cho `project`)

Ví dụ:
- Tác nhân: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skill: `deep-interview`, `ralplan`, `team`, `ralph`, `plan`, `cancel`

## Cấu trúc dự án

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

## Phát triển

```bash
git clone https://github.com/wang-h/oh-my-kimi.git
cd oh-my-kimi
npm install
npm run build
npm test
```

## Tài liệu

- **[Tài liệu đầy đủ](https://github.com/wang-h/oh-my-kimi#readme)** — Hướng dẫn hoàn chỉnh
- **[Tham chiếu CLI](https://github.com/wang-h/oh-my-kimi#command-reference)** — Tất cả lệnh `omk`, cờ và công cụ
- **[Hướng dẫn thông báo](https://github.com/wang-h/oh-my-kimi#notifications)** — Cài đặt Discord, Telegram, Slack và webhook
- **[Quy trình công việc khuyến nghị](https://github.com/wang-h/oh-my-kimi#recommended-workflows)** — Chuỗi skill đã thử nghiệm thực chiến cho các tác vụ phổ biến
- **[Ghi chú phát hành](https://github.com/wang-h/oh-my-kimi#release-notes)** — Tính năng mới trong mỗi phiên bản

## Ghi chú

- Nhật ký thay đổi đầy đủ: `CHANGELOG.md`
- Hướng dẫn di chuyển (sau v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Ghi chú về độ bao phủ và tương đương: `COVERAGE.md`
- Quy trình mở rộng hook: `docs/hooks-extension.md`
- Chi tiết cài đặt và đóng góp: `CONTRIBUTING.md`

## Lời cảm ơn

Lấy cảm hứng từ [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), được điều chỉnh cho Kimi Code CLI.

## Giấy phép

MIT
