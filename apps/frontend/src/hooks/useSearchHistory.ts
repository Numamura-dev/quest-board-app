"use client";

/**
 * 検索履歴を localStorage に保存・取得するカスタムフック
 *
 * - 最大 5 件まで保存
 * - 最新の検索ワードが先頭に来るようにする
 * - 重複は除去する
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "quest_search_history";
const MAX_HISTORY = 5;

export function useSearchHistory() {
	const [history, setHistory] = useState<string[]>([]);

	// localStorage から履歴を読み込む
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					setHistory(
						parsed.filter((item): item is string => typeof item === "string"),
					);
				}
			}
		} catch {
			// localStorage が利用不可の場合は無視
		}
	}, []);

	/**
	 * 検索ワードを履歴に追加する
	 * - 空文字は追加しない
	 * - 重複は先頭に移動する
	 * - MAX_HISTORY 件を超えた場合は古いものを削除する
	 */
	const addHistory = useCallback((keyword: string) => {
		const trimmed = keyword.trim();
		if (!trimmed) return;

		setHistory((prev) => {
			const filtered = prev.filter((item) => item !== trimmed);
			const next = [trimmed, ...filtered].slice(0, MAX_HISTORY);

			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {
				// localStorage が利用不可の場合は無視
			}

			return next;
		});
	}, []);

	/**
	 * 検索履歴を全件削除する
	 */
	const clearHistory = useCallback(() => {
		setHistory([]);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// localStorage が利用不可の場合は無視
		}
	}, []);

	return { history, addHistory, clearHistory };
}
