import "./config/firebase"; // Firebase Admin SDK 初期化（副作用import）
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { httpLogger, logger } from "./config/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { openApiDocument } from "./openapi/document";
import adminUsersRouter from "./routes/adminUsers";
import mypageRouter from "./routes/mypage";
import questsRouter from "./routes/quests";
import reviewsRouter from "./routes/reviews";
import usersRouter from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3001;

const frontendBaseUrl =
	process.env.FRONTEND_BASE_URL || "http://localhost:3000";

app.use(httpLogger);

app.use(
	helmet({
		contentSecurityPolicy: false, // Next.js のインラインスクリプトと競合するため無効化
	}),
);

// CORS 設定
app.use(
	cors({
		origin: frontendBaseUrl,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		// カスタムヘッダーを追加する場合はここにも明示的に追記する。
		allowedHeaders: ["Content-Type", "Authorization"],
		maxAge: 86400,
	}),
);

app.use(express.json());

app.get("/api/openapi.json", (_req, res) => {
	res.json(openApiDocument);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// ルーティング
app.use("/api/quests", questsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/users", usersRouter);
app.use("/api/mypage", mypageRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
	logger.info(
		{ port: PORT },
		`サーバーを http://localhost:${PORT} で起動しました`,
	);
});
