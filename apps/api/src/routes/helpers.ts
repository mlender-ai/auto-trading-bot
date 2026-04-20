import { prisma } from "../lib/prisma.js";

export async function resolveBot(botId?: string) {
  if (botId) {
    return prisma.bot.findUniqueOrThrow({
      where: {
        id: botId
      }
    });
  }

  return prisma.bot.findFirstOrThrow({
    orderBy: {
      createdAt: "asc"
    }
  });
}
