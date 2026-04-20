import { env } from "./config/env.js";
import { AuditLogger } from "./domain/audit/auditLogger.js";
import { PaperBroker } from "./domain/broker/paperBroker.js";
import { BinancePublicMarketDataAdapter } from "./domain/exchange/adapters/binancePublicMarketDataAdapter.js";
import { MockMarketDataAdapter } from "./domain/exchange/adapters/mockMarketDataAdapter.js";
import { TradeExecutor } from "./domain/execution/tradeExecutor.js";
import { PaperEventService } from "./domain/events/paperEventService.js";
import { TelegramNotifier } from "./domain/notifier/telegramNotifier.js";
import { StrategyEvaluator } from "./domain/strategy/strategyEvaluator.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { StrategyWorker } from "./worker/strategyWorker.js";

const notifier = new TelegramNotifier();
const auditLogger = new AuditLogger();
const eventService = new PaperEventService(notifier);
const marketDataAdapter = env.MARKET_DATA_PROVIDER === "demo" ? new MockMarketDataAdapter() : new BinancePublicMarketDataAdapter();
const executor = new TradeExecutor(new PaperBroker(), eventService, auditLogger);
const worker = new StrategyWorker(marketDataAdapter, new StrategyEvaluator(), executor, notifier, auditLogger, eventService);

let isRunning = false;
let intervalHandle: NodeJS.Timeout | undefined;

async function tick() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    await worker.runCycle();
  } catch (error) {
    logger.error("Worker cycle failed", {
      error: error instanceof Error ? error.message : "unknown"
    });
  } finally {
    isRunning = false;
  }
}

async function main() {
  if (env.LOCAL_DEMO_MODE) {
    logger.info("Worker running in demo mode; no database-backed execution will start.");
    return;
  }

  await notifier.sendSystemAlert({
    type: "RESTART",
    title: "Worker restarted",
    message: `Paper trading worker started at ${new Date().toISOString()}`
  });

  await tick();
  intervalHandle = setInterval(() => void tick(), env.WORKER_INTERVAL_MS);
}

function shutdown() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  prisma
    .$disconnect()
    .catch(() => undefined)
    .finally(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((error) => {
  logger.error("Worker failed to boot", {
    error: error instanceof Error ? error.message : "unknown"
  });
  process.exit(1);
});
