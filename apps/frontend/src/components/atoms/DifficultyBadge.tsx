import type React from "react";

interface DifficultyBadgeProps {
	difficulty: "初級" | "中級" | "上級";
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
	const getColor = (difficulty: string) => {
		switch (difficulty) {
			case "初級":
				return "bg-green-500";
			case "中級":
				return "bg-yellow-500";
			case "上級":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return <div className={`w-3 h-3 rounded-full ${getColor(difficulty)}`} />;
};

export default DifficultyBadge;
