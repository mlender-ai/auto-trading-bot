# Agent Council Work Plan

- Item: 관심 섹터 우선순위로 뉴스 첫 화면을 재정렬합니다.
- Owner: PM
- Issue: https://github.com/mlender-ai/auto-trading-bot/issues/9
- Branch: codex/agent-council/pm-personalized-priority-queue
- Generated At: 2026-04-25T07:12:07.303Z
- Status: queued

## Detail
반도체, 에너지(오일) 기준으로 헤드라인, 파생 기사, 섹터 이슈의 노출 순서를 다시 짜서 사용자가 첫 화면에서 자기 관심사만 바로 읽게 만듭니다.

## Implementation Focus
개인화된 섹터 우선순위가 레이아웃과 CTA 순서에 직접 반영되게 만듭니다.

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