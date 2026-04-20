import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import { getDemoDailyReport, getDemoSessionCompareReport, getDemoWeeklyReport } from "../demo/store.js";
import { ReportingService } from "../domain/reporting/reportingService.js";

export async function registerReportRoutes(app: FastifyInstance) {
  const reportingService = new ReportingService();

  app.get("/reports/daily", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        sessionId: z.string().optional(),
        date: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return getDemoDailyReport();
    }

    return reportingService.buildDailyReport(query.botId, query.sessionId, query.date);
  });

  app.get("/reports/weekly", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        sessionId: z.string().optional(),
        endDate: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return getDemoWeeklyReport();
    }

    return reportingService.buildWeeklyReport(query.botId, query.sessionId, query.endDate);
  });

  app.get("/reports/session-compare", async (request) => {
    const query = z
      .object({
        botId: z.string().optional(),
        sessionId: z.string().optional(),
        baselineSessionId: z.string().optional(),
        limit: z.coerce.number().min(2).max(10).default(4)
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return getDemoSessionCompareReport();
    }

    return reportingService.buildSessionCompareReport(query.botId, query.sessionId, query.baselineSessionId, query.limit);
  });
}
