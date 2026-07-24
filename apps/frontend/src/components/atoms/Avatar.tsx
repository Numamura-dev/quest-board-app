import type React from "react";

type AvatarProps = {
	children: React.ReactNode;
	className?: string;
};

// ユーザーアイコン表示
const Avatar: React.FC<AvatarProps> = ({ children, className = "" }) => (
	<div
		className={`w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl border-4 border-amber-300 shadow-lg ${className}`}
	>
		{children}
	</div>
);

export default Avatar;
