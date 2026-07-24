import { useAuth } from "@/hooks/useAuth";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Firebase モック
const mockUnsubscribe = vi.fn();
let authStateCallback: ((user: unknown) => void) | null = null;

vi.mock("firebase/auth", () => ({
	onAuthStateChanged: vi.fn((_auth, callback) => {
		authStateCallback = callback;
		return mockUnsubscribe;
	}),
}));

vi.mock("@/services/firebase", () => ({
	auth: {},
}));

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		authStateCallback = null;
	});

	it("初期状態では loading=true, user=null", () => {
		const { result } = renderHook(() => useAuth());
		expect(result.current.loading).toBe(true);
		expect(result.current.user).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("ログイン済みユーザーが渡されると user がセットされ loading=false になる", async () => {
		const mockUser = {
			uid: "test-uid",
			reload: vi.fn().mockResolvedValue(undefined),
		};

		const { result } = renderHook(() => useAuth());

		await act(async () => {
			authStateCallback?.(mockUser);
		});

		expect(result.current.user).toBe(mockUser);
		expect(result.current.loading).toBe(false);
		expect(result.current.isAuthenticated).toBe(true);
	});

	it("未ログイン（null）が渡されると isAuthenticated=false になる", async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			authStateCallback?.(null);
		});

		expect(result.current.user).toBeNull();
		expect(result.current.loading).toBe(false);
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("アンマウント時に unsubscribe が呼ばれる", () => {
		const { unmount } = renderHook(() => useAuth());
		unmount();
		expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
	});
});
