import type React from "react";
import { notificationTypeConfig } from "../../constants/config";

interface Notification {
	id: number;
	message: string;
	type: "success" | "reward" | "info";
	timestamp: string;
}

interface NotificationCardProps {
	notification: Notification;
}

// 通知メッセージのカード
const NotificationCard: React.FC<NotificationCardProps> = ({
	notification,
}) => {
	const config = notificationTypeConfig[notification.type];
	const Icon = config.icon;

	return (
		<div
			className={`${config.bg} ${config.border} border-2 p-4 rounded-lg shadow-md`}
		>
			<div className="flex items-start gap-3">
				<Icon className={`w-5 h-5 ${config.iconColor} mt-1 flex-shrink-0`} />
				<div className="flex-1">
					<p className="text-stone-800 mb-1">{notification.message}</p>
					<p className="text-sm text-stone-500">{notification.timestamp}</p>
				</div>
			</div>
		</div>
	);
};

export default NotificationCard;
