import "dotenv/config";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000";
const password = process.env.API_PASSWORD ?? process.env.DASHBOARD_PASSWORD ?? process.env.BOT_PASSWORD ?? "";

async function request(path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "content-type": "application/json",
      "x-dashboard-password": password
    }
  });

  if (!response.ok) {
    throw new Error(`${path} -> ${response.status}`);
  }

  return response.json();
}

async function main() {
  const [health, worker, paper, logs] = await Promise.all([
    request("/health"),
    request("/worker/status"),
    request("/paper/status"),
    request("/paper/logs?limit=5")
  ]);

  console.log(
    JSON.stringify(
      {
        health,
        worker,
        paper,
        latestEvents: logs
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
