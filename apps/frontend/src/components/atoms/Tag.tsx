import type React from "react";

interface TagProps {
	children: React.ReactNode;
	color?: "blue" | "green" | "orange" | "purple";
}

// クエストのタグ
const Tag: React.FC<TagProps> = ({ children, color = "blue" }) => {
	const colors = {
		blue: "bg-blue-100 text-blue-800 border-blue-200",
		green: "bg-green-100 text-green-800 border-green-200",
		orange: "bg-orange-100 text-orange-800 border-orange-200",
		purple: "bg-purple-100 text-purple-800 border-purple-200",
	};

	return (
		<span
			className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[color]}`}
		>
			{children}
		</span>
	);
};

export default Tag;
