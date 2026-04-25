# AI Research Operating System

Personal stock research product focused on one sharp job:

`help me understand what matters, what to do next, and which related names move with it in under 3 minutes.`

The product is no longer just a paper-trading console.
It now has three core user surfaces:

- `뉴스`: headline-first market brief
- `티커 분석`: deep technical and context-aware ticker analysis
- `에이전트 회의`: internal AI product/team loop that reviews the product and creates execution items

There are also two depth pages:

- `/ticker/[ticker]`: ticker deep dive with chart, catalysts, scenarios, and related opportunities
- `/sector/[sector]`: sector deep dive with routine, catalysts, and cross-market beneficiary set

## Product State

What is already working:

- personalized home briefing for favorite sectors and tickers
- live research data before fallback where possible
- ticker and sector search
- US/KR cross-market related opportunity mapping
- GitHub Actions research pipeline and newsletter generation
- design-system driven research UI with loading / error / not-found fallback screens

What is still partial:

- email newsletter delivery depends on sender secrets
- GitHub Models can still hit rate limits and fall back
- related opportunity graph is still rule-based, not full relationship intelligence
- portfolio-native workflow is not implemented yet

## Repository Map

- `apps/web`: Next.js App Router product UI and API routes
- `apps/api`: Fastify/worker runtime for the older console and paper-trading layer
- `packages/shared`: shared research contracts, pipeline structs, live data shaping
- `generated/research`: published research snapshot consumed by the app and GitHub Actions
- `docs`: deploy, roadmap, and handoff documents
- `DESIGN.md`: design system source of truth for future UI work

## Key Entry Points

Product pages:

- [`apps/web/app/page.tsx`](apps/web/app/page.tsx)
- [`apps/web/app/ticker/[ticker]/page.tsx`](apps/web/app/ticker/[ticker]/page.tsx)
- [`apps/web/app/sector/[sector]/page.tsx`](apps/web/app/sector/[sector]/page.tsx)

Main UI logic:

- [`apps/web/components/research/ResearchWorkspace.tsx`](apps/web/components/research/ResearchWorkspace.tsx)
- [`apps/web/app/globals.css`](apps/web/app/globals.css)
- [`apps/web/lib/researchPipelineStore.ts`](apps/web/lib/researchPipelineStore.ts)
- [`apps/web/lib/researchInsights.ts`](apps/web/lib/researchInsights.ts)

Shared contracts and live data:

- [`packages/shared/src/research.ts`](packages/shared/src/research.ts)
- [`packages/shared/src/researchLive.ts`](packages/shared/src/researchLive.ts)
- [`packages/shared/src/researchBehaviorStore.ts`](packages/shared/src/researchBehaviorStore.ts)

Automation and generated content:

- [`scripts/research-pipeline.ts`](scripts/research-pipeline.ts)
- [`scripts/research-agent-issues.ts`](scripts/research-agent-issues.ts)
- [`scripts/research-newsletter.ts`](scripts/research-newsletter.ts)
- [`.github/workflows/research-pipeline.yml`](.github/workflows/research-pipeline.yml)
- [`.github/workflows/daily-newsletter.yml`](.github/workflows/daily-newsletter.yml)

## Design System

The repo now includes a project-root [`DESIGN.md`](DESIGN.md) inspired by the `DESIGN.md` workflow popularized by [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).

The design direction blends:

- Linear: precise, quiet product hierarchy
- Revolut: fintech trust and crisp data presentation
- Tesla: subtraction and restraint

Important UI rule:

- never expose implementation words like `pipeline`, `provider`, `runtime`, `JSON`, or internal debug phrasing on user-facing primary surfaces

## Docs Index

