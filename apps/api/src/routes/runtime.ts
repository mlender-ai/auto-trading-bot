import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import {
  getDemoRuntimeState,
  updateDemoExchangeSettings,
  updateDemoKillSwitch,
  updateDemoRiskSettings
} from "../demo/store.js";
import { RuntimeConfigService } from "../domain/runtime/runtimeConfigService.js";

const runtimeConfigService = new RuntimeConfigService();

export async function registerRuntimeRoutes(app: FastifyInstance) {
  app.get("/runtime/state", async (request) => {
    const query = z
      .object({
        botId: z.string().optional()
      })
      .parse(request.query);

    if (env.LOCAL_DEMO_MODE) {
      return getDemoRuntimeState();
    }

    return runtimeConfigService.build(query.botId);
  });

  app.patch("/exchange/settings", async (request) => {
    const body = z
      .object({
        botId: z.string().optional(),
        exchange: z.enum(["BINANCE", "BYBIT"]).optional(),
        mode: z.enum(["paper", "real"]).optional(),
        sandbox: z.boolean().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional()
      })
      .parse(request.body);

    const payload = {
      ...(body.exchange ? { exchange: body.exchange } : {}),
      ...(body.mode ? { mode: body.mode } : {}),
      ...(typeof body.sandbox === "boolean" ? { sandbox: body.sandbox } : {}),
      ...(body.apiKey ? { apiKey: body.apiKey } : {}),
      ...(body.apiSecret ? { apiSecret: body.apiSecret } : {})
    };

    if (env.LOCAL_DEMO_MODE) {
      return updateDemoExchangeSettings(payload);
    }

    return runtimeConfigService.updateExchange(body.botId, payload);
  });

  app.patch("/risk/settings", async (request) => {
    const body = z
      .object({
        botId: z.string().optional(),
        maxDailyLossUsd: z.number().optional(),
        maxDailyLossPct: z.number().optional(),
        maxConsecutiveLosses: z.number().optional(),
        cooldownMinutes: z.number().optional(),
        autoPauseEnabled: z.boolean().optional(),
        isTriggered: z.boolean().optional(),
        triggerReason: z.string().nullable().optional()
      })
      .parse(request.body);

    const payload = {
      ...(typeof body.maxDailyLossUsd === "number" ? { maxDailyLossUsd: body.maxDailyLossUsd } : {}),
      ...(typeof body.maxDailyLossPct === "number" ? { maxDailyLossPct: body.maxDailyLossPct } : {}),
      ...(typeof body.maxConsecutiveLosses === "number" ? { maxConsecutiveLosses: body.maxConsecutiveLosses } : {}),
      ...(typeof body.cooldownMinutes === "number" ? { cooldownMinutes: body.cooldownMinutes } : {}),
      ...(typeof body.autoPauseEnabled === "boolean" ? { autoPauseEnabled: body.autoPauseEnabled } : {}),
      ...(typeof body.isTriggered === "boolean" ? { isTriggered: body.isTriggered } : {}),
      ...(body.triggerReason !== undefined ? { triggerReason: body.triggerReason } : {})
    };

    if (env.LOCAL_DEMO_MODE) {
      return updateDemoRiskSettings(payload);
    }

    return runtimeConfigService.updateRisk(body.botId, payload);
  });

  app.patch("/control/kill-switch", async (request) => {
    const body = z
      .object({
        botId: z.string().optional(),
        enabled: z.boolean(),
        mode: z.enum(["PAUSE_ONLY", "CLOSE_POSITIONS"]),
        reason: z.string().nullable().optional()
      })
      .parse(request.body);

    const payload = {
      enabled: body.enabled,
      mode: body.mode,
      ...(body.reason !== undefined ? { reason: body.reason } : {})
    };

    if (env.LOCAL_DEMO_MODE) {
      return updateDemoKillSwitch(payload);
    }

    return runtimeConfigService.updateKillSwitch(body.botId, payload);
  });
}
