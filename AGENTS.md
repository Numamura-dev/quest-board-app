# Codex Rules

このファイルは Codex / OpenAI エージェント向けのルールファイルです。
Claude Code を使う場合は CLAUDE.md を参照してください。

## Commands

詳細は README.md 参照。主要コマンドのみ抜粋:

```bash
pnpm dev                    # 全サービス並列起動
pnpm build                  # 全体ビルド (docs -> frontend -> backend)
pnpm lint / pnpm lint:fix   # Biome check / 自動修正
pnpm --filter backend test  # Jest (バックエンド)
pnpm --filter frontend test # Vitest (フロントエンド)
pnpm --filter backend typecheck
docker compose up -d        # MySQL 起動 (DB 操作前に必要)
pnpm db:push                # Prisma スキーマを DB に反映
pnpm --filter backend seed  # シードデータ投入
```

## General

- 返答、レビューコメント、PR 本文は日本語で記述する。
- まず既存実装と既存差分を確認し、前提を決め打ちしない。
- ユーザーが作成した未コミット差分は勝手に戻さない。
- 破壊的コマンドは、明示的な依頼または承認がある場合のみ実行する。

## Git / Branch

- issue 対応は原則 `git worktree` で分離する。
- 作業ブランチは 1 issue / 1 task ごとに切る。
- 既存 PR がマージ済みの場合は、必要に応じて新しいブランチと PR を作り直す。
- push 前に upstream との差分と競合有無を確認する。

## Editing

- 変更は必要最小限にとどめ、unrelated な修正を混ぜない。
- frontend / backend / docs をまたぐ変更は、なぜまたぐ必要があるかを説明する。
- デフォルトは ASCII を使い、既存ファイルに合わせる場合のみ例外を認める。

## Validation

- 実装後は、可能な範囲でテスト、型チェック、ビルドを実行する。
- 実装を行った場合は単体テストを追加する。
- 単体テストのカバレッジは 80% 以上を目標とする。
- 実行できなかった検証や、既存不具合で失敗した検証は必ず明記する。
- pre-commit は軽い差分検証に限定する。
- pre-push は重いローカル検証に使う。
- CI はリポジトリ全体の最終保証とする。

## Review

- レビューは findings first で書く。
- 指摘は severity を意識し、根拠ファイルを示す。
- 問題がなければ「追加指摘なし」を明示する。
- 推測を含む場合は、その旨を明記する。

## Issue

- issue タイトルは対象と目的が判別できる具体的な文言にする。
- issue 本文には少なくとも `Summary` `Background` `Scope` `Acceptance Criteria` を含める。
- 実装しない内容や保留事項がある場合は `Out of Scope` または `Notes` を明記する。
- 検証観点や確認手順が見えている場合は `Verification` を追記する。
- 関連 issue / PR / 設計資料がある場合は本文から参照できるようにする。

## PR

- PR 本文には少なくとも `Summary` と `Verification` を含める。
- 影響範囲が広い場合は `Risks` か `Notes` を追記する。
- hook や CI による既存失敗がある場合は、今回変更と既存失敗を切り分けて書く。

## Hooks / CI Responsibilities

- `pre-commit`
  - formatter / linter
  - 差分に応じた軽い静的検証
- `pre-push`
  - 差分に応じた重いローカル検証
- `CI`
  - 全体 lint
  - 全体 typecheck
  - build
  - DB や外部依存を含む検証
