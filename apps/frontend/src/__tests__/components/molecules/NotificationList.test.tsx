import NotificationList from "@/components/organisms/NotificationList";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const notifications = [
	{
		id: 1,
		message: "通知1",
		type: "info" as const,
		timestamp: "2024/01/01 09:00",
	},
	{
		id: 2,
		message: "通知2",
		type: "success" as const,
		timestamp: "2024/01/02 10:00",
	},
];

describe("NotificationList", () => {
	it("通知がない場合「通知はありません」と表示される", () => {
		render(<NotificationList notifications={[]} />);
		expect(screen.getByText("通知はありません")).toBeInTheDocument();
	});

	it("notifications が未指定の場合「通知はありません」と表示される", () => {
		render(<NotificationList />);
		expect(screen.getByText("通知はありません")).toBeInTheDocument();
	});

	it("通知が存在する場合、メッセージが表示される", () => {
		render(<NotificationList notifications={notifications} />);
		expect(screen.getByText("通知1")).toBeInTheDocument();
		expect(screen.getByText("通知2")).toBeInTheDocument();
	});

	it("タイトル「通知」が表示される", () => {
		render(<NotificationList />);
		expect(screen.getByText("通知")).toBeInTheDocument();
	});
});
