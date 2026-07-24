import express from "express";
import { deleteReview, updateReview } from "../controllers/reviewController";

const router = express.Router();

router.put("/:reviewId", updateReview); // PUT /reviews/:reviewId
router.delete("/:reviewId", deleteReview); // DELETE /reviews/:reviewId

export default router;
