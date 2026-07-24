"use client";

import {
	getQuestStatusBadgeClass,
	getQuestStatusLabel,
} from "@/constants/questPresentation";
import { useAuth } from "@/hooks/useAuth";
import type { Quest } from "@quest-board/types";
import {
	AlertCircle,
	Check,
	ChevronDown,
	Clock,
	Coins,
	Crown,
	Edit,
	Eye,
	EyeOff,
	Filter,
	Plus,
	RefreshCw,
	Search,
	Shield,
	Star,
	Sword,
	Trash2,
	Trophy,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { questService } from "../../services/quest";
import { type UserResponse, userService } from "../../services/user";
import { QuestEditorForm } from "./QuestEditorForm";
import {
	DEFAULT_QUEST_FORM_DATA,
	type QuestFormData,
} from "./questEditorUtils";

type QuestPriority = "critical" | "high" | "medium" | "low";
type QuestCategory = "education" | "security" | "event" | "innovation";

const AdminDashboard = () => {
	const { loading: authLoading, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState<"dashboard" | "quests" | "users">(
		"dashboard",
	);
	const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
	const [quests, setQuests] = useState<Quest[]>([]);
	const [users, setUsers] = useState<UserResponse[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreateQuestOpen, setIsCreateQuestOpen] = useState<boolean>(false);
	const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);
	const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
	const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	// トースト通知を表示する関数
	const showToast = (message: string) => {
		setToastMessage(message);
		setTimeout(() => {
			setToastMessage(null);
		}, 3000); // 3秒後に自動で非表示
	};

	const getErrorMessage = (error: unknown) => {
		if (error instanceof Error && error.message.startsWith("HTTP 403")) {
			return "管理者権限が必要です";
		}
		return "データの取得に失敗しました";
	};

	// クエストデータとユーザーデータを取得
	// biome-ignore lint/correctness/useExhaustiveDependencies: authLoading と isAuthenticated のみをトリガーとして意図的に使用
	useEffect(() => {
		if (authLoading) {
			return;
		}

		if (!isAuthenticated) {
			setLoading(false);
			setError("管理画面の表示にはログインが必要です");
			return;
		}

		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				// クエストデータとユーザーデータを並行取得（管理者用：削除済みも含む）
				const [questData, userData] = await Promise.all([
					questService.getAllQuestsIncludingDeleted(),
					userService.getAllUsers(),
				]);

				setQuests(questData);

				setUsers(userData);
			} catch (err) {
				console.error("Failed to fetch data:", err);
				setError(getErrorMessage(err));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [authLoading, isAuthenticated]);

	const dashboardStats = {
		totalQuests: quests.length,
		pendingQuests: quests.filter((q) => (q.status as string) === "pending")
			.length,
		completedQuests: quests.filter((q) => q.status === "completed").length,
		activeUsers: users.length,
		totalRewards: quests.reduce(
			(sum, quest) => sum + (quest.rewards?.point_amount || 0),
			0,
		),
	};

	const getPriorityColor = (priority: QuestPriority): string => {
		switch (priority) {
			case "critical":
				return "text-red-600";
			case "high":
				return "text-orange-600";
			case "medium":
				return "text-yellow-600";
			case "low":
				return "text-green-600";
			default:
				return "text-gray-600";
		}
	};

	const filteredQuests = quests.filter((quest) => {
		const matchesSearch = quest.title
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		let matchesFilter = false;
		if (filterStatus === "all") {
			matchesFilter = true;
		} else if (filterStatus === "deleted") {
			// 削除済みクエストのフィルタリング
			matchesFilter =
				quest.deleted_at !== null && quest.deleted_at !== undefined;
		} else {
			// 通常のステータスフィルタリング（削除済みでないクエストのみ）
			matchesFilter = quest.status === filterStatus && !quest.deleted_at;
		}

		return matchesSearch && matchesFilter;
	});

	const handleQuestAction = async (
		questId: number,
		action: string,
	): Promise<void> => {
		try {
			if (action === "approve") {
				await questService.updateQuestStatus(questId.toString(), "active");
			} else if (action === "reject") {
				await questService.updateQuestStatus(questId.toString(), "draft");
				// 却下時のトースト通知表示（API呼び出し成功後）
				showToast("クエストを却下しました。ステータスが下書きに戻されました。");
			} else if (action === "hide") {
				await questService.updateQuestStatus(questId.toString(), "inactive");
			} else if (action === "publish") {
				await questService.updateQuestStatus(questId.toString(), "active");
			} else if (action === "submit_for_approval") {
				await questService.updateQuestStatus(questId.toString(), "pending");
				// 承認待ち申請時のトースト通知表示
				showToast(
					"クエストを承認待ちにしました。管理者の承認をお待ちください。",
				);
			} else if (action === "start_progress") {
				await questService.updateQuestStatus(questId.toString(), "in_progress");
				// 進行中開始時のトースト通知表示
				showToast("クエストを進行中にしました。");
			} else if (action === "complete") {
				await questService.updateQuestStatus(questId.toString(), "completed");
				// 完了時のトースト通知表示
				showToast("クエストを完了にしました。");
			} else if (action === "reactivate") {
				await questService.reactivateQuest(questId.toString());
			} else if (action === "submit_for_approval") {
				await questService.submitQuestForApproval(questId.toString());
				// 承認待ち申請時のトースト通知表示
				showToast("クエストを承認待ちに申請しました。");
			} else if (action === "restore") {
				await questService.restoreQuest(questId.toString());
				// 復元時のトースト通知表示
				showToast("クエストを復元しました。");
			} else if (action === "edit") {
				const quest = quests.find((q) => q.id === questId);
				if (quest) {
					setQuestToEdit(quest);
					return;
				}
			} else if (action === "delete") {
				const quest = quests.find((q) => q.id === questId);
				if (quest) {
					setQuestToDelete(quest);
					return;
				}
			}

			// クエストリストを再取得（管理者用：削除済みも含む）
			const questData = await questService.getAllQuestsIncludingDeleted();
			setQuests(questData);
			setSelectedQuest(null);
		} catch (err) {
			console.error(`Failed to ${action} quest:`, err);
			setError(`クエストの${action}に失敗しました`);
		}
	};

	const handleUserAction = async (
		userId: number,
		action: string,
		newRole?: string,
	) => {
		try {
			if (action === "delete") {
				const user = users.find((u) => u.id === userId);
				if (user) {
					setUserToDelete(user);
					return;
				}
			} else if (action === "updateRole" && newRole) {
				await userService.updateUserRole(userId, newRole);
				showToast(`ユーザーのロールを${newRole}に変更しました`);

				// ユーザーリストを再取得
				const userData = await userService.getAllUsers();
				setUsers(userData);
			}
		} catch (error) {
			console.error("ユーザーアクションエラー:", error);
			showToast("操作に失敗しました");
		}
	};

	const handleDeleteConfirm = async (): Promise<void> => {
		if (!questToDelete) return;

		try {
			await questService.deleteQuest(questToDelete.id.toString());

			// クエストリストを再取得（管理者用：削除済みも含む）
			const questData = await questService.getAllQuestsIncludingDeleted();
			setQuests(questData);
			setQuestToDelete(null);
			setSelectedQuest(null);
		} catch (err) {
			console.error("Failed to delete quest:", err);
			setError("クエストの削除に失敗しました");
		}
	};

	const handleUserDeleteConfirm = async (): Promise<void> => {
		if (!userToDelete) return;

		try {
			await userService.deleteUser(userToDelete.id);

			// ユーザーリストを再取得
			const userData = await userService.getAllUsers();
			setUsers(userData);
			setUserToDelete(null);
			showToast("ユーザーを削除しました");
		} catch (err) {
			console.error("Failed to delete user:", err);
			setError("ユーザーの削除に失敗しました");
		}
	};

	const StatCard = ({
		title,
		value,
		icon: Icon,
		color,
	}: {
		title: string;
		value: string | number;
		icon: React.ComponentType<{ className?: string }>;
		color: string;
	}) => (
		<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-slate-800 text-sm font-medium">{title}</p>
					<p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
				</div>
				<div className={`p-3 rounded-full ${color}`}>
					<Icon className="w-6 h-6 text-white" />
				</div>
			</div>
		</div>
	);

	const QuestRow = ({
		quest,
		onClick,
	}: {
		quest: Quest;
		onClick: (quest: Quest) => void;
	}) => (
		// biome-ignore lint/a11y/useKeyWithClickEvents: クリック専用インタラクション（キーボードナビゲーションは別途対応予定）
		<div
			className={`rounded-lg p-4 border-2 transition-all duration-300 cursor-pointer ${
				quest.deleted_at
					? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400 opacity-60"
					: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300 hover:shadow-md"
			}`}
			onClick={() => onClick(quest)}
		>
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h3 className="font-semibold text-slate-800">{quest.title}</h3>
						<span
							className={`px-2 py-1 rounded-full text-xs text-white ${getQuestStatusBadgeClass(
								quest.status,
							)}`}
						>
							{getQuestStatusLabel(quest.status)}
						</span>
						{quest.deleted_at && (
							<span className="px-2 py-1 rounded-full text-xs text-white bg-red-500">
								削除済み
							</span>
						)}
						{/* Priority is not available in Quest interface */}
					</div>
					<div className="flex items-center gap-4 mt-2 text-sm text-slate-800">
						<span className="flex items-center gap-1">
							<Users className="w-4 h-4" />
							{quest._count.quest_participants}/{quest.maxParticipants}名
						</span>
						<span className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							{new Date(quest.end_date).toLocaleDateString("ja-JP")}
						</span>
					</div>
				</div>
				<ChevronDown className="w-5 h-5 text-amber-600" />
			</div>
		</div>
	);

	const CreateQuestForm = ({ onClose }: { onClose: () => void }) => {
		const handleSubmit = async (formData: QuestFormData) => {
			try {
				const tagsArray = formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0);

				await questService.createQuest({
					title: formData.title,
					description: formData.description,
					type: formData.type,
					status: formData.status,
					maxParticipants: formData.maxParticipants,
					tags: tagsArray,
					start_date: formData.start_date,
					end_date: formData.end_date,
					incentive_amount: formData.incentive_amount,
					point_amount: formData.point_amount,
					note: formData.note,
				});

				// クエストリストを再取得（管理者用：削除済みも含む）
				const questData = await questService.getAllQuestsIncludingDeleted();
				setQuests(questData);
				onClose();
			} catch (err) {
				console.error("Failed to create quest:", err);
				setError("クエストの作成に失敗しました");
			}
		};

		return (
			<QuestEditorForm
				title="新しいクエストを作成"
				submitLabel="クエストを作成"
				submittingLabel="作成中..."
				draftStorageKey="quest-editor:create"
				initialData={DEFAULT_QUEST_FORM_DATA}
				onSubmit={handleSubmit}
				onClose={onClose}
			/>
		);
	};

	const EditQuestForm = ({
		quest,
		onClose,
	}: {
		quest: Quest;
		onClose: () => void;
	}) => {
		const initialData = useMemo(
			(): QuestFormData => ({
				title: quest.title,
				description: quest.description,
				type: quest.type,
				status: quest.status,
				maxParticipants: quest.maxParticipants,
				tags: (quest.tags ?? []).join(", "),
				start_date: quest.start_date.split("T")[0],
				end_date: quest.end_date.split("T")[0],
				incentive_amount: Number(quest.rewards?.incentive_amount) || 0,
				point_amount: Number(quest.rewards?.point_amount) || 0,
				note: quest.rewards?.note || "",
			}),
			// quest オブジェクト全体を deps にすることで、quest が切り替わったときのみ再生成する
			[quest],
		);

		const handleSubmit = async (formData: QuestFormData) => {
			try {
				const tagsArray = formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0);

				await questService.updateQuest(quest.id.toString(), {
					title: formData.title,
					description: formData.description,
					type: formData.type,
					status: formData.status,
					maxParticipants: formData.maxParticipants,
					tags: tagsArray,
					start_date: formData.start_date,
					end_date: formData.end_date,
					incentive_amount: formData.incentive_amount || 0,
					point_amount: formData.point_amount || 0,
					note: formData.note,
				});

				// クエストリストを再取得（管理者用：削除済みも含む）
				const questData = await questService.getAllQuestsIncludingDeleted();
				setQuests(questData);
				showToast("クエストを更新しました。");
				onClose();
			} catch (err) {
				console.error("Failed to update quest:", err);
				setError("クエストの更新に失敗しました");
			}
		};

		return (
			<QuestEditorForm
				title="クエストを編集"
				submitLabel="クエストを更新"
				submittingLabel="更新中..."
				draftStorageKey={`quest-editor:edit:${quest.id}`}
				initialData={initialData}
				onSubmit={handleSubmit}
				onClose={onClose}
			/>
		);
	};

	const DeleteConfirmDialog = ({
		quest,
		onConfirm,
		onCancel,
	}: {
		quest: Quest;
		onConfirm: () => void;
		onCancel: () => void;
	}) => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 max-w-md w-full mx-4 border-4 border-amber-300">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl font-bold text-slate-800 font-serif">
						クエストを削除
					</h2>
					<button
						type="button"
						onClick={onCancel}
						className="text-amber-600 hover:text-amber-800"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-slate-800 mb-4">
						以下のクエストを削除してもよろしいですか？
					</p>
					<div className="bg-white p-4 rounded-lg border-2 border-amber-200">
						<h3 className="font-semibold text-slate-800 mb-2">{quest.title}</h3>
						<p className="text-sm text-slate-600 line-clamp-2">
							{quest.description}
						</p>
					</div>
					<p className="text-orange-600 text-sm mt-4 font-medium">
						⚠️この操作によりクエストが削除されます。データは保持され、必要に応じて復元可能です。
					</p>
				</div>

				<div className="flex gap-2 justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
					>
						キャンセル
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						削除する
					</button>
				</div>
			</div>
		</div>
	);

	const UserDeleteConfirmDialog = ({
		user,
		onConfirm,
		onCancel,
	}: {
		user: UserResponse;
		onConfirm: () => void;
		onCancel: () => void;
	}) => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 max-w-md w-full mx-4 border-4 border-amber-300">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-xl font-bold text-slate-800 font-serif">
						ユーザーを削除
					</h2>
					<button
						type="button"
						onClick={onCancel}
						className="text-amber-600 hover:text-amber-800"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-slate-800 mb-4">
						以下のユーザーを削除してもよろしいですか？
					</p>
					<div className="bg-white p-4 rounded-lg border-2 border-amber-200">
						<h3 className="font-semibold text-slate-800 mb-2">{user.name}</h3>
						<p className="text-sm text-slate-600">{user.email}</p>
						<p className="text-sm text-slate-600">ロール: {user.role}</p>
					</div>
					<p className="text-red-600 text-sm mt-4 font-medium">
						⚠️この操作によりユーザーとFirebase認証が完全に削除されます。関連するクエスト参加履歴やレビューも削除される可能性があります。
					</p>
				</div>

				<div className="flex gap-2 justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
					>
						キャンセル
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						削除する
					</button>
				</div>
			</div>
		</div>
	);

	const QuestDetail = ({
		quest,
		onClose,
	}: {
		quest: Quest;
		onClose: () => void;
	}) => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border-4 border-amber-300">
				<div className="flex justify-between items-start mb-4">
					<h2 className="text-2xl font-bold text-slate-800 font-serif">
						{quest.title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-amber-600 hover:text-amber-800"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="grid grid-cols-2 gap-4 mb-4">
					<div className="text-sm">
						<span className="font-medium text-slate-800">ステータス: </span>
						<span
							className={`px-2 py-1 rounded-full text-xs text-white ${getQuestStatusBadgeClass(
								quest.status,
							)}`}
						>
							{getQuestStatusLabel(quest.status)}
						</span>
					</div>
					<div className="text-sm">
						<span className="font-medium text-slate-800">優先度: </span>
						{/* Priority is not available in Quest interface */}
					</div>
					<div className="text-sm">
						<span className="font-medium text-slate-800">参加者: </span>
						<span>
							{quest._count.quest_participants}/{quest.maxParticipants}名
						</span>
					</div>
				</div>

				<div className="mb-4">
					<h3 className="font-semibold text-slate-800 mb-2">クエスト詳細</h3>
					<p className="text-slate-800 text-sm leading-relaxed">
						{quest.description}
					</p>
				</div>

				<div className="mb-6">
					<h3 className="font-semibold text-slate-800 mb-2">タグ</h3>
					<div className="flex flex-wrap gap-2">
						{quest.tags?.map((tag) => (
							<span
								key={tag}
								className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
							>
								{tag}
							</span>
						)) || <span className="text-gray-500 text-sm">タグなし</span>}
					</div>
				</div>

				<div className="flex gap-2 flex-wrap">
					{(quest.status as string) === "pending" && (
						<>
							<button
								type="button"
								onClick={() => handleQuestAction(quest.id, "approve")}
								className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							>
								<Check className="w-4 h-4" />
								承認
							</button>
							<button
								type="button"
								onClick={() => handleQuestAction(quest.id, "reject")}
								className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
							>
								<X className="w-4 h-4" />
								却下
							</button>
						</>
					)}
					{(quest.status as string) === "active" && (
						<>
							<button
								type="button"
								onClick={() => handleQuestAction(quest.id, "start_progress")}
								className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
							>
								<Clock className="w-4 h-4" />
								進行中にする
							</button>
							<button
								type="button"
								onClick={() => handleQuestAction(quest.id, "hide")}
								className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
							>
								<EyeOff className="w-4 h-4" />
								非公開にする
							</button>
						</>
					)}
					{(quest.status as string) === "draft" && (
						<>
							<button
								type="button"
								onClick={() =>
									handleQuestAction(quest.id, "submit_for_approval")
								}
								className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
							>
								<Clock className="w-4 h-4" />
								承認待ちにする
							</button>
							<button
								type="button"
								onClick={() => handleQuestAction(quest.id, "publish")}
								className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								<Eye className="w-4 h-4" />
								公開
							</button>
						</>
					)}
					{(quest.status as string) === "inactive" && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "submit_for_approval")}
							className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
						>
							<Clock className="w-4 h-4" />
							承認待ちにする
						</button>
					)}
					{(quest.status as string) === "in_progress" && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "complete")}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							<Check className="w-4 h-4" />
							完了にする
						</button>
					)}
					{(quest.status as string) === "inactive" && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "reactivate")}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							再公開
						</button>
					)}
					{!quest.deleted_at && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "edit")}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<Edit className="w-4 h-4" />
							編集
						</button>
					)}
					{!quest.deleted_at && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "delete")}
							className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							<Trash2 className="w-4 h-4" />
							削除
						</button>
					)}
					{quest.deleted_at && (
						<button
							type="button"
							onClick={() => handleQuestAction(quest.id, "restore")}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							復元
						</button>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* タブナビゲーション */}
				<div className="mb-8">
					<div className="flex space-x-1 bg-amber-100 p-1 rounded-lg border-2 border-amber-200">
						{(
							[
								{ id: "dashboard", label: "ダッシュボード", icon: Shield },
								{ id: "quests", label: "クエスト管理", icon: Sword },
								{ id: "users", label: "ユーザー管理", icon: Users },
							] as const
						).map((tab) => (
							<button
								type="button"
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
									activeTab === tab.id
										? "bg-blue-600 text-white shadow-md"
										: "text-slate-800 hover:bg-amber-200"
								}`}
							>
								<tab.icon className="w-4 h-4" />
								<span>{tab.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* ダッシュボード */}
				{activeTab === "dashboard" && (
					<div className="space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<StatCard
								title="総クエスト数"
								value={dashboardStats.totalQuests}
								icon={Sword}
								color="bg-blue-600"
							/>
							<StatCard
								title="承認待ち"
								value={dashboardStats.pendingQuests}
								icon={Clock}
								color="bg-yellow-600"
							/>
							<StatCard
								title="完了クエスト"
								value={dashboardStats.completedQuests}
								icon={Trophy}
								color="bg-green-600"
							/>
						</div>

						<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border-2 border-amber-200">
							<h2 className="text-xl font-bold text-slate-800 mb-4 font-serif">
								最近のアクティビティ
							</h2>
							<div className="space-y-3">
								<div className="flex items-center gap-3 text-sm">
									<AlertCircle className="w-4 h-4 text-yellow-600" />
									<span className="text-slate-800">
										新しいクエスト「AIツール導入の検証」が申請されました
									</span>
									<span className="text-amber-600 text-xs">2時間前</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<Check className="w-4 h-4 text-green-600" />
									<span className="text-slate-800">
										クエスト「チームビルディングイベント企画」が完了しました
									</span>
									<span className="text-amber-600 text-xs">1日前</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<Plus className="w-4 h-4 text-blue-600" />
									<span className="text-slate-800">
										新しいユーザー「山田 次郎」が参加しました
									</span>
									<span className="text-amber-600 text-xs">3日前</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* クエスト管理 */}
				{activeTab === "quests" && (
					<div className="space-y-6">
						<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
							<div>
								<h2 className="text-3xl font-bold text-gray-300 mb-2">
									クエスト管理
								</h2>
								{!loading && (
									<p className="text-sm text-gray-300 mt-1">
										{filteredQuests.length}件のクエスト
									</p>
								)}
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setIsCreateQuestOpen(true)}
									className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
								>
									<Plus className="w-4 h-4" />
									新しいクエストを作成
								</button>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
									<input
										type="text"
										placeholder="クエストを検索..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 pr-10 py-2 border-2 border-amber-300 rounded-lg bg-amber-50 text-slate-800 placeholder-amber-600 focus:outline-none focus:border-yellow-400"
									/>
									{searchTerm && (
										<button
											type="button"
											onClick={() => setSearchTerm("")}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
											title="検索をクリア"
										>
											<X className="w-4 h-4" />
										</button>
									)}
								</div>

								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="px-4 py-2 border-2 border-amber-300 rounded-lg bg-amber-50 text-slate-800 focus:outline-none focus:border-yellow-400"
								>
									<option value="all">全て</option>
									<option value="pending">承認待ち</option>
									<option value="active">公開中</option>
									<option value="completed">完了</option>
									<option value="draft">下書き</option>
									<option value="in_progress">進行中</option>
									<option value="inactive">停止中</option>
									<option value="deleted">削除済み</option>
								</select>
							</div>
						</div>

						{loading ? (
							<div className="flex justify-center items-center py-12">
								<div className="text-slate-800">読み込み中...</div>
							</div>
						) : error ? (
							<div className="flex justify-center items-center py-12">
								<div className="text-red-600">{error}</div>
							</div>
						) : (
							<div className="space-y-3">
								{filteredQuests.map((quest) => (
									<QuestRow
										key={quest.id}
										quest={quest}
										onClick={setSelectedQuest}
									/>
								))}
								{filteredQuests.length === 0 && (
									<div className="text-center py-12">
										<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-8 border-2 border-amber-200">
											<Search className="w-16 h-16 text-amber-600 mx-auto mb-4 opacity-50" />
											<h3 className="text-xl font-semibold text-slate-800 mb-2">
												クエストが見つかりませんでした
											</h3>
											<p className="text-slate-600 mb-4">
												{searchTerm && filterStatus === "all" && (
													<>
														「
														<span className="font-semibold text-amber-700">
															{searchTerm}
														</span>
														」に一致するクエストはありません。
													</>
												)}
												{!searchTerm && filterStatus !== "all" && (
													<>
														<span className="font-semibold text-amber-700">
															{filterStatus === "pending" && "承認待ち"}
															{filterStatus === "active" && "公開中"}
															{filterStatus === "completed" && "完了"}
															{filterStatus === "draft" && "下書き"}
															{filterStatus === "in_progress" && "進行中"}
															{filterStatus === "inactive" && "停止中"}
															{filterStatus === "deleted" && "削除済み"}
														</span>
														のクエストはありません。
													</>
												)}
												{searchTerm && filterStatus !== "all" && (
													<>
														「
														<span className="font-semibold text-amber-700">
															{searchTerm}
														</span>
														」で
														<span className="font-semibold text-amber-700">
															{filterStatus === "pending" && "承認待ち"}
															{filterStatus === "active" && "公開中"}
															{filterStatus === "completed" && "完了"}
															{filterStatus === "draft" && "下書き"}
															{filterStatus === "in_progress" && "進行中"}
															{filterStatus === "inactive" && "停止中"}
															{filterStatus === "deleted" && "削除済み"}
														</span>
														のクエストは見つかりませんでした。
													</>
												)}
												{!searchTerm &&
													filterStatus === "all" &&
													"まだクエストが作成されていません。"}
											</p>
											<div className="text-sm text-slate-500">
												<p className="mb-2">以下の方法をお試しください：</p>
												<ul className="text-left max-w-md mx-auto space-y-1">
													<li>• 検索キーワードを変更する</li>
													<li>• フィルター条件を変更する</li>
													<li>• 新しいクエストを作成する</li>
												</ul>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* ユーザー管理 */}
				{activeTab === "users" && (
					<div className="space-y-6">
						<h2 className="text-3xl font-bold text-gray-300 mb-2">
							ユーザー管理
						</h2>

						<div className="grid gap-4">
							{users.map((user) => (
								<div
									key={user.id}
									data-testid={`user-card-${user.id}`}
									className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-6 border-2 border-amber-200"
								>
									<div className="flex items-center justify-between">
										<div>
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold text-slate-800">
													{user.name}
												</h3>
												<span
													className={`text-sm px-2 py-1 rounded ${
														user.role === "admin"
															? "bg-purple-100 text-purple-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{user.role === "admin" ? "管理者" : "一般ユーザー"}
												</span>
											</div>
											<div className="flex items-center gap-6 text-sm text-slate-800">
												<span>メール: {user.email}</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Star className="w-5 h-5 text-yellow-500" />

											{/* ロール選択ドロップダウン */}
											<select
												data-testid={`user-role-select-${user.id}`}
												value={user.role}
												onChange={(e) =>
													handleUserAction(
														user.id,
														"updateRole",
														e.target.value,
													)
												}
												className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="user">一般ユーザー</option>
												<option value="admin">管理者</option>
											</select>

											<button
												type="button"
												onClick={() => handleUserAction(user.id, "delete")}
												className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
											>
												<Trash2 className="w-4 h-4" />
												削除
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* クエスト詳細モーダル */}
			{selectedQuest && (
				<QuestDetail
					quest={selectedQuest}
					onClose={() => setSelectedQuest(null)}
				/>
			)}

			{/* クエスト作成フォームモーダル */}
			{isCreateQuestOpen && (
				<CreateQuestForm onClose={() => setIsCreateQuestOpen(false)} />
			)}

			{/* クエスト編集フォームモーダル */}
			{questToEdit && (
				<EditQuestForm
					quest={questToEdit}
					onClose={() => setQuestToEdit(null)}
				/>
			)}

			{/* 削除確認ダイアログ */}
			{questToDelete && (
				<DeleteConfirmDialog
					quest={questToDelete}
					onConfirm={handleDeleteConfirm}
					onCancel={() => setQuestToDelete(null)}
				/>
			)}

			{/* ユーザー削除確認ダイアログ */}
			{userToDelete && (
				<UserDeleteConfirmDialog
					user={userToDelete}
					onConfirm={handleUserDeleteConfirm}
					onCancel={() => setUserToDelete(null)}
				/>
			)}

			{/* トースト通知 */}
			{toastMessage && (
				<div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
					<div className="flex items-center gap-2">
						<Check className="w-5 h-5" />
						<span>{toastMessage}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
