import NotificationCard from "@/components/molecules/NotificationCard";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const baseNotification = {
	id: 1,
	message: "クエストが承認されました",
	timestamp: "2024/01/15 10:00",
};

describe("NotificationCard", () => {
	it("メッセージが表示される", () => {
		render(
			<NotificationCard notification={{ ...baseNotification, type: "info" }} />,
		);
		expect(screen.getByText("クエストが承認されました")).toBeInTheDocument();
	});

	it("タイムスタンプが表示される", () => {
		render(
			<NotificationCard notification={{ ...baseNotification, type: "info" }} />,
		);
		expect(screen.getByText("2024/01/15 10:00")).toBeInTheDocument();
	});

	it("type=success のとき success アイコン設定が適用される", () => {
		const { container } = render(
			<NotificationCard
				notification={{ ...baseNotification, type: "success" }}
			/>,
		);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("type=reward のとき reward アイコン設定が適用される", () => {
		const { container } = render(
			<NotificationCard
				notification={{ ...baseNotification, type: "reward" }}
			/>,
		);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("type=info のとき info アイコン設定が適用される", () => {
		const { container } = render(
			<NotificationCard notification={{ ...baseNotification, type: "info" }} />,
		);
		expect(container.firstChild).toBeInTheDocument();
	});
});
