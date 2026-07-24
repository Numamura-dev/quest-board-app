import Tag from "@/components/atoms/Tag";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Tag", () => {
	it("テキストが表示される", () => {
		render(<Tag>開発</Tag>);
		expect(screen.getByText("開発")).toBeInTheDocument();
	});

	it("デフォルトカラーは blue", () => {
		const { container } = render(<Tag>テスト</Tag>);
		expect(container.firstChild).toHaveClass("text-blue-800");
	});

	it("color=green のとき緑系クラスが付く", () => {
		const { container } = render(<Tag color="green">テスト</Tag>);
		expect(container.firstChild).toHaveClass("text-green-800");
	});

	it("color=orange のときオレンジ系クラスが付く", () => {
		const { container } = render(<Tag color="orange">テスト</Tag>);
		expect(container.firstChild).toHaveClass("text-orange-800");
	});

	it("color=purple のとき紫系クラスが付く", () => {
		const { container } = render(<Tag color="purple">テスト</Tag>);
		expect(container.firstChild).toHaveClass("text-purple-800");
	});
});
