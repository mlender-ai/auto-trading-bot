import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import { getDemoRuntimeState } from "../demo/store.js";
import { PaperStatusService } from "../domain/status/paperStatusService.js";

const paperStatusService = new PaperStatusService();

export async function registerWorkerRoutes(app: FastifyInstance) {
  app.get("/worker/status", async (request) => {
    const query = z
      .object({
        botId: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      const runtime = getDemoRuntimeState();

      return {
        botId: "seed-paper-bot",
        mode: "paper" as const,
        status: runtime.system.botStatus,
        exchangeKey: "mock-binance-futures",
        workerIntervalMs: env.WORKER_INTERVAL_MS,
        workerStatus: runtime.system.workerStatus,
        marketDataStatus: runtime.system.marketDataStatus,
        currentAction: runtime.system.currentAction,
        activeStrategyIds: runtime.execution.activeStrategyIds,
        runningStrategyIds: runtime.execution.runningStrategyIds,
        watchedSymbols: [],
        lastHeartbeatAt: runtime.system.lastHeartbeatAt,
        lastWorkerTickAt: runtime.system.lastHeartbeatAt,
        lastMarketUpdateAt: runtime.system.lastMarketUpdateAt,
        lastStrategyEvaluationAt: runtime.system.lastHeartbeatAt,
        lastTradeExecutionAt: null,
        lastTradeSymbol: null,
        lastErrorAt: runtime.system.lastErrorAt,
        lastTelegramSentAt: null,
        lastTelegramStatus: null,
        lastTelegramEventType: null,
        lastTelegramError: null
      };
    }

    return paperStatusService.buildWorkerStatus(query.botId);
  });
}
