"use client";

import QuestJoinDialog from "@/components/organisms/QuestJoinDialog";
import QuestListCard, {
	type CompletedQuestButtonAction,
} from "@/components/organisms/QuestListCard";
import {
	filterQuests,
	getSuggestedQuests,
} from "@/components/organisms/questListFilters";
import {
	HIDDEN_QUEST_STATUSES,
	getQuestDifficultyBadgeClass,
	getQuestTypeIconKind,
} from "@/constants/questPresentation";
import { useAuth } from "@/hooks/useAuth";
import { questService } from "@/services/quest";
import { reviewService } from "@/services/review";
import { userService } from "@/services/user";
import type { Quest } from "@quest-board/types";
import { Book, Eye, MessageSquare, Search, Sword, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

const QUEST_SKELETON_KEYS = Array.from(
	{ length: 6 },
	(_, index) => `skeleton-card-${index + 1}`,
);

const QuestListSkeleton = () => (
	<div className="w-full">
		<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
			<div className="mb-8 space-y-4 animate-pulse">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="h-12 flex-1 rounded-lg bg-slate-700/80" />
					<div className="h-12 w-full rounded-lg bg-slate-700/70 sm:w-56" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
				{QUEST_SKELETON_KEYS.map((key) => (
					<div
						key={key}
						className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/70 shadow-lg"
					>
						<div className="space-y-4 p-6">
							<div className="flex items-center justify-between">
								<div className="h-8 w-8 rounded-full bg-slate-700" />
								<div className="h-6 w-24 rounded-full bg-slate-700" />
							</div>
							<div className="space-y-2">
								<div className="h-6 w-3/4 rounded bg-slate-600" />
								<div className="h-4 w-full rounded bg-slate-700" />
								<div className="h-4 w-5/6 rounded bg-slate-700" />
							</div>
							<div className="flex flex-wrap gap-2">
								<div className="h-6 w-16 rounded-full bg-slate-700" />
								<div className="h-6 w-20 rounded-full bg-slate-700" />
								<div className="h-6 w-14 rounded-full bg-slate-700" />
							</div>
							<div className="grid grid-cols-2 gap-3 pt-3">
								<div className="h-16 rounded-2xl bg-slate-700/80" />
								<div className="h-16 rounded-2xl bg-slate-700/80" />
							</div>
							<div className="h-11 rounded-2xl bg-slate-600/80" />
						</div>
					</div>
				))}
			</div>
		</section>
	</div>
);

const QuestList: React.FC = () => {
	const [quests, setQuests] = useState<Quest[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [startDateFilter, setStartDateFilter] = useState("");
	const [endDateFilter, setEndDateFilter] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
	const [buttonActions, setButtonActions] = useState<
		Map<number, CompletedQuestButtonAction>
	>(new Map());
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const searchContainerRef = useRef<HTMLDivElement | null>(null);
	const { user, isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		const fetchQuests = async () => {
			try {
				const data = await questService.getAllQuests();
				setQuests(data);
			} catch (err) {
				console.error(err);
				setQuests([]);
			} finally {
				setLoading(false);
			}
		};
		fetchQuests();
	}, []);

	useEffect(() => {
		const timerId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
		}, 200);

		return () => window.clearTimeout(timerId);
	}, [searchQuery]);

	// ユーザーIDを動的に取得
	useEffect(() => {
		const fetchUserId = async () => {
			if (!user || !isAuthenticated) {
				setCurrentUserId(null);
				return;
			}

			try {
				const userData = await userService.getCurrentUser();
				setCurrentUserId(userData.id);
			} catch (error) {
				console.error("QuestList: ユーザーID取得エラー:", error);
				setCurrentUserId(null);
			}
		};

		fetchUserId();
	}, [user, isAuthenticated]);

	// クエストデータが取得されたら、各クエストのボタンアクションを決定
	useEffect(() => {
		const updateButtonActions = async () => {
			if (quests.length === 0 || !currentUserId) return;

			const newButtonActions = new Map<number, CompletedQuestButtonAction>();
			for (const quest of quests) {
				if (quest.status === "completed") {
					const action = await getCompletedQuestButtonAction(quest);
					newButtonActions.set(quest.id, action);
				}
			}
			setButtonActions(newButtonActions);
		};

		updateButtonActions();
	}, [quests, currentUserId]);

	const getIconComponent = (questType: string) => {
		const iconKind = getQuestTypeIconKind(questType);
		if (iconKind === "wrench") {
			return <Wrench className="w-6 h-6" />;
		}
		if (iconKind === "book") {
			return <Book className="w-6 h-6" />;
		}
		return <Sword className="w-6 h-6" />;
	};

	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const formatCurrency = (amount?: string | number) => {
		if (!amount) return "-";
		const numAmount =
			typeof amount === "string" ? Number.parseFloat(amount) : amount;
		if (Number.isNaN(numAmount)) return "-";
		return new Intl.NumberFormat("ja-JP", {
			style: "currency",
			currency: "JPY",
			maximumFractionDigits: 0,
		}).format(numAmount);
	};

	// ユーザーがクエストに参加しているかどうかを判定
	const isUserParticipant = (quest: Quest): boolean => {
		if (!user || !isAuthenticated || !currentUserId) return false;

		const isParticipant =
			quest.quest_participants?.some((participant) => {
				return participant.user.id === currentUserId;
			}) || false;

		return isParticipant;
	};

	// ユーザーがレビューを投稿済みかどうかを判定
	const hasUserSubmittedReview = async (quest: Quest): Promise<boolean> => {
		if (!user || !isAuthenticated || !currentUserId) return false;

		const participant = quest.quest_participants?.find((p) => {
			return p.user.id === currentUserId;
		});

		if (!participant) return false;

		// 実際のAPIを呼び出してレビュー投稿状況を確認
		try {
			const response = await reviewService.checkUserReviewExists(
				currentUserId.toString(),
				quest.id.toString(),
			);
			return response.exists;
		} catch (error) {
			console.error("レビュー投稿状況確認エラー:", error);
			return false;
		}
	};

	// 完了したクエストのボタンアクションを決定
	const getCompletedQuestButtonAction = async (
		quest: Quest,
	): Promise<CompletedQuestButtonAction> => {
		if (!isAuthenticated) {
			return {
				text: "レビューを見る",
				action: () => router.push(`/quests/${quest.id}`),
				icon: Eye,
				className:
					"bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700",
			};
		}

		const isParticipant = isUserParticipant(quest);
		const hasSubmittedReview = await hasUserSubmittedReview(quest);

		if (isParticipant && !hasSubmittedReview) {
			return {
				text: "レビューを投稿する",
				action: () => router.push(`/quests/${quest.id}?action=review`),
				icon: MessageSquare,
				className:
					"bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
			};
		}

		return {
			text: "レビューを見る",
			action: () => router.push(`/quests/${quest.id}`),
			icon: Eye,
			className:
				"bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
		};
	};

	const handleJoinQuest = (quest: Quest) => {
		setSelectedQuest(quest);
		setIsDialogOpen(true);
	};

	const normalizedSearchQuery = debouncedSearchQuery.toLowerCase();
	const filterParams = {
		selectedFilter,
		normalizedSearchQuery,
		startDateFilter,
		endDateFilter,
		hiddenStatuses: HIDDEN_QUEST_STATUSES,
	};
	const filteredQuests = filterQuests(quests, filterParams);
	const suggestedQuests = getSuggestedQuests(quests, filterParams);

	if (loading) {
		return <QuestListSkeleton />;
	}

	return (
		<div className="w-full">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
				{/* Search and Filter */}
				<div className="mb-8 space-y-4">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-4 sm:flex-row">
							<div
								ref={searchContainerRef}
								className="relative flex-1"
								onBlur={(event) => {
									const nextTarget = event.relatedTarget as Node | null;
									if (
										nextTarget &&
										searchContainerRef.current?.contains(nextTarget)
									) {
										return;
									}

									setShowSuggestions(false);
								}}
							>
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="text"
									placeholder="クエストを検索..."
									value={searchQuery}
									onFocus={() => setShowSuggestions(true)}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
								/>

								{showSuggestions && normalizedSearchQuery.length > 0 && (
									<div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-800 shadow-xl">
										{suggestedQuests.length > 0 ? (
											<ul className="divide-y divide-slate-700">
												{suggestedQuests.map((quest) => (
													<li key={quest.id}>
														<button
															type="button"
															className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-700/80"
															onMouseDown={(event) => event.preventDefault()}
															onClick={() => {
																setSearchQuery(quest.title);
																setDebouncedSearchQuery(quest.title);
																setShowSuggestions(false);
															}}
														>
															<div>
																<p className="font-medium text-white">
																	{quest.title}
																</p>
																<p className="mt-1 text-xs text-slate-300">
																	開始日: {formatDate(quest.start_date)}
																</p>
															</div>
															<span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
																{quest.type}
															</span>
														</button>
													</li>
												))}
											</ul>
										) : (
											<div className="px-4 py-3 text-sm text-slate-300">
												タイトル一致する候補はありません
											</div>
										)}
									</div>
								)}
							</div>

							<select
								value={selectedFilter}
								onChange={(e) => setSelectedFilter(e.target.value)}
								className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
							>
								<option value="all">全てのクエスト</option>
								<option value="active">募集中</option>
								<option value="in_progress">進行中</option>
								<option value="inactive">停止中</option>
								<option value="completed">完了済み</option>
							</select>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">
									公開開始日 From
								</span>
								<input
									type="date"
									value={startDateFilter}
									onChange={(e) => setStartDateFilter(e.target.value)}
									className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
								/>
							</label>

							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">
									公開開始日 To
								</span>
								<input
									type="date"
									value={endDateFilter}
									min={startDateFilter || undefined}
									onChange={(e) => setEndDateFilter(e.target.value)}
									className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
								/>
							</label>

							<div className="flex items-end sm:col-span-2 xl:justify-end">
								<button
									type="button"
									className="w-full rounded-lg border border-slate-500 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-yellow-400 hover:text-yellow-300 xl:w-auto"
									onClick={() => {
										setSearchQuery("");
										setDebouncedSearchQuery("");
										setSelectedFilter("all");
										setStartDateFilter("");
										setEndDateFilter("");
										setShowSuggestions(false);
									}}
								>
									フィルタをリセット
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Quest Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{filteredQuests.map((quest) => (
						<QuestListCard
							key={quest.id}
							quest={quest}
							difficultyColor={getQuestDifficultyBadgeClass(quest.difficulty)}
							icon={getIconComponent(quest.type)}
							formatCurrency={formatCurrency}
							formatDate={formatDate}
							onJoin={handleJoinQuest}
							completedButtonAction={buttonActions.get(quest.id)}
						/>
					))}
				</div>

				{filteredQuests.length === 0 && (
					<div className="text-center py-12">
						<div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-300 mb-2">
							クエストが見つかりません
						</h3>
						<p className="text-gray-400">検索条件を変更してお試しください</p>
					</div>
				)}

				<QuestJoinDialog
					quest={selectedQuest}
					isOpen={isDialogOpen}
					onClose={() => setIsDialogOpen(false)}
				/>
			</main>
		</div>
	);
};

export default QuestList;
