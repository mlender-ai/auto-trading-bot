import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { resolveBot } from "./helpers.js";

export async function registerLogRoutes(app: FastifyInstance) {
  app.get("/logs", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        limit: z.coerce.number().min(1).max(200).default(50)
      })
      .parse(request.query);

    const bot = await resolveBot(query.botId);

    const logs = await prisma.systemLog.findMany({
      where: {
        botId: bot.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: query.limit
    });

    return logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString()
    }));
  });
}
