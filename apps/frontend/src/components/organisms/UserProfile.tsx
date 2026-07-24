import type React from "react";
import UserInfo from "../molecules/UserInfo";

type User = {
	id?: number;
	name: string;
	email: string;
	role?: string;
	avatar?: string;
};

type UserProfileProps = {
	user: User;
};

// ユーザープロフィールエリア全体のコンテナ
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
	return (
		<div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-4 border-amber-300 shadow-xl">
			<UserInfo user={user} />
		</div>
	);
};

export default UserProfile;
