import express from "express";
import { deleteReview, updateReview } from "../controllers/reviewController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.put("/:reviewId", authMiddleware, updateReview); // PUT /reviews/:reviewId
router.delete("/:reviewId", authMiddleware, deleteReview); // DELETE /reviews/:reviewId

export default router;
