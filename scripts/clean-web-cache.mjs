import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const targets = [
  "apps/web/.next",
  "apps/web/.next-dev",
  "apps/web/.next-build",
  "apps/web/tsconfig.tsbuildinfo"
];

for (const relativeTarget of targets) {
  const absoluteTarget = path.join(repoRoot, relativeTarget);

  if (!existsSync(absoluteTarget)) {
    continue;
  }

  rmSync(absoluteTarget, {
    recursive: true,
    force: true
  });

  console.log(`removed ${relativeTarget}`);
}
