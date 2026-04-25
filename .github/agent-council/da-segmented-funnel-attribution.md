# Agent Council Work Plan

- Item: 전환 퍼널을 섹터·티커·시간대별로 분해합니다.
- Owner: DA
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/13
- Branch: codex/agent-council/da-segmented-funnel-attribution
- Generated At: 2026-04-25T07:24:31.871Z
- Status: queued

## Detail
관심 티커를 눌러 조건부 행동 제안을 확인하는 행동이 가장 강한 의도 신호입니다. 이후 시황 해석이 행동 제안으로 연결되지 않으면 티커 분석 전에 이탈하는 경향이 있습니다. 구간을 섹터, 티커, 시간대별로 나눠 어떤 컨텍스트에서 이탈이 심한지 확인합니다.

## Implementation Focus
단순 총합 이벤트 수집을 넘어서, 어떤 사용자 관심사와 어떤 시장 국면에서 전환이 끊기는지 비교 가능한 구조로 만듭니다.

## Target Files
- packages/shared/src/researchBehaviorStore.ts
- apps/web/app/api/research/behavior/route.ts
- apps/web/components/research/ResearchWorkspace.tsx

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