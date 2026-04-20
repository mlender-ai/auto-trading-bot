import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { buildApp } from "./app.js";

async function main() {
  const app = await buildApp();

  await app.listen({
    port: env.PORT,
    host: "0.0.0.0"
  });

  logger.info(`API listening on ${env.PORT}`);
}

main().catch((error) => {
  logger.error("API failed to start", {
    error: error instanceof Error ? error.message : "unknown"
  });
  process.exit(1);
});

