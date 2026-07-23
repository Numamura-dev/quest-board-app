# AI Agent Rules

このリポジトリで作業する AI エージェントは、このファイルを最優先の共通ルールとして扱う。

<<<<<<< HEAD
## 参照順序

=======
>>>>>>> origin/main
作業開始時の参照順序:

1. ユーザーの最新依頼
2. `README.md`
3. `AGENTS.md`
4. `docs/architecture.md`
5. `docs/ai-execution.md`
6. `prompt/agent.md`
7. 関連コード / 関連テスト

判断が衝突した場合の優先順位:

1. ユーザーの最新依頼
2. `AGENTS.md`
3. `docs/ai-execution.md`
4. `docs/architecture.md`
5. `README.md`
6. 補助 prompt / 互換 docs

<<<<<<< HEAD
## 責務

- このファイルは AI エージェント共通ルールのみを定義する
- システム構造とレイヤー責務は `docs/architecture.md` に集約する
- 実行フローと検証方針は `docs/ai-execution.md` に集約する
- 他エージェント向けの短い依頼テンプレートは `prompt/agent.md` に置く
- セットアップや repo 全体像は `README.md` を正本とする

## General
=======
責務:

- このファイルは AI エージェント共通ルールのみを定義する
- アーキテクチャの詳細は `docs/architecture.md` に集約する
- 実行フェーズや検証手順は `docs/ai-execution.md` に集約する
- 汎用プロンプトは `prompt/agent.md` に集約する
- セットアップや repo 全体像は `README.md` を正本とする

---

# General
>>>>>>> origin/main

- 返答、レビューコメント、PR 本文は日本語で記述する。
- まず既存実装と既存差分を確認し、前提を決め打ちしない。
- ユーザーが作成した未コミット差分は勝手に戻さない。
- 破壊的コマンドは、明示的な依頼または承認がある場合のみ実行する。
- 調査せずに質問してはならない。
- 不明点がある場合でも、まず既存コードから仮説を立てて進める。
- ドキュメント間で矛盾がある場合は、ユーザー指示を除きこのファイルを優先する。

<<<<<<< HEAD
## Git / Branch

- issue 対応は原則 `git worktree` で分離する。
- 作業ブランチは 1 issue / 1 task ごとに切る。
- 既存 PR がマージ済みの場合は、必要に応じて新しいブランチと PR を作り直す。
- push 前に upstream との差分と競合有無を確認する。

## Editing
=======
---

# Working Flow

実装作業は必ず以下の順序で行う。

1. AGENTS.md を確認する
2. 既存コードと既存差分を調査する
3. 実装方針を決める
4. 最小変更で実装する
5. テストを追加する
6. 検証を実行する
7. 変更内容をまとめる

---

# Git / Branch

- issue 対応は原則 `git worktree` で分離する。
- 作業ブランチは 1 issue / 1 task ごとに切る。
- push 前に upstream との差分と競合有無を確認する。

---

# Editing
>>>>>>> origin/main

- 手動編集は `apply_patch` を使う。
- 変更は必要最小限にとどめる。
- unrelated な修正を混ぜない。
<<<<<<< HEAD
- frontend / backend / docs をまたぐ変更は、なぜまたぐ必要があるかを説明する。

## Validation

- 実装後は、可能な範囲でテスト、型チェック、ビルドを実行する。
- 実装を行った場合は単体テストを追加する。
- 実行できなかった検証や、既存不具合で失敗した検証は必ず明記する。
- pre-commit は軽い差分検証に限定する。
- pre-push は重いローカル検証に使う。
- CI はリポジトリ全体の最終保証とする。

## Review

- レビューは findings first で書く。
- 指摘は severity を意識し、根拠ファイルを示す。
- 問題がなければ「追加指摘なし」を明示する。
- 推測を含む場合は、その旨を明記する。

## Issue / PR

- issue タイトルは対象と目的が判別できる具体的な文言にする。
- issue 本文には少なくとも `Summary` `Background` `Scope` `Acceptance Criteria` を含める。
- PR 本文には少なくとも `Summary` と `Verification` を含める。
- 影響範囲が広い場合は `Risks` か `Notes` を追記する。
- hook や CI による既存失敗がある場合は、今回変更と既存失敗を切り分けて書く。
=======

---

# Validation

実装後は以下を可能な範囲で実行する。

- テスト
- 型チェック
- ビルド
- hook 失敗を報告する場合は、「worktree 側の pre-commit hook は ... で実行できなかったため、... で代替した」のように対象・原因・代替確認を具体的に書く。

---

# Question Policy

質問は最後の手段とする。

以下の場合のみ質問してよい。

1. リポジトリ内に情報が存在しない
2. 仕様が完全に未定義
3. 複数の設計選択があり判断不能

それ以外の場合は仮説を立てて実装する。
>>>>>>> origin/main
