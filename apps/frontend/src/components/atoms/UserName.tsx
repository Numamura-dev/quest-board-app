import type React from "react";

type UserNameProps = {
	name: string;
	className?: string;
};

// ユーザー名テキスト
const UserName: React.FC<UserNameProps> = ({ name, className = "" }) => {
	return (
		<p
			className={`text-xl font-bold text-amber-900 drop-shadow-md ${className}`}
		>
			{name}
		</p>
	);
};

export default UserName;
