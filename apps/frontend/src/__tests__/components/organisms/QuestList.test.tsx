import QuestList from "@/components/organisms/QuestList";
import { QuestDifficulty, QuestStatus, QuestType } from "@quest-board/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock("@/hooks/useAuth", () => ({
	useAuth: () => ({
		user: null,
		loading: false,
		isAuthenticated: false,
	}),
}));

vi.mock("@/services/quest", () => ({
	questService: {
		getAllQuests: vi.fn(),
	},
}));

vi.mock("@/services/review", () => ({
	reviewService: {
		checkUserReviewExists: vi.fn(),
	},
}));

vi.mock("@/services/user", () => ({
	userService: {
		getCurrentUser: vi.fn(),
	},
}));

vi.mock("@/components/organisms/QuestJoinDialog", () => ({
	default: () => null,
}));

vi.mock("@/components/atoms/StatusRibbon", () => ({
	default: () => <div data-testid="status-ribbon" />,
}));

import { questService } from "@/services/quest";

const mockQuest = {
	id: 1,
	title: "React レビュー改善",
	description: "検索導線の検証を行うクエスト",
	type: QuestType.Development,
	status: QuestStatus.Active,
	start_date: "2026-03-01T00:00:00Z",
	end_date: "2026-03-31T00:00:00Z",
	created_at: "2026-03-01T00:00:00Z",
	updated_at: "2026-03-01T00:00:00Z",
	rewards: { incentive_amount: 1000, point_amount: 10, note: "" },
	quest_participants: [],
	_count: { quest_participants: 0 },
	maxParticipants: 5,
	tags: ["React", "レビュー"],
	difficulty: QuestDifficulty.Beginner,
};

describe("QuestList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(questService.getAllQuests).mockResolvedValue([mockQuest]);
	});

	it("検索対象と入力例の補助文を表示する", async () => {
		render(<QuestList />);

		expect(
			await screen.findByPlaceholderText("タイトル・本文・タグで検索"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"タイトル・本文・タグを対象に検索できます。例: React、デザイン、レビュー",
			),
		).toBeInTheDocument();
		expect(
			screen.getByText("気になるキーワードを入力すると対象が絞り込まれます"),
		).toBeInTheDocument();
	});

	it("入力中は現在の検索語を補助文で案内する", async () => {
		const user = userEvent.setup();

		render(<QuestList />);

		const input = await screen.findByPlaceholderText(
			"タイトル・本文・タグで検索",
		);
		await user.type(input, "React");

		await waitFor(() => {
			expect(
				screen.getByText("タイトル・本文・タグから「React」を検索中"),
			).toBeInTheDocument();
		});
	});
});
