import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://127.0.0.1:3100"),
  BOT_PASSWORD: z.string().min(1),
  CONFIG_ENCRYPTION_SECRET: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  TELEGRAM_NOTIFICATIONS_ENABLED: z.coerce.boolean().default(true),
  TELEGRAM_NOTIFY_SKIPPED: z.coerce.boolean().default(true),
  WORKER_INTERVAL_MS: z.coerce.number().default(30_000),
  LOCAL_DEMO_MODE: z.coerce.boolean().default(false),
  REPORT_TIMEZONE: z.string().default("Asia/Seoul"),
  DAILY_REPORT_HOUR: z.coerce.number().min(0).max(23).default(23),
  WEEKLY_REPORT_HOUR: z.coerce.number().min(0).max(23).default(23),
  WEEKLY_REPORT_DAY: z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]).default("SUN"),
  REPORT_PROVIDER: z.enum(["rule-based"]).default("rule-based"),
  MARKET_DATA_PROVIDER: z.enum(["demo", "binance"]).default("binance")
});

const parsedEnv = envSchema.parse(process.env);

if (!parsedEnv.LOCAL_DEMO_MODE && !parsedEnv.DATABASE_URL) {
  throw new Error("DATABASE_URL is required unless LOCAL_DEMO_MODE=true.");
}

export const env = parsedEnv;
