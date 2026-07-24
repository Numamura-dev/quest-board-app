import { useSearchHistory } from "@/hooks/useSearchHistory";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// localStorage のモック
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
	writable: true,
});

describe("useSearchHistory", () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it("初期状態で空の履歴を返す", () => {
		const { result } = renderHook(() => useSearchHistory());
		expect(result.current.history).toEqual([]);
	});

	it("addHistory で検索ワードを追加できる", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("テスト");
		});

		expect(result.current.history).toEqual(["テスト"]);
	});

	it("addHistory で追加した順に先頭に積まれる", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("first");
		});
		act(() => {
			result.current.addHistory("second");
		});

		expect(result.current.history[0]).toBe("second");
		expect(result.current.history[1]).toBe("first");
	});

	it("重複するワードは先頭に移動され重複しない", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("abc");
		});
		act(() => {
			result.current.addHistory("xyz");
		});
		act(() => {
			result.current.addHistory("abc");
		});

		expect(result.current.history).toEqual(["abc", "xyz"]);
	});

	it("最大 5 件まで保存される", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("1");
			result.current.addHistory("2");
			result.current.addHistory("3");
			result.current.addHistory("4");
			result.current.addHistory("5");
			result.current.addHistory("6");
		});

		expect(result.current.history).toHaveLength(5);
		expect(result.current.history[0]).toBe("6");
	});

	it("空文字は追加されない", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("  ");
		});

		expect(result.current.history).toEqual([]);
	});

	it("clearHistory で履歴が全件削除される", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("test1");
			result.current.addHistory("test2");
		});

		act(() => {
			result.current.clearHistory();
		});

		expect(result.current.history).toEqual([]);
		expect(localStorageMock.removeItem).toHaveBeenCalled();
	});

	it("addHistory が localStorage に保存する", () => {
		const { result } = renderHook(() => useSearchHistory());

		act(() => {
			result.current.addHistory("saved");
		});

		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			"quest_search_history",
			expect.stringContaining("saved"),
		);
	});
});
