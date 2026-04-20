# Personal Trading Bot MVP

Paper trading only monorepo for a personal AI trading agent console. The current priority is safe validation, reproducible deploys, and rollback-friendly operations, not real trading.

## Stack

- Frontend: Next.js App Router in [`apps/web`](apps/web)
- Backend: Fastify + Node.js + TypeScript in [`apps/api`](apps/api)
- Shared contracts: [`packages/shared`](packages/shared)
- Database: PostgreSQL + Prisma in [`prisma`](prisma)
- Deploy target: Vercel for web, Railway for API + worker

## Monorepo Layout

- `apps/web`: operator console, login gate, Next API proxy routes
- `apps/api`: Fastify server, worker, notifier, strategy execution
- `packages/shared`: DTOs and runtime/report contracts shared by web and API
- `prisma`: schema, migrations, seed
- `docs`: deploy and rollback runbook

## Local Commands

Run these from the repo root:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run prisma:seed
npm run dev:api
npm run dev:worker
npm run dev:web
```

Main scripts:

- `npm run dev:web`
- `npm run clean:web`
- `npm run reset:web`
- `npm run dev:api`
- `npm run dev:worker`
- `npm run dev`
- `npm run paper:status`
- `npm run research:generate`
- `npm run telegram:test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run ci`
- `npm run prisma:migrate:deploy`

Notes:

- Web is pinned to `http://127.0.0.1:3100`.
- Web dev artifacts and production build artifacts are intentionally separated.
  - `next dev` uses `apps/web/.next-dev`
  - `next build` and `next start` use `apps/web/.next-build`
- If you ever see a local `Cannot find module './###.js'` chunk error in Next dev, run `npm run clean:web` and then restart `npm run dev:web`.
- To run the real paper trading loop, set `LOCAL_DEMO_MODE=false`.
- `lint` currently reuses TypeScript static checks. That keeps CI deterministic until ESLint is introduced on purpose.

## Git Workflow

Recommended branch strategy:

- `main`: production branch
- `feature/*`: regular work branches such as `feature/agent-console`
- `fix/*`: optional emergency patch branch when a hotfix should skip unrelated feature work

Recommended commit style:

- `feat(web): add agent console log stream`
- `fix(api): guard empty report payload`
- `docs(deploy): add railway rollback checklist`
- `chore(ci): split workspace build jobs`

Recommended PR flow:

1. Branch from `main`.
2. Keep commits small and scoped.
3. Open a PR early.
4. Wait for GitHub Actions to pass.
5. Validate the Vercel preview deployment.
6. Merge to `main` with squash merge.
7. Let production deploy from `main`.

PR template: [`.github/pull_request_template.md`](.github/pull_request_template.md)

## CI

GitHub Actions is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

The AI research pipeline is defined in [`.github/workflows/research-pipeline.yml`](.github/workflows/research-pipeline.yml).

CI currently checks:

- `npm ci`
- `npm run prisma:generate`
- `npm run lint`
- `npm run typecheck`
- `npm --workspace @trading/api run build`
- `npm --workspace @trading/web run build`

Research pipeline workflow currently:

- runs on `main` pushes, daily schedule, and manual dispatch
- executes `npm run research:generate`
- writes the latest pipeline JSON and Markdown to `generated/research/`
- publishes the agent thread to the GitHub Actions job summary
- uploads the JSON and Markdown as workflow artifacts

## Deploy Overview

- Vercel project: set Root Directory to `apps/web`
- Railway API service: keep repo root as the source directory, run workspace commands for `@trading/api`
- Railway worker service: same repo, separate service, different start command
- Merge to `main` only after preview and CI are green

Detailed setup, environment variables, deployment order, and rollback steps are documented in [`docs/deployment.md`](docs/deployment.md).
Paper trading runbook: [`docs/paper-trading-setup.md`](docs/paper-trading-setup.md)  
Telegram setup: [`docs/telegram-setup.md`](docs/telegram-setup.md)

## Environment Variables

Shared or common variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `API_PASSWORD`
- `DASHBOARD_PASSWORD`
- `BOT_PASSWORD`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`
- `CONFIG_ENCRYPTION_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_NOTIFICATIONS_ENABLED`
- `TELEGRAM_NOTIFY_SKIPPED`
- `WORKER_INTERVAL_MS`
- `LOCAL_DEMO_MODE`
- `REPORT_TIMEZONE`
- `DAILY_REPORT_HOUR`
- `WEEKLY_REPORT_HOUR`
- `WEEKLY_REPORT_DAY`
- `REPORT_PROVIDER`
- `MARKET_DATA_PROVIDER`
- `RESEARCH_PIPELINE_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`

Reference values are in [`.env.example`](.env.example).

## Operational Rule

Keep deploys rollback-friendly:

- merge to `main` only through PR
- keep schema changes additive where possible
- avoid mixing risky migration changes with large UI refactors in the same PR
- identify the previous healthy Vercel and Railway deployment before every production merge
