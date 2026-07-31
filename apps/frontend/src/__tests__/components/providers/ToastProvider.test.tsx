import { ToastProvider, useToast } from "@/components/providers/ToastProvider";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const ToastTrigger = () => {
	const { showToast } = useToast();
	return (
		<>
			<button
				type="button"
				onClick={() => showToast("保存しました。", "success")}
			>
				success
			</button>
			<button
				type="button"
				onClick={() => showToast("失敗しました。", "error")}
			>
				error
			</button>
		</>
	);
};

describe("ToastProvider", () => {
	it("複数 toast を表示し、dismiss できる", () => {
		render(
			<ToastProvider>
				<ToastTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "success" }));
		fireEvent.click(screen.getByRole("button", { name: "error" }));

		expect(screen.getByText("保存しました。")).toBeInTheDocument();
		expect(screen.getByText("失敗しました。")).toBeInTheDocument();

		fireEvent.click(screen.getAllByRole("button", { name: "通知を閉じる" })[0]);

		expect(screen.queryByText("保存しました。")).toBeNull();
		expect(screen.getByText("失敗しました。")).toBeInTheDocument();
	});

	it("一定時間後に自動で消える", () => {
		vi.useFakeTimers();

		render(
			<ToastProvider>
				<ToastTrigger />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "success" }));
		expect(screen.getByText("保存しました。")).toBeInTheDocument();

		act(() => {
			vi.advanceTimersByTime(4000);
		});

		expect(screen.queryByText("保存しました。")).toBeNull();
		vi.useRealTimers();
	});
});
