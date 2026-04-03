# Deep Interview Spec: chat2response

**Profile:** standard  
**Rounds:** 7  
**Final Ambiguity:** 19%  
**Threshold:** 20%  
**Context Type:** brownfield  
**Context Snapshot:** `.omk/context/chat2response-20260403T084304Z.md`

---

## Clarity Breakdown

| Dimension         | Score | Notes                                      |
|-------------------|-------|--------------------------------------------|
| Intent            | 0.80  | Fix bugs in chat2response-v2               |
| Outcome           | 0.70  | Stable, bug-free bridge with minor enhancements |
| Scope             | 0.60  | Full codebase review + direct fixes        |
| Constraints       | 0.70  | No breaking API changes                    |
| Success Criteria  | 0.75  | Build + tests + verification               |
| Context           | 0.60  | Two projects found; v2 selected            |

**Weighted Ambiguity:** 19% (below 0.20 threshold)

---

## Intent
用户希望对 `chat2response-v2` 进行全面审查，排查并修复其中存在的 bug，同时允许在合理范围内进行小幅功能增强。

## Desired Outcome
`chat2response-v2` 运行稳定，已发现的和潜在的 bug 得到修复，OpenAI Responses API 到 Chat Completions 的桥接行为正确且兼容，小幅增强提升可用性。

## In-Scope
- 全面审查 `chat2response-v2` 的代码库（`src/app.ts`, `src/converter.ts`, `src/providers/`, `src/types.ts`）
- 识别并修复 bug 和潜在问题
- 允许进行合理的小幅功能增强
- 允许对核心模块进行小范围重构，前提是修复根本原因
- 运行验证（`npm run build`, `node test-streaming.js` 等）

## Out-of-Scope / Non-goals
- 大规模架构重构或重写
- 引入大量新的外部依赖（如需新依赖应先评估必要性）
- 添加与 bug 修复无关的大型新功能
- 修改 `v1` 版本的 `Projects/chat2response`

## Decision Boundaries
- **可直接执行：** 发现 bug 后直接修复；涉及核心模块的小范围重构也可直接执行，无需逐条确认。
- **需汇报后决定：** 如需引入新的 npm 依赖或进行超出"小范围"的重构，应先汇报。

## Constraints
- 必须保证 `/v1/responses` 和 `/v1/chat/completions` 的现有 API 兼容行为不变
- 不能破坏现有的 `.env` 配置格式和预期行为
- 修改应最小化，优先修复问题而非过度工程化

## Testable Acceptance Criteria
1. `npm run build` 成功编译，无 TypeScript 错误
2. `node test-streaming.js` 正常输出预期的事件序列
3. 流式响应和非流式响应的格式转换逻辑正确
4. 各 provider 的认证和请求转发行为未被破坏
5. 代码中无明显的运行时错误或类型安全漏洞

## Assumptions Exposed + Resolutions
- **假设：** 用户知道自己想修复的具体 bug。  
  **澄清：** 用户不确定具体 bug，需要我先行全面排查。
- **假设：** "直接修复"是否包含核心模块重构？  
  **澄清：** 包含。用户授权直接进行小范围重构以修复根本原因。

## Pressure-Pass Findings
- **Revisited answer:** Round 4 "全面审查，直接修复"
- **Deepening question:** 如果核心模块（如 `converter.ts`）需要结构性重构而非简单 patch，是否可以直接执行？
- **What changed:** 用户明确授权可以直接重构核心模块，这扩展了执行者的自主权，减少了中间汇报轮次。

## Brownfield Evidence vs Inference Notes
- **Evidence:** 文件系统中确实存在两个 `chat2response` 目录。
- **Evidence:** `chat2response-v2` 的 `README.en.md` 明确列出了 "Kimi Authentication Error" 和 "MiniMax Model Not Supported" 作为已知问题。
- **Evidence:** 项目使用 TypeScript + Express，`src/` 下包含 `app.ts`, `converter.ts`, `types.ts`, `providers/`。
- **Inference:** 排查时应重点关注认证逻辑、provider 配置、流式/非流式转换的正确性。

## Technical Context Findings
- **Project:** `/Users/hao/chat2response-v2`
- **Version:** 2.0.0
- **Stack:** TypeScript, Express, node-fetch (built-in), CORS
- **Entry:** `dist/app.js`
- **Test:** `test-streaming.js` (测试流式转换)
- **Known Issues from README:** Kimi Authentication Error, MiniMax Model Not Supported
