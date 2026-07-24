import { getQuestRibbonStatus } from "@/constants/questPresentation";
import { type Quest as FullQuest, QuestDifficulty } from "@quest-board/types";
import { AlertCircle, CheckCircle, Clock, Sword } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import Button from "../atoms/Button";
import QuestCard from "../molecules/QuestCard";

// 表示用の簡易クエスト型（QuestCardが想定する形に合わせる）
type DisplayQuest = {
	id: number;
	title: string;
	reward: number;
	deadline?: string;
	progress?: number;
	difficulty: "初級" | "中級" | "上級";
	category: string;
	completedDate?: string;
	appliedDate?: string;
	status?: string;
};

type QuestData = {
	participating: FullQuest[];
	completed: FullQuest[];
	applied: FullQuest[];
};

type QuestHistoryProps = {
	questData: QuestData;
};

const getDisplayDifficulty = (
	difficulty?: FullQuest["difficulty"],
): DisplayQuest["difficulty"] => {
	switch (difficulty) {
		case QuestDifficulty.Intermediate:
			return "中級";
		case QuestDifficulty.Advanced:
			return "上級";
		default:
			return "初級";
	}
};

// タブ切り替え付きクエスト一覧
const QuestHistory: React.FC<QuestHistoryProps> = ({ questData }) => {
	const [activeTab, setActiveTab] = useState<keyof QuestData>("participating");

	const tabs = [
		{ key: "participating" as const, label: "募集中", icon: Clock },
		{ key: "completed" as const, label: "完了済み", icon: CheckCircle },
		{ key: "applied" as const, label: "応募中", icon: AlertCircle },
	];

	const currentQuests = useMemo(
		() => questData[activeTab] || [],
		[questData, activeTab],
	);

	return (
		<div className="bg-gradient-to-br from-stone-50 to-amber-50 p-6 rounded-xl border-4 border-stone-300 shadow-xl">
			<h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2 font-serif">
				<Sword className="w-6 h-6" />
				クエスト履歴
			</h3>

			<div className="flex flex-wrap gap-2 mb-6">
				{tabs.map(({ key, label, icon: Icon }) => (
					<Button
						key={key}
						active={activeTab === key}
						onClick={() => setActiveTab(key)}
						className="flex items-center gap-2"
					>
						<Icon className="w-4 h-4" />
						{label}
					</Button>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{currentQuests.length > 0 ? (
					currentQuests.map((quest) => {
						const display: DisplayQuest = {
							id: quest.id,
							title: quest.title,
							reward: Number(quest.rewards?.incentive_amount ?? 0),
							deadline: quest.end_date,
							difficulty: getDisplayDifficulty(quest.difficulty),
							category: String(quest.type || ""),
							status: String(quest.status || ""),
						};

						return (
							<QuestCard
								key={display.id}
								quest={display}
								status={getQuestRibbonStatus(quest.status)}
							/>
						);
					})
				) : (
					<div className="col-span-full text-center text-stone-500 py-8">
						<Sword className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>該当するクエストがありません</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default QuestHistory;
