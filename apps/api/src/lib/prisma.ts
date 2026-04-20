import { PrismaClient } from "@prisma/client";

declare global {
  var __tradingPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__tradingPrisma ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__tradingPrisma = prisma;
}

