import type { FastifyInstance } from "fastify";

import { env } from "../config/env.js";
import { getDemoMarketOverview, updateDemoMarketOverview } from "../demo/store.js";
import { BinanceMarketOverviewService } from "../domain/exchange/binanceMarketOverviewService.js";

const marketOverviewService = new BinanceMarketOverviewService();

export async function registerMarketRoutes(app: FastifyInstance) {
  app.get("/market/overview", async () => {
    if (env.LOCAL_DEMO_MODE && env.MARKET_DATA_PROVIDER === "demo") {
      return getDemoMarketOverview();
    }

    const overview = await marketOverviewService.getOverview();

    if (env.LOCAL_DEMO_MODE) {
      updateDemoMarketOverview(overview);
    }

    return overview;
  });
}
