<<<<<<< HEAD
# Claude Entry Point

このファイルは互換用の入口です。ルールの正本は `AGENTS.md` です。

作業前に次を確認してください。
=======
# Claude Guidance

このファイルは補助的な互換ガイドです。作業ルールの source of truth は `AGENTS.md` を優先してください。

## Read First
>>>>>>> origin/main

1. `README.md`
2. `AGENTS.md`
3. `docs/architecture.md`
4. `docs/ai-execution.md`
<<<<<<< HEAD
5. 必要に応じて `prompt/agent.md`
6. 関連コード / 関連テスト

`CLAUDE.md` 自体には repo 固有ルールを重複記載しません。更新が必要な場合は `AGENTS.md` と `docs/*` を修正してください。
=======
5. `CLAUDE.md` は不足分の補助参照として扱う

## Delegation

- 作業ルール、Issue / PR 運用、検証方針は `AGENTS.md` を参照する
- レイヤー責務や変更起点は `docs/architecture.md` を参照する
- 作業フロー、worktree、検証、報告の流れは `docs/ai-execution.md` を参照する
- このファイルには `AGENTS.md` と重複する詳細ルールを持たせない
- 互換のために残すが、更新時はまず `AGENTS.md` を修正する

## Notes

- 返答、レビューコメント、PR 本文は日本語で記述する
- 詳細ルールを増やさず、正本 docs への導線だけを維持する
>>>>>>> origin/main
