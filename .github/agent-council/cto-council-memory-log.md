# Agent Council Work Plan

- Item: 에이전트 회의 결과를 markdown memory로 누적합니다.
- Owner: CTO
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/7
- Branch: codex/agent-council/cto-council-memory-log
- Generated At: 2026-04-25T07:12:07.303Z
- Status: ready

## Detail
매 런마다 나온 아이디어와 해결된 아이디어를 markdown memory에 따로 남겨, 24시간 자동 루프에서도 이미 끝난 일과 새 아이디어를 구분합니다.

## Implementation Focus
회의 결과를 issue/PR와 분리된 장기 메모리 계층으로 남겨 다음 런의 입력으로 재사용합니다.

## Target Files
- packages/shared/src/research.ts
- packages/shared/src/researchPipeline.ts
- scripts/research-agent-issues.ts
- .github/agent-council/completed-items.md

## Verification
- npm run typecheck
- npm run research:generate
- npm run research:issues

## References
- meeting
- news-editor
- execution-trader

## Acceptance
- [ ] 작업 범위를 제품 변경으로 구체화한다.
- [ ] 구현 또는 측정 지표를 연결한다.
- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다.