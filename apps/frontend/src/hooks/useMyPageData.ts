import { useToast } from "@/components/providers/ToastProvider";
import { getUserFacingErrorMessage } from "@/services/apiError";
import { authenticatedHttpRequest } from "@/services/httpClient";
import { questService } from "@/services/quest";
import type { Quest } from "@quest-board/types";
import { useEffect, useState } from "react";

type QuestEntry = { id: number };

export type MyPageQuestEntries = {
	participating: QuestEntry[];
	completed: QuestEntry[];
	applied: QuestEntry[];
};

type ApiNotification = {
	id: number;
	message: string;
	isRead: boolean;
	createdAt: string;
};

export type DisplayNotification = {
	id: number;
	message: string;
	type: "success" | "reward" | "info";
	timestamp: string;
};

export type MyPageQuestGroups = {
	participating: Quest[];
	completed: Quest[];
	applied: Quest[];
};

export const emptyQuestEntries = (): MyPageQuestEntries => ({
	participating: [],
	completed: [],
	applied: [],
});

export const emptyQuestGroups = (): MyPageQuestGroups => ({
	participating: [],
	completed: [],
	applied: [],
});

export const toDisplayNotification = (
	notification: ApiNotification,
): DisplayNotification => ({
	id: notification.id,
	message: notification.message,
	type: "info",
	timestamp: new Date(notification.createdAt).toLocaleString("ja-JP"),
});

export const categorizeQuestsByStatus = (
	quests: Quest[],
): MyPageQuestGroups => {
	const groups = emptyQuestGroups();

	for (const quest of quests) {
		const status = String(quest.status || "").toLowerCase();
		if (status === "active" || status === "in_progress") {
			groups.participating.push(quest);
			continue;
		}

		if (status === "completed") {
			groups.completed.push(quest);
			continue;
		}

		groups.applied.push(quest);
	}

	return groups;
};

export const useMyPageData = () => {
	const { showToast } = useToast();
	const [entries, setEntries] = useState<MyPageQuestEntries>(emptyQuestEntries);
	const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
	const [questGroups, setQuestGroups] =
		useState<MyPageQuestGroups>(emptyQuestGroups);

	useEffect(() => {
		let cancelled = false;

		const fetchMyPageData = async () => {
			try {
				const [entryResponse, notificationResponse] = await Promise.all([
					authenticatedHttpRequest<MyPageQuestEntries>({
						method: "GET",
						path: "/mypage/entries",
					}),
					authenticatedHttpRequest<ApiNotification[]>({
						method: "GET",
						path: "/mypage/notifications",
					}),
				]);

				if (cancelled) {
					return;
				}

				const nextEntries = entryResponse || emptyQuestEntries();
				setEntries(nextEntries);

				const questIds = Array.from(
					new Set([
						...nextEntries.participating.map((quest) => quest.id),
						...nextEntries.completed.map((quest) => quest.id),
						...nextEntries.applied.map((quest) => quest.id),
					]),
				);

				const allQuests = await questService.getAllQuests();
				if (cancelled) {
					return;
				}

				const relatedQuests = allQuests.filter((quest) =>
					questIds.includes(quest.id),
				);

				setQuestGroups(categorizeQuestsByStatus(relatedQuests));
				setNotifications(
					Array.isArray(notificationResponse)
						? notificationResponse.map(toDisplayNotification)
						: [],
				);
			} catch (error) {
				console.error("/mypage データ取得に失敗しました", error);
				if (!cancelled) {
					setEntries(emptyQuestEntries());
					setNotifications([]);
					setQuestGroups(emptyQuestGroups());
					showToast(
						getUserFacingErrorMessage(
							error,
							"マイページのデータ取得に失敗しました。",
						),
						"error",
					);
				}
			}
		};

		fetchMyPageData();

		return () => {
			cancelled = true;
		};
	}, [showToast]);

	return {
		entries,
		notifications,
		questGroups,
	};
};
