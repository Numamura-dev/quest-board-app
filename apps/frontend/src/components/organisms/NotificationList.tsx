import { Bell } from "lucide-react";
import type React from "react";
import NotificationCard from "../molecules/NotificationCard";

type Notification = {
	id: number;
	message: string;
	type: "success" | "reward" | "info";
	timestamp: string;
};

type NotificationListProps = {
	notifications?: Notification[]; // undefined も許容
};

const NotificationList: React.FC<NotificationListProps> = ({
	notifications = [], // デフォルトで空配列を設定
}) => {
	return (
		<div className="bg-gradient-to-br from-blue-50 to-stone-100 p-6 rounded-xl border-4 border-blue-200 shadow-xl">
			<h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2 font-serif">
				<Bell className="w-6 h-6" />
				通知
			</h3>

			<div className="space-y-4">
				{notifications.length > 0 ? (
					notifications.map((notification) => (
						<NotificationCard
							key={notification.id}
							notification={notification}
						/>
					))
				) : (
					<p className="text-gray-500">通知はありません</p>
				)}
			</div>
		</div>
	);
};

export default NotificationList;
