"use client";
import React from "react";
import { Gift, Users, Calendar } from "lucide-react";
import Tag from "@/components/atoms/Tag";

interface QuestInfoProps {
  title: string;
  description: string;
  tags: string[];
  rewards?: {
    point_amount: number;
    incentive_amount?: string | number;
  };
  participantsCount: number;
  maxParticipants: number;
  endDate: string;
  difficultyColor: string;
}

const QuestInfo: React.FC<QuestInfoProps> = ({
  title,
  description,
  tags,
  rewards,
  participantsCount,
  maxParticipants,
  endDate,
  difficultyColor,
}) => {
  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-600 leading-relaxed mb-4">{description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, idx) => (
          <Tag key={idx} color="blue">
            {tag}
          </Tag>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-slate-600">
        {rewards?.incentive_amount && (
          <div className="flex justify-between items-center">
            <span>金銭インセンティブ</span>
            <span className="text-xs text-slate-500">
              ¥{Number(rewards.incentive_amount).toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> 参加者数
          </span>
          <span className="font-semibold">
            {participantsCount} / {maxParticipants}人
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> 期限
          </span>
          <span className="font-semibold text-xs">{endDate}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestInfo;
