import express from "express";
import {
	createQuest,
	deleteQuest,
	getAllQuests,
	getQuestById,
	reactivateQuest,
	restoreQuest,
	submitQuestForApproval,
	updateQuest,
	updateQuestStatus,
} from "../controllers/questController";
import { joinQuest } from "../controllers/questJoinController";
import {
	createReview,
	getReviewsByQuestId,
} from "../controllers/reviewController";
import {
	authMiddleware,
	optionalAuthMiddleware,
	requireAdmin,
} from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", optionalAuthMiddleware, getAllQuests); // GET /quests
router.get("/:id", getQuestById); // GET /quests/:id
router.post("/", authMiddleware, createQuest); // POST /quests
router.put("/:id", authMiddleware, requireAdmin, updateQuest); // PUT /quests/:id
router.patch("/:id/status", authMiddleware, requireAdmin, updateQuestStatus); // PATCH /quests/:id/status
router.post("/:id/submissions", authMiddleware, submitQuestForApproval); // POST /quests/:id/submissions
router.post("/:id/restorations", authMiddleware, requireAdmin, restoreQuest); // POST /quests/:id/restorations
router.post("/:id/activations", authMiddleware, requireAdmin, reactivateQuest); // POST /quests/:id/activations
router.delete("/:id", authMiddleware, requireAdmin, deleteQuest); // DELETE /quests/:id (論理削除)
router.get("/:questId/reviews", getReviewsByQuestId); // GET /quests/:questId/reviews
router.post("/:questId/reviews", authMiddleware, createReview); // POST /quests/:questId/reviews
router.post("/:questId/participants", authMiddleware, joinQuest); // POST /quests/:questId/participants

export default router;
