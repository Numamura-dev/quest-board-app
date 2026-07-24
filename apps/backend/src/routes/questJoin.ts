// routes/quests.ts
import { Router } from "express";
import { joinQuest } from "../controllers/questJoinController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// クエスト参加
router.post("/:questId/participants", authMiddleware, joinQuest);

export default router;
