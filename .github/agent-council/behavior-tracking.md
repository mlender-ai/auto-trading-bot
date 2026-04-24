# Agent Council Work Plan

- Item: 핵심 전환 이벤트를 수집해 단계별 이탈을 추적합니다.
- Owner: DA
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/3
- Branch: codex/agent-council/behavior-tracking
- Generated At: 2026-04-24T13:43:02.571Z
- Status: ready

## Detail
headline_open, stage_continue, ticker_select, action_expand 이벤트를 수집해 시황 해석이 행동 제안으로 연결되지 않으면 티커 분석 전에 이탈하는 경향이 있습니다. 지점을 실제 데이터로 확인합니다.

## Implementation Focus
뉴스에서 행동 제안까지 이어지는 전환 구간을 계측해 이탈 원인을 숫자로 확인합니다.

## Target Files
- apps/web/components/research/ResearchWorkspace.tsx
- packages/shared/src/research.ts
- apps/web/app/api/research/pipeline/route.ts

## Verification
- npm run typecheck
- npm run build:web

## References
- macro-analyst
- ticker-analyst
- execution-trader

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.