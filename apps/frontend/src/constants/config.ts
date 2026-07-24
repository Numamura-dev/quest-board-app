import { AlertCircle, Bell, CheckCircle, Clock, Crown } from "lucide-react";

/**
 * API設定
 */
// APIのベースURLを構築（環境変数に/apiが含まれていない場合は追加）
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
// 末尾の/apiを削除してから、再度/apiを追加することで重複を防ぐ
const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, "");
const apiBaseUrl = `${cleanBaseUrl}/api`;

export const API_CONFIG = {
	/** APIのベースURL */
	BASE_URL: apiBaseUrl,
} as const;

/**
 * 難易度別の色設定
 * 初級: 緑、中級: オレンジ、上級: 紫
 */
export const difficultyColors: Record<
	"初級" | "中級" | "上級",
	"green" | "orange" | "purple"
> = {
	初級: "green",
	中級: "orange",
	上級: "purple",
};

/**
 * クエストステータス設定
 * 参加中、達成済み、応募中の各状態のスタイル定義
 */
export const statusConfig = {
	/** 参加中のクエスト */
	participating: { bg: "bg-blue-600", text: "参加中", icon: Clock },
	/** 達成済みのクエスト */
	completed: { bg: "bg-green-600", text: "達成済み", icon: CheckCircle },
	/** 応募中のクエスト */
	applied: { bg: "bg-orange-600", text: "応募中", icon: AlertCircle },
} as const;

/**
 * 通知タイプ設定
 * 成功、報酬、情報の各通知タイプのスタイル定義
 */
export const notificationTypeConfig = {
	/** 成功通知 */
	success: {
		bg: "bg-green-50",
		border: "border-green-200",
		icon: CheckCircle,
		iconColor: "text-green-600",
	},
	/** 報酬通知 */
	reward: {
		bg: "bg-yellow-50",
		border: "border-yellow-200",
		icon: Crown,
		iconColor: "text-yellow-600",
	},
	/** 情報通知 */
	info: {
		bg: "bg-blue-50",
		border: "border-blue-200",
		icon: Bell,
		iconColor: "text-blue-600",
	},
} as const;
