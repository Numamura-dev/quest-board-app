import express from "express";
import {
  updateReview,
  deleteReview,
} from "../controllers/reviewController";

const router = express.Router();

router.put("/:reviewId", updateReview); // PUT /reviews/:reviewId
router.delete("/:reviewId", deleteReview); // DELETE /reviews/:reviewId

export default router;
