# Agent Council Work Plan

- Item: 메인 헤드라인 아래에 오늘 전략과 금지 행동을 바로 노출합니다.
- Owner: PM
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/2
- Branch: codex/agent-council/headline-to-action-flow
- Generated At: 2026-04-24T23:04:12.822Z
- Status: ready

## Detail
메인 헤드라인 아래에 오늘 전략과 하지 말아야 할 행동을 붙여 사용자가 뉴스만 읽고 멈추지 않고 곧바로 실행 판단으로 넘어가게 만듭니다.

## Implementation Focus
뉴스 탭 첫 화면에서 행동 제안이 바로 읽히도록 콘텐츠 위계를 다시 묶습니다.

## Target Files
- apps/web/components/research/ResearchWorkspace.tsx
- apps/web/app/globals.css
- packages/shared/src/research.ts

## Verification
- npm run typecheck
- npm run build:web

## References
- news-editor
- execution-trader

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.