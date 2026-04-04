---
name: team
description: Coordinated parallel execution for complex multi-lane tasks
---

# Team Skill (Native & Coordinated)

`$team` is the coordinated parallel execution mode for OMK. It is designed to handle complex, multi-lane tasks identified during planning (`$ralplan`).

## Execution Modes

1. **Native Mode (Default)**: Uses Kimi's native `spawn_agent` (delegation) for in-session parallelism. All output stays within the current CLI session. Use this for standard high-throughput work where coordination within one window is sufficient.
2. **Tmux Mode (`--tmux`)**: Launches independent worker sessions in separate tmux panes. Use this for very large-scale tasks requiring durable background workers, separate git worktrees, or long-running execution that must survive a local session restart.

## When to use Team

- The approved plan (`$ralplan`) has multiple independent lanes.
- You need to coordinate progress across delivery, verification, and specialist lanes.
- High-throughput execution is needed to finish a large task faster.

## Native Team Protocol (In-Session)

When `$team` is triggered without `--tmux`:

1. **Staffing**: Map the task lanes to specific OMK roles (e.g., `executor`, `test-engineer`, `verifier`).
2. **Dispatch**: Use the native `delegate` (or `spawn_agent`) tool to launch subtasks in parallel.
3. **Integration**: Collect results from all agents, resolve any conflicts, and perform final verification.
4. **State**: Persist team state in `.omk/state/team/<name>/` for compatibility.

## Tmux Team Protocol (Operator Workflow)

When `$team --tmux` is triggered (or when explicitly requested):

1. Invoke OMK runtime directly with `omk team ...`.
2. This will split the current tmux window into worker panes.
3. Use `omk team status` to monitor progress.
4. Use `omk team shutdown` when all tasks are complete.

## Invocation Contract

```bash
$team "task description"
$team --tmux "large scale refactor"
```

### staffing guidelines

Follow the staffing roster from the approved `$ralplan`:
- Keep worker roles within the suggested roster.
- Use appropriate reasoning levels for each lane.
- Launch delivery and verification lanes in parallel.

## Message Dispatch Policy

- For **Native Mode**: Communication happens via standard delegation returns.
- For **Tmux Mode**: Communication happens via `omk team api` and mailbox files.

## Required Lifecycle

1. **Start**: Define the team name (slug) and tasks.
2. **Execute**: Launch parallel agents (Native `delegate` or Tmux workers).
3. **Monitor**: Track task status (pending -> in_progress -> completed).
4. **Integrate**: Merge worker changes and verify.
5. **Shutdown**: Mark the team as inactive and clean up.

## Failure Modes

- If a native subagent fails, retry or escalate to the leader.
- If a tmux worker pane stalls, use `omk team status` and `omk team resume` to diagnose.
- If "automatic closing" occurs in Kimi, ensure you are NOT using the external `omk team` command for in-session tasks.
