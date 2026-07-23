"use client";

import React from "react";
import { Eye, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import StatusRibbon from "@/components/atoms/StatusRibbon";
import type { Quest } from "@quest-board/types";

export type CompletedQuestButtonAction = {
  text: string;
  action: () => void;
  icon: LucideIcon;
  className: string;
};

type QuestListCardProps = {
  quest: Quest;
  difficultyColor: string;
  icon: React.ReactNode;
  formatCurrency: (amount?: string | number) => string;
  formatDate: (dateString: string) => string;
  onJoin: (quest: Quest) => void;
  completedButtonAction?: CompletedQuestButtonAction;
};

const QuestListCard: React.FC<QuestListCardProps> = ({
  quest,
  difficultyColor,
  icon,
  formatCurrency,
  formatDate,
  onJoin,
  completedButtonAction,
}) => {
  const participantCount = quest._count?.quest_participants ?? 0;
  const CompletedIcon = completedButtonAction?.icon;
  const progressPercent =
    quest.maxParticipants > 0
      ? Math.round((participantCount / quest.maxParticipants) * 100)
      : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-amber-200 relative overflow-hidden">
      <StatusRibbon
        status={
          quest.status === "active"
            ? "participating"
            : quest.status === "completed"
            ? "completed"
            : "applied"
        }
      />

      <div className="absolute top-4 left-4">
        <div className={`w-3 h-3 rounded-full ${difficultyColor}`}></div>
      </div>

      <div className="p-6 pt-8">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-yellow-400">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {quest.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-3">
              {quest.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(quest.tags ?? []).map((tag, index) => (
            <span
              key={`${quest.id}-${tag}-${index}`}
              className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>タイプ:</span>
            <span className="font-semibold capitalize">{quest.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>難易度:</span>
            <span className="font-semibold">{quest.difficulty || "未設定"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>報酬:</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(quest.rewards?.incentive_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>参加者:</span>
            <span className="font-semibold">
              {participantCount}/{quest.maxParticipants}名
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>期限:</span>
            <span className="font-semibold text-xs">
              {formatDate(quest.end_date)}
            </span>
          </div>
        </div>

        {quest.quest_participants && quest.quest_participants.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-slate-600 mb-2">参加メンバー:</div>
            <div className="flex flex-wrap gap-1">
              {quest.quest_participants.slice(0, 3).map((participant, index) => (
                <span
                  key={`${participant.user.id}-${index}`}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                >
                  {participant.user.name}
                </span>
              ))}
              {quest.quest_participants.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  +{quest.quest_participants.length - 3}名
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>参加状況</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-300 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {quest.status === "active" ? (
          <button
            onClick={() => onJoin(quest)}
            className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          >
            クエストに参加する
          </button>
        ) : quest.status === "completed" ? (
          completedButtonAction ? (
            <button
              onClick={completedButtonAction.action}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${completedButtonAction.className}`}
            >
              <div className="flex items-center justify-center gap-2">
                {CompletedIcon && <CompletedIcon className="w-4 h-4" />}
                {completedButtonAction.text}
              </div>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform shadow-md bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                読み込み中...
              </div>
            </button>
          )
        ) : (
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
              quest.status === "in_progress"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-not-allowed opacity-75"
            }`}
            disabled
          >
            {quest.status === "in_progress" ? (
              "クエスト進行中"
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                クエスト停止中
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestListCard;
