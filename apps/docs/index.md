---
layout: home

hero:
  name: "Quest Board Docs"
  text: "クエスト掲示板の開発資料"
  tagline: 初見の開発者が、全体像、起動手順、設計資料、実装規約へ迷わず進むためのドキュメントサイトです。
  actions:
    - theme: brand
      text: まず読む
      link: /handoff
    - theme: alt
      text: 要件を見る
      link: /quest-rdd
    - theme: alt
      text: APIを見る
      link: /quest-apis
    - theme: alt
      text: 操作マニュアル
      link: /user-manual

features:
  - title: 画面操作を確認する
    details: 実装済み画面の使い方、ログイン、クエスト参加、レビュー、マイページ、管理画面の操作手順を確認できます。
    link: /user-manual
    linkText: 操作マニュアルへ
  - title: ローカル環境を起動する
    details: env 作成、Google OAuth 設定、Docker / MySQL、Prisma、seed、FE / BE / docs の起動手順を確認できます。
    link: /setup-guide
    linkText: 環境構築・起動へ
  - title: 15分で把握する
    details: 引き継ぎ資料から、アプリ概要、起動手順、主要な参照先を短時間で確認できます。
    link: /handoff
    linkText: 引き継ぎ資料へ
  - title: 仕様と設計を見る
    details: 要件、API、ER図、テーブル定義、ログ設計を目的別に参照できます。
    link: /quest-rdd
    linkText: 要件定義へ
  - title: 実装の入口を探す
    details: frontend / backend のディレクトリ構成、コーディング規約、レビュー規約を確認できます。
    link: /quest-frontend-directory
    linkText: 実装ガイドへ
---

## 読む順番

初めてこのプロジェクトを見る場合は、次の順番で読むと全体像をつかみやすいです。

1. [引き継ぎ資料](./handoff.md)
2. [要件定義](./quest-rdd.md)
3. [API 一覧・設計方針](./quest-apis.md)
4. [テーブル定義](./quest-tdd.md)
5. [フロントエンド構成](./quest-frontend-directory.md) / [バックエンド構成](./quest-backend-directory.md)

## 目的別リンク

| やりたいこと | 参照先 |
| --- | --- |
| 短時間で概要を説明したい | [引き継ぎ資料](./handoff.md) |
| ローカル環境を起動したい | [環境構築・起動](./setup-guide.md) |
| 画面の操作手順を確認したい | [操作マニュアル](./user-manual.md) |
| エラーの原因を調べたい | [トラブルシューティング](./troubleshooting.md) |
| 機能要件を確認したい | [要件定義](./quest-rdd.md) |
| API の入口を確認したい | [API 一覧・設計方針](./quest-apis.md) |
| DB 構造を確認したい | [ER 図](./quest-er.md), [テーブル定義](./quest-tdd.md) |
| 画面やコンポーネントの配置を探したい | [フロントエンド構成](./quest-frontend-directory.md) |
| API / service / Prisma の配置を探したい | [バックエンド構成](./quest-backend-directory.md) |
| 実装ルールを確認したい | [コーディング規約](./coding-standards.md) |
| レビュー観点を確認したい | [レビュー規約](./review_standards.md) |
| ログの出し方を確認したい | [ログ設計](./logging-design.md) |
| UI の方向性を確認したい | [デザインガイド](./design-guide.md), [スタイルガイド](./style-guide.md) |

## このサイトの位置づけ

`apps/docs` は人間が参照する開発資料サイトです。セットアップ手順の正本はリポジトリルートの `README.md`、AI エージェント向け作業ルールの正本は `AGENTS.md` です。
