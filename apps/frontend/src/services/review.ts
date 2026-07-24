import { apiClient } from "./httpClient";

export interface ReviewResponse {
  id: number;
  reviewer_id: number;
  guest_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    id: number;
    name: string;
  };
}

export interface CreateReviewRequest {
  reviewer_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

/**
 * レビュー関連のAPIサービス
 */
export const reviewService = {
  /**
   * クエストIDでレビュー一覧を取得
   */
  getReviewsByQuestId: async (questId: string): Promise<ReviewResponse[]> => {
    return apiClient.get<ReviewResponse[]>(`/quests/${questId}/reviews`);
  },

  /**
   * レビューを作成
   */
  createReview: async (
    questId: string,
    data: CreateReviewRequest
  ): Promise<ReviewResponse> => {
    return apiClient.post<ReviewResponse, CreateReviewRequest>(
      `/quests/${questId}/reviews`,
      data
    );
  },

  /**
   * レビューを更新
   */
  updateReview: async (
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<ReviewResponse> => {
    return apiClient.put<ReviewResponse, UpdateReviewRequest>(
      `/reviews/${reviewId}`,
      data
    );
  },

  /**
   * レビューを削除
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    return apiClient.delete<void>(`/reviews/${reviewId}`);
  },

  /**
   * ユーザーが特定のクエストにレビューを投稿済みかチェック
   */
  checkUserReviewExists: async (
    userId: string,
    questId: string
  ): Promise<{ exists: boolean }> => {
    return apiClient.get<{ exists: boolean }>(
      `/users/${userId}/reviews`,
      { questId }
    );
  },
};
