import type React from "react";

interface QuestTitleProps {
	title: string;
	description?: string;
}

const QuestTitle: React.FC<QuestTitleProps> = ({ title, description }) => {
	return (
		<div className="mb-4">
			<h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
			{description && <p className="text-sm text-slate-600">{description}</p>}
		</div>
	);
};

export default QuestTitle;
