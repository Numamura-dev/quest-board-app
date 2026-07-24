import { Router } from "express";
import {
	getMyClearedQuests,
	getMyEntries,
	getMyNotifications,
	getMyProfile,
} from "../controllers/mypageController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/entries", authMiddleware, getMyEntries);
router.get("/user", authMiddleware, getMyProfile);
router.get("/notifications", authMiddleware, getMyNotifications);

export default router;
