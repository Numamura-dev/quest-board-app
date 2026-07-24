"use client";
import Button from "@/components/atoms/Button";
import type React from "react";

interface SubmissionFormProps {
	submissionUrl: string;
	setSubmissionUrl: (url: string) => void;
	onSubmit: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
	submissionUrl,
	setSubmissionUrl,
	onSubmit,
}) => {
	return (
		<div className="mb-6 flex gap-2">
			<input
				type="url"
				value={submissionUrl}
				onChange={(e) => setSubmissionUrl(e.target.value)}
				placeholder="https://github.com/username/project"
				className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
			<Button onClick={onSubmit}>提出</Button>
		</div>
	);
};

export default SubmissionForm;
