import "./env"; // 環境変数ロード（単一エントリポイント）
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/**
 * Prisma Client の共有インスタンス。
 * 開発時はホットリロードによる多重生成を避けるため global 経由で再利用する。
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
