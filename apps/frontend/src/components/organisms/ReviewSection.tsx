"use client";

import type { NewReview, Review } from "@quest-board/types";
import { Edit, Send, Star, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ReviewForm from "../molecules/ReviewForm";

interface ReviewSectionProps {
	reviews: Review[];
	newReview: NewReview;
	setNewReview: (review: NewReview) => void;
	onSubmit: () => void;
	showReviewForm?: boolean;
	onEditReview?: (reviewId: number, data: NewReview) => void;
	onDeleteReview?: (reviewId: number) => void;
	currentUserId?: number | null;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
	reviews,
	newReview,
	setNewReview,
	onSubmit,
	showReviewForm = false,
	onEditReview,
	onDeleteReview,
	currentUserId,
}) => {
	const { user, isAuthenticated } = useAuth();
	const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
	const [editingReview, setEditingReview] = useState<NewReview>({
		score: 0,
		comment: "",
	});
	const averageScore =
		reviews.length > 0
			? Math.round(
					(reviews.reduce((sum, r) => sum + Number(r.score), 0) /
						reviews.length) *
						10,
				) / 10
			: 0;

	// 現在のユーザーがレビューの投稿者かどうかを判定
	const isCurrentUserReview = (review: Review): boolean => {
		if (!user || !isAuthenticated || !currentUserId) return false;

		// ユーザーIDで判定
		return review.reviewer_id === currentUserId;
	};

	// レビュー編集開始
	const handleStartEdit = (review: Review) => {
		setEditingReviewId(review.id);
		setEditingReview({ score: review.score, comment: review.comment });
	};

	// レビュー編集キャンセル
	const handleCancelEdit = () => {
		setEditingReviewId(null);
		setEditingReview({ score: 0, comment: "" });
	};

	// レビュー編集保存
	const handleSaveEdit = () => {
		if (editingReviewId && onEditReview) {
			onEditReview(editingReviewId, editingReview);
			setEditingReviewId(null);
			setEditingReview({ score: 0, comment: "" });
		}
	};

	// レビュー削除
	const handleDeleteReview = (reviewId: number) => {
		if (onDeleteReview && confirm("このレビューを削除しますか？")) {
			onDeleteReview(reviewId);
		}
	};

	return (
		<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border-2 border-green-200 p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-slate-800">レビュー</h2>
				<div className="flex items-center gap-2">
					<div className="flex items-center">
						{[...Array(5)].map((_, i) => (
							<Star
								// biome-ignore lint/suspicious/noArrayIndexKey: 星評価の固定配列でインデックスは安定
								key={i}
								className={`w-4 h-4 ${
									i < Math.round(averageScore)
										? "text-yellow-400 fill-current"
										: "text-gray-300"
								}`}
							/>
						))}
					</div>
					<span className="font-semibold text-slate-700">
						{averageScore.toFixed(1)} ({reviews.length}件)
					</span>
				</div>
			</div>

			{/* 投稿フォーム */}
			{showReviewForm && (
				<ReviewForm
					newReview={newReview}
					setNewReview={setNewReview}
					onSubmit={onSubmit}
				/>
			)}

			{/* レビュー一覧 */}
			<div className="max-h-96 overflow-y-auto space-y-4 pr-2">
				{reviews.map((review) => (
					<div key={review.id} className="bg-white p-4 rounded-lg border">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="flex">
									{editingReviewId === review.id
										? // 編集モードの星評価
											[...Array(5)].map((_, i) => (
												<Star
													// biome-ignore lint/suspicious/noArrayIndexKey: 星評価の固定配列
													key={i}
													className={`w-4 h-4 cursor-pointer ${
														i < editingReview.score
															? "text-yellow-400 fill-current"
															: "text-gray-300"
													}`}
													onClick={() =>
														setEditingReview({ ...editingReview, score: i + 1 })
													}
												/>
											))
										: // 通常表示の星評価
											[...Array(5)].map((_, i) => (
												<Star
													// biome-ignore lint/suspicious/noArrayIndexKey: 星評価の固定配列
													key={i}
													className={`w-4 h-4 ${
														i < review.score
															? "text-yellow-400 fill-current"
															: "text-gray-300"
													}`}
												/>
											))}
								</div>
								<span className="text-slate-600 text-sm">{review.user}</span>
							</div>

							{/* 編集・削除ボタン（自分のレビューの場合のみ表示） */}
							{isCurrentUserReview(review) && (
								<div className="flex gap-2">
									{editingReviewId === review.id ? (
										<>
											<button
												type="button"
												onClick={handleSaveEdit}
												className="text-green-600 hover:text-green-800 text-sm"
											>
												保存
											</button>
											<button
												type="button"
												onClick={handleCancelEdit}
												className="text-gray-600 hover:text-gray-800 text-sm"
											>
												キャンセル
											</button>
										</>
									) : (
										<>
											<button
												type="button"
												onClick={() => handleStartEdit(review)}
												className="text-blue-600 hover:text-blue-800"
												title="編集"
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteReview(review.id)}
												className="text-red-600 hover:text-red-800"
												title="削除"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</>
									)}
								</div>
							)}
						</div>

						{editingReviewId === review.id ? (
							// 編集モードのコメント入力
							<textarea
								value={editingReview.comment}
								onChange={(e) =>
									setEditingReview({
										...editingReview,
										comment: e.target.value,
									})
								}
								className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none h-20 mb-2"
								placeholder="レビューコメントを入力してください..."
							/>
						) : (
							// 通常表示のコメント
							<p className="text-slate-700">{review.comment}</p>
						)}

						<span className="text-xs text-slate-400">{review.date}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default ReviewSection;
