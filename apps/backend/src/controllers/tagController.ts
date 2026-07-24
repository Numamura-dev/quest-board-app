import type { Request, Response } from "express";
import {
  getActiveTagsService,
  getUnusedTagsService,
  cleanupUnusedTagsService,
} from "../services/tagService";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * アクティブなクエストのタグ一覧を取得する
 * GET /api/tags
 */
export const getActiveTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const tags = await getActiveTagsService();
    res.json({ tags });
  }
);

/**
 * 未使用タグ一覧を取得する (管理者用)
 * GET /api/tags/unused
 */
export const getUnusedTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const tags = await getUnusedTagsService();
    res.json({ tags, count: tags.length });
  }
);

/**
 * 未使用タグをクリーンアップする (管理者用)
 * DELETE /api/tags/unused
 */
export const cleanupUnusedTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await cleanupUnusedTagsService();
    res.json({
      message: "未使用タグのクリーンアップが完了しました",
      ...result,
    });
  }
);
