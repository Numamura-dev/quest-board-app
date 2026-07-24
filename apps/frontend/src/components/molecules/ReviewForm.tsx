"use client";
import Button from "@/components/atoms/Button";
import { Star } from "lucide-react";
import type React from "react";

interface ReviewFormProps {
	newReview: { score: number; comment: string };
	setNewReview: (review: { score: number; comment: string }) => void;
	onSubmit: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
	newReview,
	setNewReview,
	onSubmit,
}) => {
	return (
		<div className="bg-white p-4 rounded-lg border mb-6">
			<h3 className="font-semibold text-slate-800 mb-3">レビューを投稿</h3>
			<div className="flex items-center gap-2 mb-3">
				<span className="text-slate-700">評価:</span>
				<div className="flex gap-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							className={`w-5 h-5 cursor-pointer ${
								star <= newReview.score
									? "text-yellow-400 fill-current"
									: "text-gray-300"
							}`}
							onClick={() => setNewReview({ ...newReview, score: star })}
						/>
					))}
				</div>
				<span className="text-slate-600">({newReview.score})</span>
			</div>
			<textarea
				value={newReview.comment}
				onChange={(e) =>
					setNewReview({ ...newReview, comment: e.target.value })
				}
				placeholder="レビューコメントを入力してください..."
				className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none h-20 mb-3"
			/>
			<Button onClick={onSubmit}>投稿する</Button>
		</div>
	);
};

export default ReviewForm;
