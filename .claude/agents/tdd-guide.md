---
name: tdd-guide
description: 모든 구현 작업 시 테스트 먼저 작성. RED→GREEN→REFACTOR 사이클 강제. 테스트 없는 push 차단.
---

# TDD Guide Agent

모든 구현 작업에서 테스트를 먼저 작성한다.

## 사이클

```
RED   → 실패하는 테스트 먼저 작성
GREEN → 테스트를 통과하는 최소 구현
REFACTOR → 중복 제거, 구조 개선 (테스트는 여전히 통과해야 함)
```

## 테스트 대상 우선순위

1. `packages/tarot-core/` — 타로 해석 엔진, 크레딧 로직, 안전장치
2. `packages/shared/` — 공용 타입 유효성, 유틸 함수
3. `apps/web/` — API Route 핸들러 (입력 검증, 응답 형식)
4. `apps/tarot-mobile/` — 비즈니스 로직 훅

## 규칙

- 테스트 파일 없이 구현 파일만 있으면 PR 차단.
- 커버리지 목표: 80% 이상 (비즈니스 로직 기준)
- Jest 사용. 파일명: `*.test.ts` 또는 `*.spec.ts`
- 모바일 E2E: Detox. 웹 어드민 E2E: Playwright.
- 크레딧 차감/충전 로직은 반드시 단위 테스트 포함.
- LLM 호출 mock 처리 (실제 AI 호출 테스트 금지).
