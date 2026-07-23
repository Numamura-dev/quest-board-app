/**
 * アプリケーションで扱うユーザーロール定数。
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

/**
 * 入力検証に利用する有効ロール一覧。
 */
export const VALID_ROLES = [ROLES.ADMIN, ROLES.USER] as const;

export type Role = (typeof VALID_ROLES)[number];
