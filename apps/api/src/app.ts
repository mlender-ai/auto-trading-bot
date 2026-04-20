import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { getDemoDashboardSummary } from "./demo/store.js";
import { prisma } from "./lib/prisma.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerLogRoutes } from "./routes/logs.js";
import { registerMarketRoutes } from "./routes/market.js";
import { registerPaperRoutes } from "./routes/paper.js";
import { registerPositionRoutes } from "./routes/positions.js";
import { registerReportRoutes } from "./routes/reports.js";
import { registerRuntimeRoutes } from "./routes/runtime.js";
import { registerSessionRoutes } from "./routes/sessions.js";
import { registerStrategyRoutes } from "./routes/strategies.js";
import { registerTelegramRoutes } from "./routes/telegram.js";
import { registerTradeRoutes } from "./routes/trades.js";
import { registerWorkerRoutes } from "./routes/worker.js";

export async function buildApp() {
  const app = Fastify();

  await app.register(cors, {
    origin: env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim())
  });

  await app.register(helmet);

  app.get("/health", async () => {
    if (env.LOCAL_DEMO_MODE) {
      const demoDashboardSummary = getDemoDashboardSummary();
      return {
        ok: true,
        mode: "demo",
        timestamp: new Date().toISOString(),
        botStatus: demoDashboardSummary.system.botStatus,
        lastHeartbeatAt: demoDashboardSummary.system.lastHeartbeatAt
      };
    }

    const bot = await prisma.bot.findFirst({
      orderBy: {
        createdAt: "asc"
      }
    });

    return {
      ok: true,
      timestamp: new Date().toISOString(),
      botStatus: bot?.status ?? "UNKNOWN",
      lastHeartbeatAt: bot?.heartbeatAt?.toISOString() ?? null
    };
  });

  app.addHook("onRequest", async (request, reply) => {
    if (request.raw.url?.startsWith("/health")) {
      return;
    }

    const password = request.headers["x-dashboard-password"];

    if (password !== env.BOT_PASSWORD) {
      return reply.code(401).send({
        message: "Unauthorized"
      });
    }
  });

  await registerDashboardRoutes(app);
  await registerTradeRoutes(app);
  await registerPositionRoutes(app);
  await registerStrategyRoutes(app);
  await registerLogRoutes(app);
  await registerReportRoutes(app);
  await registerSessionRoutes(app);
  await registerRuntimeRoutes(app);
  await registerMarketRoutes(app);
  await registerPaperRoutes(app);
  await registerWorkerRoutes(app);
  await registerTelegramRoutes(app);

  return app;
}
