import express from "express";
import {
	getAllUsersForAdmin,
	updateUserRole,
} from "../controllers/adminUserController";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

// GET /api/admin/users
router.get("/", authMiddleware, requireAdmin, getAllUsersForAdmin);

// PUT /api/admin/users/:userId/role
router.put("/:userId/role", authMiddleware, requireAdmin, updateUserRole);

export default router;
