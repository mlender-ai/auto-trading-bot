---
name: build-error-resolver
description: 빌드 실패 시 자동 호출. Next.js/Expo/EAS 빌드 오류 진단 및 수정.
---

# Build Error Resolver Agent

빌드 실패 전담 진단 및 수정.

## 진단 순서

### Next.js (apps/web) 빌드 실패
1. TypeScript 오류: `npm run typecheck` 출력 확인
2. Import 경로 오류: 모노레포 패키지 참조 확인
3. 환경변수 누락: `.env.example` 대비 실제 `.env` 확인
4. Prisma 클라이언트: `npx prisma generate` 재실행

### Expo (apps/tarot-mobile) 빌드 실패
1. `npx expo doctor` 실행
2. Metro 번들러 캐시 클리어: `npx expo start --clear`
3. 네이티브 모듈 버전 충돌: `package.json` peer deps 확인
4. EAS Build: rn-specialist 추가 투입

## 수정 후

```bash
npm run lint && npm run typecheck && npm run build:web
```

통과 확인 후 commit + push.
