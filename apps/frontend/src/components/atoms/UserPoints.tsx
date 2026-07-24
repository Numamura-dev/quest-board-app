import { Coins } from "lucide-react";
import type React from "react";

type UserPointsProps = {
	points: number;
	className?: string;
};

// ポイント表示
const UserPoints: React.FC<UserPointsProps> = ({ points, className = "" }) => {
	return (
		<div
			className={`flex items-center space-x-1 text-amber-900 text-sm ${className}`}
		>
			<Coins className="w-4 h-4 text-amber-700 drop-shadow" />
			<span className="drop-shadow-sm">{points} ポイント</span>
		</div>
	);
};

export default UserPoints;
