# Agent Council Work Plan

- Item: 뉴스 탭, 티커 탭, 뉴스레터의 행동 제안 일관성을 검증합니다.
- Owner: QA
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/11
- Branch: codex/agent-council/qa-cross-surface-consistency
- Generated At: 2026-04-25T07:12:07.303Z
- Status: ready

## Detail
같은 뉴스 흐름에 대해 뉴스 탭, 티커 분석 탭, 뉴스레터가 서로 다른 행동 제안을 내지 않도록 회귀 검증 규칙을 추가합니다.

## Implementation Focus
표면별로 다른 문구를 쓰더라도 최종 행동 제안은 같은 방향을 유지하도록 테스트와 검증 규칙을 넣습니다.

## Target Files
- packages/shared/src/research.ts
- packages/shared/src/researchPipeline.ts
- scripts/research-newsletter.ts

## Verification
- npm run typecheck
- npm run build:web
- npm run research:newsletter

## References
- news-editor
- ticker-analyst
- execution-trader
- meeting

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.