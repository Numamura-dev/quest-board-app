import express from "express";
import {
  getActiveTags,
  getUnusedTags,
  cleanupUnusedTags,
} from "../controllers/tagController";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getActiveTags); // GET /api/tags (アクティブタグ一覧)
router.get("/unused", authMiddleware, requireAdmin, getUnusedTags); // GET /api/tags/unused (管理者用)
router.delete("/unused", authMiddleware, requireAdmin, cleanupUnusedTags); // DELETE /api/tags/unused (管理者用クリーンアップ)

export default router;
