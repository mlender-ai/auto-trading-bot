import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import { getDemoDashboardSummary } from "../demo/store.js";
import { ReportingService } from "../domain/reporting/reportingService.js";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const reportingService = new ReportingService();

  app.get("/dashboard/summary", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        sessionId: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return getDemoDashboardSummary();
    }

    return reportingService.buildDashboardSummary(query.botId, query.sessionId);
  });
}
