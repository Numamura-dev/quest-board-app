import type React from "react";

type StatusRibbonProps = {
	status: "participating" | "completed" | "applied"; // 参加中、達成済み、応募中
	className?: string;
};

// クエストの状態を表すリボンラベル
const StatusRibbon: React.FC<StatusRibbonProps> = ({
	status,
	className = "",
}) => {
	const getStatusColor = (status: string): string => {
		switch (status) {
			case "participating":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "applied":
				return "bg-orange-100 text-orange-800 border-orange-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusText = (status: string): string => {
		switch (status) {
			case "participating":
				return "募集中";
			case "completed":
				return "完了済み";
			case "applied":
				return "応募中";
			default:
				return "不明";
		}
	};

	return (
		<div className={`absolute top-0 right-0 ${className}`}>
			<div
				className={`px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg border-l border-b ${getStatusColor(
					status,
				)}`}
			>
				{getStatusText(status)}
			</div>
		</div>
	);
};

export default StatusRibbon;
