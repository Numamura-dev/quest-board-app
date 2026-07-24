"use client";

import React, { useState, useEffect } from "react";
import StatusRibbon from "../atoms/StatusRibbon";
import Tag from "../atoms/Tag";
import ReviewSection from "../organisms/ReviewSection";
import { Quest, QuestStatus, Review, NewReview } from "@quest-board/types";
import { questService } from "../../services/quest";
import { reviewService, ReviewResponse } from "../../services/review";
import { userService } from "../../services/user";
import { useAuth } from "../../hooks/useAuth";

interface QuestDetailPageProps {
  questId?: string;
  action?: string;
}

const QuestDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg">
      <div className="mb-5 h-6 w-24 rounded-full bg-amber-200" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-amber-300/70" />
        <div className="h-4 w-full rounded bg-amber-200/80" />
        <div className="h-4 w-5/6 rounded bg-amber-200/80" />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="h-7 w-24 rounded-full bg-amber-200" />
        <div className="h-7 w-16 rounded-full bg-amber-200" />
        <div className="h-7 w-20 rounded-full bg-amber-200" />
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 h-7 w-48 rounded bg-slate-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const QuestDetailPage: React.FC<QuestDetailPageProps> = ({
  questId,
  action,
}) => {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<NewReview>({
    score: 0,
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  // クエストデータとレビューデータを取得
  useEffect(() => {
    const fetchData = async () => {
      if (!questId) {
        setError("クエストIDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // クエストデータとレビューデータを並行取得
        const [questData, reviewsData] = await Promise.all([
          questService.getQuestById(questId),
          reviewService.getReviewsByQuestId(questId).catch(() => []), // レビュー取得失敗時は空配列
        ]);

        setQuest(questData);

        // APIから取得したレビューデータを変換
        const convertedReviews: Review[] = reviewsData.map(
          (review: ReviewResponse) => ({
            id: review.id,
            user: review.reviewer.name,
            score: review.rating,
            comment: review.comment || "",
            date: new Date(review.created_at).toLocaleDateString("ja-JP"),
            reviewer_id: review.reviewer_id,
          })
        );

        setReviews(convertedReviews);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questId]);

  // ユーザーIDを動的に取得
  useEffect(() => {
    const fetchUserId = async () => {
      if (!user || !isAuthenticated) {
        setCurrentUserId(null);
        return;
      }

      try {
        const userData = await userService.getCurrentUser();
        setCurrentUserId(userData.id);
      } catch (error) {
        console.error("ユーザーID取得エラー:", error);
        setCurrentUserId(null);
      }
    };

    fetchUserId();
  }, [user, isAuthenticated]);

  // アクションパラメータに基づいてレビュー投稿フォームを表示
  useEffect(() => {
    const checkAndShowReviewForm = async () => {
      if (
        action === "review" &&
        user &&
        isAuthenticated &&
        quest &&
        currentUserId
      ) {
        try {
          // 実際のAPIを呼び出してレビュー投稿状況を確認
          const response = await reviewService.checkUserReviewExists(
            currentUserId.toString(),
            quest.id.toString()
          );
          if (!response.exists) {
            setShowReviewForm(true);
          }
        } catch (error) {
          console.error("レビュー投稿状況確認エラー:", error);
          setShowReviewForm(true); // エラー時は表示
        }
      }
    };

    checkAndShowReviewForm();
  }, [action, user, isAuthenticated, quest, currentUserId]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "初級":
        return "bg-green-500";
      case "中級":
        return "bg-yellow-500";
      case "上級":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment || newReview.score === 0 || !questId) {
      return;
    }

    try {
      // 動的に取得したユーザーIDを使用
      if (!currentUserId) {
        alert("ユーザー情報の取得に失敗しました。もう一度お試しください。");
        return;
      }

      // APIにレビューを投稿
      const response = await reviewService.createReview(questId, {
        reviewer_id: currentUserId,
        rating: newReview.score,
        comment: newReview.comment,
      });

      // 成功時はローカル状態を更新
      const newReviewData: Review = {
        id: response.id,
        user: response.reviewer.name,
        score: response.rating,
        comment: response.comment || "",
        date: new Date(response.created_at).toLocaleDateString("ja-JP"),
        reviewer_id: response.reviewer_id,
      };

      setReviews([newReviewData, ...reviews]);
      setNewReview({ score: 0, comment: "" });
      setShowReviewForm(false);
    } catch (err) {
      console.error("レビュー投稿エラー:", err);

      // エラー時はアラートを表示
      if (
        err instanceof Error &&
        err.message.includes("既にレビューを投稿済み")
      ) {
        alert("このクエストには既にレビューを投稿済みです。");
        setShowReviewForm(false);
      } else {
        alert("レビューの投稿に失敗しました。もう一度お試しください。");
      }
    }
  };

  // レビュー編集ハンドラー
  const handleEditReview = async (reviewId: number, data: NewReview) => {
    try {
      const response = await reviewService.updateReview(reviewId.toString(), {
        rating: data.score,
        comment: data.comment,
      });

      // 成功時はローカル状態を更新
      const updatedReviewData: Review = {
        id: response.id,
        user: response.reviewer.name,
        score: response.rating,
        comment: response.comment || "",
        date: new Date(response.created_at).toLocaleDateString("ja-JP"),
        reviewer_id: response.reviewer_id,
      };

      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? updatedReviewData : review
        )
      );
    } catch (err) {
      console.error("レビュー編集エラー:", err);
      alert("レビューの編集に失敗しました。もう一度お試しください。");
    }
  };

  // レビュー削除ハンドラー
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewService.deleteReview(reviewId.toString());

      // 成功時はローカル状態から削除
      setReviews(reviews.filter((review) => review.id !== reviewId));

      // 削除後はレビュー投稿フォームを表示
      setShowReviewForm(true);
    } catch (err) {
      console.error("レビュー削除エラー:", err);
      alert("レビューの削除に失敗しました。もう一度お試しください。");
    }
  };

  // ローディング状態
  if (loading) {
    return <QuestDetailSkeleton />;
  }

  // エラー状態
  if (error || !quest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">×</span>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            {error || "クエストが見つかりません"}
          </h2>
          <p className="text-red-600">
            クエストの情報を取得できませんでした。URLを確認してください。
          </p>
        </div>
      </div>
    );
  }

  // 完了していないクエストの場合はエラー表示
  if (quest.status !== QuestStatus.Completed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">×</span>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            レビューできません
          </h2>
          <p className="text-red-600">
            このクエストはまだ完了していません。完了後にレビューを投稿できます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* クエスト情報 */}
      <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 border-2 border-amber-200 space-y-4">
        <StatusRibbon
          status={
            quest.status === QuestStatus.Completed
              ? "completed"
              : quest.status === QuestStatus.Active
              ? "participating"
              : "applied"
          }
        />
        {quest.difficulty && (
          <div
            className={`absolute top-4 left-4 w-3 h-3 rounded-full ${getDifficultyColor(
              quest.difficulty
            )}`}
          ></div>
        )}

        <h1 className="text-2xl font-bold text-slate-800">{quest.title}</h1>
        <p className="text-slate-600">{quest.description}</p>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue">{quest.type}</Tag>
          {quest.tags &&
            quest.tags.map((tag, index) => (
              <Tag key={index} color="purple">
                {tag}
              </Tag>
            ))}
        </div>
      </div>

      {/* レビュー */}
      <ReviewSection
        reviews={reviews}
        newReview={newReview}
        setNewReview={setNewReview}
        onSubmit={handleSubmitReview}
        showReviewForm={showReviewForm}
        onEditReview={handleEditReview}
        onDeleteReview={handleDeleteReview}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default QuestDetailPage;
