import type React from "react";
import UserName from "../atoms/UserName";

type User = {
	id?: number;
	name: string;
	email: string;
	role?: string;
	avatar?: string;
};

type UserInfoProps = {
	user: User;
};

// ユーザー名、メールアドレスを表示するコンポーネント
const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
	return (
		<div className="space-y-2">
			<UserName name={user.name} />
			<div className="text-amber-700 text-sm">
				<span className="font-medium">メール:</span> {user.email}
			</div>
		</div>
	);
};

export default UserInfo;
