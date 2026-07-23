import { apiClient, authenticatedApiClient } from "./httpClient";
import type { Quest, QuestStatusValue, QuestTypeValue } from "@quest-board/types";

/**
 * クエスト関連のAPIサービス
 */
export const questService = {
  /**
   * IDでクエストを取得
   */
  getQuestById: async (id: string): Promise<Quest> => {
    return apiClient.get<Quest>(`/quests/${id}`);
  },

  /**
   * 全クエストを取得
   */
  getAllQuests: async (params?: {
    keyword?: string;
    status?: string;
  }): Promise<Quest[]> => {
    return apiClient.get<Quest[]>("/quests", params);
  },

  /**
   * 全クエストを取得（削除済みも含む）- 管理者用
   */
  getAllQuestsIncludingDeleted: async (params?: {
    keyword?: string;
    status?: string;
  }): Promise<Quest[]> => {
    return authenticatedApiClient.get<Quest[]>("/quests", {
      ...params,
      includeDeleted: true,
    });
  },

  /**
   * クエストのステータスを更新
   */
  updateQuestStatus: async (id: string, status: string): Promise<Quest> => {
    return authenticatedApiClient.patch<Quest, { status: string }>(
      `/quests/${id}/status`,
      {
        status,
      }
    );
  },

  /**
   * クエストを作成
   */
  createQuest: async (questData: {
    title: string;
    description: string;
    type: QuestTypeValue;
    status?: QuestStatusValue;
    maxParticipants: number;
    tags: string[];
    start_date: string;
    end_date: string;
    incentive_amount?: number;
    point_amount?: number;
    note?: string;
  }): Promise<Quest> => {
    return authenticatedApiClient.post<Quest, typeof questData>(
      "/quests",
      questData
    );
  },

  /**
   * クエストを編集
   */
  updateQuest: async (
    id: string,
    questData: {
      title: string;
      description: string;
      type: QuestTypeValue;
      status?: QuestStatusValue;
      maxParticipants: number;
      tags: string[];
      start_date: string;
      end_date: string;
      incentive_amount?: number;
      point_amount?: number;
      note?: string;
    }
  ): Promise<Quest> => {
    return authenticatedApiClient.put<Quest, typeof questData>(
      `/quests/${id}`,
      questData
    );
  },

  /**
   * クエストを削除
   */
  deleteQuest: async (id: string): Promise<{ message: string }> => {
    return authenticatedApiClient.delete<{ message: string }>(`/quests/${id}`);
  },

  /**
   * クエストを再公開（停止中からアクティブに変更）
   */
  reactivateQuest: async (
    id: string
  ): Promise<{ message: string; quest: Quest }> => {
    return authenticatedApiClient.post<{ message: string; quest: Quest }, {}>(
      `/quests/${id}/activations`,
      {}
    );
  },

  /**
   * クエストを承認待ちに申請する
   */
  submitQuestForApproval: async (
    id: string
  ): Promise<{ message: string; quest: Quest }> => {
    return authenticatedApiClient.post<{ message: string; quest: Quest }, {}>(
      `/quests/${id}/submissions`,
      {}
    );
  },

  /**
   * クエストを復元する（削除の取り消し）
   */
  restoreQuest: async (
    id: string
  ): Promise<{ message: string; quest: Quest }> => {
    return authenticatedApiClient.post<{ message: string; quest: Quest }, {}>(
      `/quests/${id}/restorations`,
      {}
    );
  },
};