- Product roadmap: [`docs/product-strategy-roadmap.md`](docs/product-strategy-roadmap.md)
- Research MVP deploy handoff: [`docs/research-mvp-deploy-handoff.md`](docs/research-mvp-deploy-handoff.md)
- Agent/dev handoff: [`docs/agent-handoff.md`](docs/agent-handoff.md)
- Deployment runbook: [`docs/deployment.md`](docs/deployment.md)
- Paper trading setup: [`docs/paper-trading-setup.md`](docs/paper-trading-setup.md)
- Telegram setup: [`docs/telegram-setup.md`](docs/telegram-setup.md)

## Local Commands

Run from the repo root:

```bash
npm install
npm run dev:web
npm run dev:api
npm run research:generate
npm run research:issues
npm run research:newsletter
npm run qa:screenshot -- --url http://127.0.0.1:3100/ --out /tmp/qa-home.png --width 1440 --height 1200 --budget 7000
```

Main scripts:

- `npm run dev:web`
- `npm run dev:api`
- `npm run dev`
- `npm run typecheck`
- `npm run build:web`
- `npm run research:generate`
- `npm run research:issues`
- `npm run research:newsletter`
- `npm run qa:screenshot`
- `npm run paper:status`

Notes:

- web is pinned to `http://127.0.0.1:3100`
- the homepage prefers stored or published snapshot data before rebuilding live data
- the meeting tab hydrates heavier transcript/review data lazily
- if Next dev chunks go weird, run `npm run clean:web`

## Live Data And Snapshot Flow

The product prefers live data first and degrades into a published snapshot when needed.

Primary live sources:

- Yahoo Finance RSS for news
- Yahoo Finance chart API for ticker candles
- source-page `og:image` / `twitter:image` extraction for article visuals

Snapshot flow:

1. pipeline generates `generated/research/latest.json` and `generated/research/latest.md`
2. GitHub Actions publishes the same snapshot back to `main`
3. web reads stored snapshot first, then published snapshot, then live build as fallback

This keeps:

- web UI
- newsletter generation
- GitHub Actions summaries

on the same research data contract.

## GitHub Models / AI Runtime

The research pipeline can run without an external OpenAI key when GitHub Actions has:

- `models: read`
- `GITHUB_TOKEN`

Supported runtime envs:

- `AI_API_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_TEMPERATURE`

Fallback behavior:

- if model calls fail or rate-limit, the pipeline can still produce a rule-based snapshot instead of leaving the UI empty

## Deployment Overview

Current recommended path:

1. Vercel for `apps/web`
2. GitHub Actions for research snapshot generation
3. Resend for newsletter delivery when secrets are ready
4. Railway only if the paper-trading/API stack needs to stay active

Detailed deploy info lives in [`docs/research-mvp-deploy-handoff.md`](docs/research-mvp-deploy-handoff.md) and [`docs/deployment.md`](docs/deployment.md).

## Environment Variables

Core research product envs:

- `DASHBOARD_PASSWORD`
- `RESEARCH_PUBLISHED_SNAPSHOT_URL`
- `AI_API_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_TEMPERATURE`
- `NEWSLETTER_TO`
- `NEWSLETTER_FROM`
- `RESEND_API_KEY`

Legacy / broader stack envs:

- `NEXT_PUBLIC_API_BASE_URL`
- `API_PASSWORD`
- `BOT_PASSWORD`
- `DATABASE_URL`
- `CONFIG_ENCRYPTION_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Reference values are in [`.env.example`](.env.example).

## Git Workflow

Recommended:

1. branch from `main`
2. keep research UI, data, and automation changes scoped
3. run `npm run typecheck` and `npm run build:web`
4. if UI changed, capture a screenshot with `npm run qa:screenshot`
5. open a PR or push to the intended branch

PR template:

- [`.github/pull_request_template.md`](.github/pull_request_template.md)

## Operational Guardrails

- keep deploys rollback-friendly
- avoid mixing risky migration work with large UI changes in the same PR
- prefer additive data contracts
- keep generated snapshot updates deterministic
- if the product cannot load, show recovery UI instead of exposing raw failure
