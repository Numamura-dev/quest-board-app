import type React from "react";

type ButtonProps = {
	children: React.ReactNode;
	active?: boolean;
	onClick?: () => void;
	className?: string;
};

// 共通ボタン
const Button: React.FC<ButtonProps> = ({
	children,
	active = false,
	onClick,
	className = "",
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 ${
				active
					? "bg-gradient-to-b from-amber-400 to-amber-600 text-amber-900 border-amber-300 shadow-lg"
					: "bg-gradient-to-b from-stone-200 to-stone-300 text-stone-700 border-stone-400 hover:from-stone-300 hover:to-stone-400"
			} ${className}`}
		>
			{children}
		</button>
	);
};

export default Button;
