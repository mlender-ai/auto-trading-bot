import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const scripts = ["dev:api", "dev:worker", "dev:web"] as const;

const children = scripts.map((script) =>
  spawn(npmCommand, ["run", script], {
    stdio: "inherit",
    env: process.env
  })
);

function shutdown() {
  for (const child of children) {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
}
