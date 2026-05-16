import { PrismaClient } from "@prisma/client";

declare global {
  var __webPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__webPrisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__webPrisma = prisma;
}
