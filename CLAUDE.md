# CLAUDE.md — Project Rules

## Git Operations

**Claude must NOT run any git commands.**

All git operations (add, commit, push, pull, merge, branch, stash, worktree, etc.) are performed exclusively by the user. Do not suggest or execute git commands. If a task would normally require a git operation, describe what the user should do manually instead.

## Worktrees

**Strictly prohibited.** Do not create git worktrees under any circumstances.

- Never use `EnterWorktree`, `git worktree add`, or any tool/command that creates a worktree.
- Never invoke skills or commands that trigger worktree creation (e.g. `superpowers:using-git-worktrees`, `create-pr-command` that spawns a worktree).
- Worktrees nested inside `.claude/worktrees/` create a double-folder structure within the repo, which must never happen.
- Work directly in the main project directory at all times: `C:\Users\shin0\Documents\GitHub\TKH-ER-Quiz\`

## Project

- Stack: static HTML + CSS + JS, no build step
- Data lives in `data/` (categories.json + questions/<level>/*.json)
- localStorage schema version: `schemaVersion: 2` (`qqq_state_v1` key)
- 変更はすべてパッチとして提示して。  
- ファイル編集だけ自動で進めていい。