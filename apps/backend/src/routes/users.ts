import express from "express";
import {
  getUsers,
  createUser,
  getCurrentUser,
  deleteUser,
} from "../controllers/userController";
import { checkUserReviewExists } from "../controllers/reviewController";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, getUsers); // GET /users
router.post("/", authMiddleware, createUser); // POST /users
router.get("/me", authMiddleware, getCurrentUser); // GET /users/me
router.get("/:userId/reviews", checkUserReviewExists); // GET /users/:userId/reviews?questId=...
router.delete("/:id", authMiddleware, requireAdmin, deleteUser); // DELETE /users/:id (管理者用)

export default router;
