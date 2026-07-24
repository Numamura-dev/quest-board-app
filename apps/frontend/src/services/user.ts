import { apiClient, authenticatedApiClient } from "./httpClient";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface FindUserRequest {
  [key: string]: string | undefined;
  name?: string;
  email?: string;
}

export const userService = {
  /**
   * 名前またはメールアドレスでユーザーを検索
   */
  findUserByNameOrEmail: async (
    data: FindUserRequest
  ): Promise<UserResponse | null> => {
    const users = await authenticatedApiClient.get<UserResponse[]>("/users", data);
    return users[0] ?? null;
  },

  /**
   * 名前またはメールアドレスでユーザーIDを取得
   */
  getUserIdByNameOrEmail: async (
    data: FindUserRequest
  ): Promise<{ userId: number } | null> => {
    const user = await userService.findUserByNameOrEmail(data);
    return user ? { userId: user.id } : null;
  },

  /**
   * 現在のユーザー情報を取得（認証済み）
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    return authenticatedApiClient.get<UserResponse>("/users/me");
  },

  /**
   * 全ユーザーを取得（管理者用）
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    return authenticatedApiClient.get<UserResponse[]>("/users");
  },

  /**
   * ユーザーのロールを更新（管理者用）
   */
  updateUserRole: async (
    userId: number,
    role: string
  ): Promise<{ message: string; user: UserResponse }> => {
    return authenticatedApiClient.put<
      { message: string; user: UserResponse },
      { role: string }
    >(`/admin/users/${userId}/role`, { role });
  },

  /**
   * ユーザーを削除（管理者用）
   */
  deleteUser: async (
    id: number
  ): Promise<{ message: string; user: UserResponse }> => {
    return authenticatedApiClient.delete<{ message: string; user: UserResponse }>(
      `/users/${id}`
    );
  },
};
