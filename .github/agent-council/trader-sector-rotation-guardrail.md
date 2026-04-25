# Agent Council Work Plan

- Item: 비관심 섹터로 신호가 번질 때 회피 규칙을 먼저 제시합니다.
- Owner: Trader
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/25
- Branch: codex/agent-council/trader-sector-rotation-guardrail
- Generated At: 2026-04-25T07:22:56.523Z
- Status: ready

## Detail
반도체, 에너지(오일) 중심 시황에서 자금이 다른 섹터로 번질 때, 어떤 경우엔 추격하지 말아야 하는지 회피 규칙을 먼저 노출합니다.

## Implementation Focus
관심 섹터 밖에서 생기는 유혹성 신호를 회피 규칙과 함께 관리합니다.

## Target Files
- packages/shared/src/research.ts
- apps/web/components/research/ResearchWorkspace.tsx

## Verification
- npm run typecheck
- npm run build:web

## References
- macro-analyst
- execution-trader

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.