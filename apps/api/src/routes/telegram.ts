import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { TelegramNotifier } from "../domain/notifier/telegramNotifier.js";

const notifier = new TelegramNotifier();

export async function registerTelegramRoutes(app: FastifyInstance) {
  app.post("/telegram/test", async (request) => {
    const body = z
      .object({
        botId: z.string().optional(),
        text: z.string().min(1).max(1000).optional()
      })
      .parse(request.body ?? {});

    const result = await notifier.sendTestMessage({
      ...(body.botId ? { botId: body.botId } : {}),
      ...(body.text ? { text: body.text } : {})
    });

    return {
      ok: result.status === "SENT",
      status: result.status,
      sentAt: result.sentAt,
      error: result.error
    };
  });
}
