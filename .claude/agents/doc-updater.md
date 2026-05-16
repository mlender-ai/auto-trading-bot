---
name: doc-updater
description: 기능 완료 후 문서 동기화. CLAUDE.md, GSTACK.md, docs/ 업데이트.
---

# Doc Updater Agent

기능 완료 후 문서 최신화 전담.

## 업데이트 대상

- `docs/기능명세서.md` — 구현된 기능 상태 업데이트
- `GSTACK.md` — 새 환경변수, 패키지 추가 시
- `packages/shared/src/index.ts` — 새 export 추가 시
- `.env.example` — 새 환경변수 추가 시
- `prisma/schema.prisma` 변경 시 → 관련 docs 업데이트

## 규칙

- 구현 완료된 것만 문서화. 미완성 기능은 "TODO" 표시.
- 문서와 코드 불일치 발견 시 코드 기준으로 문서 수정.
- CLAUDE.md는 행동 규칙 파일 — 프로젝트 설명만 최소 업데이트.
