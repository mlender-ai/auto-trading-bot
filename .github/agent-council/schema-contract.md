# Agent Council Work Plan

- Item: 에이전트 출력 스키마를 API 계약으로 고정합니다.
- Owner: CTO
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/1
- Branch: codex/agent-council/schema-contract
- Generated At: 2026-04-22T07:54:51.532Z
- Status: ready

## Detail
뉴스 선별, 시황 해석, 티커 분석, 행동 제안 에이전트의 출력 스키마를 JSON 계약으로 고정해 프론트와 GitHub 자동화를 같은 데이터 기준으로 맞춥니다.

## Implementation Focus
shared 타입과 API 응답이 같은 계약을 보도록 스키마 경계를 고정합니다.

## Target Files
- packages/shared/src/research.ts
- packages/shared/src/researchPipeline.ts
- apps/web/lib/researchPipelineStore.ts
- apps/web/app/api/research/pipeline/route.ts

## Verification
- npm run typecheck
- npm run build:web
- npm run research:generate

## References
- news-editor
- macro-analyst
- ticker-analyst
- execution-trader

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.