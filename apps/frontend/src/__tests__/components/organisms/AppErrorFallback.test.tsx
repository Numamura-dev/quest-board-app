import type { AnchorHTMLAttributes } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppErrorFallback from "@/components/organisms/AppErrorFallback";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

describe("AppErrorFallback", () => {
	it("再試行ボタン押下時に onRetry を呼ぶ", () => {
		const onRetry = vi.fn();

		render(<AppErrorFallback onRetry={onRetry} />);

		fireEvent.click(screen.getByRole("button", { name: "再試行する" }));

		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it("トップページへ戻るリンクを表示する", () => {
		render(<AppErrorFallback />);

		expect(
			screen.getByRole("link", { name: "トップページへ戻る" }),
		).toHaveAttribute("href", "/");
	});

	it("props でタイトルとボタンラベルを上書きできる", () => {
		render(
			<AppErrorFallback title="カスタムエラー" retryLabel="再読み込みする" />,
		);

		expect(
			screen.getByRole("heading", { name: "カスタムエラー" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "再読み込みする" }),
		).toBeInTheDocument();
	});
});
