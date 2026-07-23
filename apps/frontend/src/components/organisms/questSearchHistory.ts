const QUEST_SEARCH_HISTORY_KEY = "quest-list:search-history";
const QUEST_SEARCH_HISTORY_LIMIT = 5;

const normalizeHistoryEntry = (value: string) => value.trim();

export const readQuestSearchHistory = () => {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const rawValue = window.localStorage.getItem(QUEST_SEARCH_HISTORY_KEY);
		if (!rawValue) {
			return [];
		}

		const parsed = JSON.parse(rawValue);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.map((entry) =>
				typeof entry === "string" ? normalizeHistoryEntry(entry) : "",
			)
			.filter((entry) => entry.length > 0)
			.slice(0, QUEST_SEARCH_HISTORY_LIMIT);
	} catch {
		return [];
	}
};

export const buildQuestSearchHistory = (history: string[], query: string) => {
	const normalizedQuery = normalizeHistoryEntry(query);
	if (!normalizedQuery) {
		return history;
	}

	return [
		normalizedQuery,
		...history.filter((entry) => entry !== normalizedQuery),
	].slice(0, QUEST_SEARCH_HISTORY_LIMIT);
};

export const persistQuestSearchHistory = (query: string) => {
	if (typeof window === "undefined") {
		return [];
	}

	const nextHistory = buildQuestSearchHistory(readQuestSearchHistory(), query);

	try {
		window.localStorage.setItem(
			QUEST_SEARCH_HISTORY_KEY,
			JSON.stringify(nextHistory),
		);
	} catch {
		// プライベートモードや容量超過で setItem が失敗しても検索機能は継続する。
	}

	return nextHistory;
};

export { QUEST_SEARCH_HISTORY_KEY, QUEST_SEARCH_HISTORY_LIMIT };
