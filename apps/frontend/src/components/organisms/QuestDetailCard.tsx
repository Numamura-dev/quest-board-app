"use client";
import React from "react";
import StatusRibbon from "@/components/atoms/StatusRibbon";
import Button from "@/components/atoms/Button";
import QuestInfo from "@/components/molecules/QuestInfo";
import type { Quest } from "@quest-board/types";

interface QuestDetailCardProps {
  status: "participating" | "completed" | "applied";
  difficultyColor: string;
  onParticipate: () => void;
  quest: Quest;
}

const QuestDetailCard: React.FC<QuestDetailCardProps> = ({
  status,
  difficultyColor,
  onParticipate,
  quest,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg hover:shadow-xl border-2 border-amber-200 transition-all duration-300 mb-8">
      <StatusRibbon status={status} />
      <div
        className={`absolute top-4 left-4 w-3 h-3 rounded-full ${difficultyColor}`}
      />
      <QuestInfo
        title={quest.title}
        description={quest.description}
        tags={quest.tags}
        rewards={quest.rewards}
        participantsCount={quest._count.quest_participants}
        maxParticipants={quest.maxParticipants}
        endDate={quest.end_date}
        difficultyColor={difficultyColor}
      />
      <div className="p-6">
        <Button onClick={onParticipate} active={status === "participating"}>
          {status === "participating"
            ? "参加する"
            : status === "applied"
            ? "応募済み"
            : "達成済み"}
        </Button>
      </div>
    </div>
  );
};

export default QuestDetailCard;
