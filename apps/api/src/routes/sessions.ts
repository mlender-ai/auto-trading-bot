import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import { demoDashboardSummary } from "../demo/dashboardSummary.js";
import { SessionService } from "../domain/session/sessionService.js";
import { resolveBot } from "./helpers.js";

export async function registerSessionRoutes(app: FastifyInstance) {
  const sessionService = new SessionService();

  app.get("/sessions", async (request) => {
    const query = z
      .object({
        botId: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return demoDashboardSummary.sessions;
    }

    const bot = await resolveBot(query.botId);

    return sessionService.listSessions(bot.id);
  });

  app.post("/sessions", async (request) => {
    const body = z
      .object({
        botId: z.string().optional(),
        name: z.string().min(1),
        runLabel: z.string().min(1),
        notes: z.string().optional(),
        activate: z.boolean().optional()
      })
      .parse(request.body ?? {});

    if (env.LOCAL_DEMO_MODE) {
      return {
        id: "demo-created-session",
        name: body.name,
        runLabel: body.runLabel,
        status: body.activate === false ? "ARCHIVED" : "ACTIVE"
      };
    }

    const bot = await resolveBot(body.botId);

    return sessionService.createSession({
      botId: bot.id,
      name: body.name,
      runLabel: body.runLabel,
      ...(body.notes ? { notes: body.notes } : {}),
      ...(body.activate !== undefined ? { activate: body.activate } : {})
    });
  });

  app.patch("/sessions/:id/activate", async (request) => {
    const params = z
      .object({
        id: z.string()
      })
      .parse(request.params);

    if (env.LOCAL_DEMO_MODE) {
      return {
        ok: true,
        id: params.id,
        status: "ACTIVE"
      };
    }

    return sessionService.activateSession(params.id);
  });
}
