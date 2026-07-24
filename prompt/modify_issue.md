# 既存 issue 整理補助テンプレート

このファイルは補助テンプレートです。作業前に必ず `README.md`、`AGENTS.md`、`docs/architecture.md`、`docs/ai-execution.md` を確認してください。

## 目的

- 既存 issue の重複、粒度、命名、テンプレート逸脱を整理する
- 新規 issue を増やす前に既存 issue の構造を見直す

## 事前確認

1. `gh repo view`
2. `gh issue list --limit 200`
3. `gh label list`
4. 対象 issue ごとに `gh issue view <issue-number>`
5. issue template が導入済みなら、その必須項目と命名ルール

## 整理ルール

- タイトルと本文は日本語で書く
- 類似性判断はタイトルだけでなく本文も含める
- issue は勝手に削除せず、統合案、分割案、親子化案で整理する
- 判断に迷う場合は根拠を添えて暫定案を出す
- 変更提案には代表 issue、統合先、残課題を明記する

## 出力テンプレート

```md
# Issue 分析結果

## 重複 issue

- #

## 類似 issue

- #

## 改善案

- 代表 issue:
- 統合先:
- 分割が必要な論点:

## 備考

- 
```
