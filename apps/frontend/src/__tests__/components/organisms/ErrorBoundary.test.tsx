import type React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ErrorBoundary from "@/components/organisms/ErrorBoundary";

// エラーを意図的に投げるコンポーネント
function ThrowError({ message }: { message: string }): React.ReactElement {
	throw new Error(message);
}

// 正常にレンダリングされるコンポーネント
function NormalChild() {
	return <div>正常なコンテンツ</div>;
}

describe("ErrorBoundary", () => {
	beforeEach(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("子コンポーネントが正常なときは children をレンダリングする", () => {
		render(
			<ErrorBoundary>
				<NormalChild />
			</ErrorBoundary>,
		);
		expect(screen.getByText("正常なコンテンツ")).toBeInTheDocument();
	});

	it("子コンポーネントがエラーを投げたときはデフォルトのフォールバック UI を表示する", () => {
		render(
			<ErrorBoundary>
				<ThrowError message="テストエラーメッセージ" />
			</ErrorBoundary>,
		);
		expect(
			screen.getByText("予期しないエラーが発生しました"),
		).toBeInTheDocument();
		expect(
			screen.getByText("問題が解決しない場合は管理者にお問い合わせください。"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "再読み込み" }),
		).toBeInTheDocument();
	});

	it("カスタム fallback を渡したときはそれを表示する", () => {
		render(
			<ErrorBoundary fallback={<div>カスタムエラーUI</div>}>
				<ThrowError message="エラー" />
			</ErrorBoundary>,
		);
		expect(screen.getByText("カスタムエラーUI")).toBeInTheDocument();
		expect(
			screen.queryByText("予期しないエラーが発生しました"),
		).not.toBeInTheDocument();
	});

	it("再読み込みボタンをクリックすると window.location.reload が呼ばれる", async () => {
		const reloadMock = vi.fn();
		Object.defineProperty(window, "location", {
			value: { reload: reloadMock },
			writable: true,
		});

		render(
			<ErrorBoundary>
				<ThrowError message="エラー" />
			</ErrorBoundary>,
		);

		const button = screen.getByRole("button", { name: "再読み込み" });
		await userEvent.click(button);
		expect(reloadMock).toHaveBeenCalledTimes(1);
	});
});
