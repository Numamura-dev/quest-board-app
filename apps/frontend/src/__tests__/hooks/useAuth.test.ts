import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/services/auth/googleAuth", () => ({
	getIdToken: vi.fn().mockReturnValue(null),
	setIdToken: vi.fn(),
	clearIdToken: vi.fn(),
	decodeIdToken: vi.fn().mockReturnValue(null),
}));

import * as googleAuth from "@/services/auth/googleAuth";

const wrapper = ({ children }: { children: React.ReactNode }) =>
	React.createElement(AuthProvider, null, children);

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(googleAuth.getIdToken).mockReturnValue(null);
		vi.mocked(googleAuth.decodeIdToken).mockReturnValue(null);
	});

	it("初期状態では loading=false, user=null", async () => {
		const { result } = renderHook(() => useAuth(), { wrapper });
		expect(result.current.user).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});

	it("login を呼ぶと user がセットされ isAuthenticated=true になる", async () => {
		const mockUser = {
			sub: "google-sub-1",
			name: "Test User",
			email: "test@example.com",
		};
		vi.mocked(googleAuth.decodeIdToken).mockReturnValue(mockUser);

		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.login("mock-credential");
		});

		expect(result.current.user).toEqual(mockUser);
		expect(result.current.isAuthenticated).toBe(true);
	});

	it("logout を呼ぶと user が null になる", async () => {
		const mockUser = {
			sub: "google-sub-1",
			name: "Test User",
			email: "test@example.com",
		};
		vi.mocked(googleAuth.decodeIdToken).mockReturnValue(mockUser);

		const { result } = renderHook(() => useAuth(), { wrapper });

		act(() => {
			result.current.login("mock-credential");
		});
		expect(result.current.isAuthenticated).toBe(true);

		act(() => {
			result.current.logout();
		});
		expect(result.current.user).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});
});
