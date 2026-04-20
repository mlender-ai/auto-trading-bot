import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { resolveBot } from "./helpers.js";

export async function registerPositionRoutes(app: FastifyInstance) {
  app.get("/positions", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        status: z.enum(["OPEN", "CLOSED"]).optional()
      })
      .parse(request.query);

    const bot = await resolveBot(query.botId);
    const where = query.status
      ? {
          botId: bot.id,
          status: query.status
        }
      : {
          botId: bot.id
        };

    const positions = await prisma.position.findMany({
      where,
      orderBy: {
        openedAt: "desc"
      }
    });

    return positions.map((position) => ({
      ...position,
      openedAt: position.openedAt.toISOString(),
      closedAt: position.closedAt?.toISOString() ?? null
    }));
  });
}
