import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Quest Board Docs",
	description: "クエスト掲示板アプリケーションの開発資料",
	lang: "ja-JP",
	cleanUrls: true,
	themeConfig: {
		nav: [
			{ text: "はじめに", link: "/handoff" },
			{ text: "操作マニュアル", link: "/user-manual" },
			{ text: "要件", link: "/quest-rdd" },
			{ text: "API", link: "/quest-apis" },
			{ text: "DB", link: "/quest-tdd" },
			{ text: "規約", link: "/coding-standards" },
		],
		sidebar: [
			{
				text: "はじめに",
				items: [
					{ text: "ドキュメント入口", link: "/" },
					{ text: "引き継ぎ資料", link: "/handoff" },
					{ text: "環境構築・起動", link: "/setup-guide" },
					{ text: "運用手順書（Xserver VPS）", link: "/ops-guide" },
					{ text: "操作マニュアル", link: "/user-manual" },
					{ text: "トラブルシューティング", link: "/troubleshooting" },
					{ text: "要件定義", link: "/quest-rdd" },
				],
			},
			{
				text: "設計",
				items: [
					{ text: "API 一覧・設計方針", link: "/quest-apis" },
					{ text: "ER 図", link: "/quest-er" },
					{ text: "テーブル定義", link: "/quest-tdd" },
					{ text: "ログ設計", link: "/logging-design" },
				],
			},
			{
				text: "実装ガイド",
				items: [
					{ text: "フロントエンド構成", link: "/quest-frontend-directory" },
					{ text: "バックエンド構成", link: "/quest-backend-directory" },
					{ text: "コーディング規約", link: "/coding-standards" },
					{ text: "レビュー規約", link: "/review_standards" },
				],
			},
			{
				text: "UI / デザイン",
				items: [
					{ text: "デザインガイド", link: "/design-guide" },
					{ text: "スタイルガイド", link: "/style-guide" },
				],
			},
		],
		outline: {
			label: "このページの目次",
			level: [2, 3],
		},
		docFooter: {
			prev: "前へ",
			next: "次へ",
		},
		lastUpdated: {
			text: "最終更新",
			formatOptions: {
				dateStyle: "medium",
				timeStyle: "short",
			},
		},
		search: {
			provider: "local",
			options: {
				translations: {
					button: {
						buttonText: "検索",
						buttonAriaLabel: "検索",
					},
					modal: {
						displayDetails: "詳細を表示",
						resetButtonTitle: "検索条件をリセット",
						backButtonTitle: "検索を閉じる",
						noResultsText: "検索結果がありません",
						footer: {
							selectText: "選択",
							selectKeyAriaLabel: "Enter",
							navigateText: "移動",
							navigateUpKeyAriaLabel: "上矢印",
							navigateDownKeyAriaLabel: "下矢印",
							closeText: "閉じる",
							closeKeyAriaLabel: "Escape",
						},
					},
				},
			},
		},
	},
	lastUpdated: true,
});
