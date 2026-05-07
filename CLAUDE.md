# CLAUDE.md — Project Rules

## 作業ディレクトリ

**常に main ブランチのプロジェクト本体で直接作業する。**

- 作業ディレクトリ: `C:\Users\shin0\Documents\GitHub\TKH-ER-Quiz\`
- ブランチ切り替え・ワークツリー作成は一切行わない
- セッション開始時に現在のディレクトリが上記であることを前提とする

## Git 操作

**Claude は git コマンドを一切実行しない。**

add / commit / push / pull / merge / branch / stash / worktree など、すべての git 操作はユーザーが行う。git 操作が必要な場面では、ユーザーが実行すべきコマンドを説明するにとどめる。

## Worktree 禁止

**あらゆる手段でのワークツリー作成を禁止する。**

- `EnterWorktree`、`git worktree add`、ワークツリーを作成するいかなるツール・コマンドも使用しない
- `superpowers:using-git-worktrees` などワークツリーを起動するスキルを呼び出さない
- `.claude/worktrees/` 配下にネストされた構造を作らない

### 禁止の理由
このプロジェクトは静的 HTML + JS + JSON のみでビルドステップがない。ワークツリーをリポジトリ内に作ると `data/` が二重になり、どちらが正規データか不明になる。並列ブランチ開発の必要もないため、worktree は百害あって一利なし。

## Project

- Stack: static HTML + CSS + JS, no build step
- Data lives in `data/` (categories.json + questions/<level>/*.json)
- localStorage schema version: `schemaVersion: 2` (`qqq_state_v1` key)
- 変更はすべてパッチとして提示して。
- ファイル編集だけ自動で進めていい。
