import { Request, Response } from "express";
import { mypageService } from "../services/mypageService";
import { getUserByFirebaseUidService } from "../services/userService";
import { asyncHandler } from "../utils/asyncHandler";
import { notFound, unauthorized } from "../utils/appError";

/**
 * 認証済み Firebase ユーザーからアプリケーション内ユーザー ID を解決する。
 * @param req - Express リクエスト
 * @returns アプリケーション内のユーザー ID
 */
const getCurrentAppUserId = async (req: Request) => {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) {
    throw unauthorized();
  }

  const user = await getUserByFirebaseUidService(firebaseUid);
  if (!user) {
    throw notFound("User not found");
  }

  return user.id;
};

/**
 * 認証ユーザーのマイページ用クエスト一覧を返す。
 */
export const getMyEntries = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getCurrentAppUserId(req);
  const entries = await mypageService.getUserEntries(userId);
  res.json(entries);
});

/**
 * 認証ユーザーのプロフィールを返す。
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getCurrentAppUserId(req);
  const profile = await mypageService.getUserProfile(userId);
  res.json(profile ?? {});
});

/**
 * 認証ユーザーの通知一覧を返す。
 */
export const getMyNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = await getCurrentAppUserId(req);
    const notifications = await mypageService.getUserNotifications(userId);
    res.json(Array.isArray(notifications) ? notifications : []);
  }
);

/**
 * 認証ユーザーの達成済みクエスト一覧のみを返す。
 */
export const getMyClearedQuests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = await getCurrentAppUserId(req);
    const entries = await mypageService.getUserEntries(userId);
    res.json(entries.completed || []);
  }
);
