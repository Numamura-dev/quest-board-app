# 改善 issue 作成補助テンプレート

このファイルは補助テンプレートです。作業前に必ず `README.md`、`AGENTS.md`、`docs/architecture.md`、`docs/ai-execution.md` を確認してください。

## 目的

- 既存 issue を確認した上で、新規改善 issue を起票する
- issue テンプレートの必須項目を満たす
- 重複や粒度不整合を避ける

## 事前確認

1. `gh issue list --limit 200 --json number,title,body,labels,state`
2. 必要に応じて `gh issue view <issue-number>`
3. 関連コード、関連 docs
4. issue template が導入済みなら、その必須項目

## 作成ルール

- タイトルと本文は日本語で書く
- `Summary` `Background` `Scope` `Acceptance Criteria` を必ず含める
- 類似 issue があれば新規起票ではなく既存 issue への追記や参照を優先する
- 1 issue = 1 改善テーマを守る
- `Verification` と `References` を可能な範囲で埋める

## 出力テンプレート

```md
## Summary

- 

## Background

- 

## Scope

- 

## Acceptance Criteria

- [ ]

## Out of Scope

- 

## Verification

- 

## References

- 
```
