import DifficultyBadge from "@/components/atoms/DifficultyBadge";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("DifficultyBadge", () => {
	it("初級 のとき緑のクラスが付く", () => {
		const { container } = render(<DifficultyBadge difficulty="初級" />);
		expect(container.firstChild).toHaveClass("bg-green-500");
	});

	it("中級 のとき黄色のクラスが付く", () => {
		const { container } = render(<DifficultyBadge difficulty="中級" />);
		expect(container.firstChild).toHaveClass("bg-yellow-500");
	});

	it("上級 のとき赤のクラスが付く", () => {
		const { container } = render(<DifficultyBadge difficulty="上級" />);
		expect(container.firstChild).toHaveClass("bg-red-500");
	});
});
