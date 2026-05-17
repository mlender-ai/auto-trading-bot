# gstack 커맨드 가이드

> gstack v1.39.2 · 설치 위치: `~/.claude/skills/gstack/`  
> Claude Code 슬래시 커맨드로 실행. 타로 증권 앱 개발 워크플로우에 맞게 정리한 실전 가이드.

---

## 목차

- [설치 확인](#설치-확인)
- [워크플로우 한눈에 보기](#워크플로우-한눈에-보기)
- [핵심 커맨드](#핵심-커맨드)
  - [/plan-eng-review](#plan-eng-review)
  - [/plan-ceo-review](#plan-ceo-review)
  - [/plan-design-review](#plan-design-review)
  - [/review](#review)
  - [/qa](#qa)
  - [/ship](#ship)
  - [/retro](#retro)
  - [/careful](#careful)
  - [/freeze](#freeze)
  - [/browse](#browse)
- [보조 커맨드](#보조-커맨드)
- [타로 증권 앱 적용 예시](#타로-증권-앱-적용-예시)
- [규칙 요약](#규칙-요약)

---

## 설치 확인

```bash
ls ~/.claude/skills/gstack/
cat ~/.claude/skills/gstack/VERSION
```

정상 설치 시 `1.39.x` 버전이 출력됩니다.

---

## 워크플로우 한눈에 보기

```
새 기능 시작
     │
     ▼
/plan-eng-review   ← 아키텍처/설계 확정
     │
     ▼  (위험한 변경이면)
/careful           ← 안전 모드 선행
     │
     ▼
  구현
     │
     ▼
/review            ← 코드 품질/버그 점검
     │
     ▼
/qa                ← 실제 앱에서 QA
     │
     ▼
/ship              ← PR 생성 + 릴리즈
     │
     ▼
/retro             ← 회고 + 메모리 업데이트
```

---

## 핵심 커맨드

### /plan-eng-review

**엔지니어링 설계 리뷰.** 기능 구현 전 아키텍처, 데이터 흐름, 엣지 케이스, 테스트 커버리지, 성능을 점검합니다. 인터랙티브로 진행되며 의견 있는 권고안을 제시합니다.

```
/plan-eng-review
```

**언제 쓰나:**
- 새 API 라우트 추가 전
- Prisma 스키마 변경 전
- 새 모바일 화면 설계 전

**타로 앱 예시:**
```
/plan-eng-review
> 카드 뽑기 결과를 SNS 공유하는 기능을 추가하려 합니다.
> 현재 draw API는 /api/tarot/draw에 있고, 결과 이미지 생성이 필요합니다.
```

---

### /plan-ceo-review

**제품 방향성 리뷰.** CEO/파운더 시각으로 문제를 재정의합니다. 4가지 모드로 운영됩니다:

| 모드 | 설명 |
|---|---|
| SCOPE EXPANSION | 크게 생각, 가능성 탐색 |
| SELECTIVE EXPANSION | 현재 스코프 유지 + 선택적 확장 |
| HOLD SCOPE | 최대 엄밀성, 스코프 고정 |
| SCOPE REDUCTION | 본질만 남기기 |

```
/plan-ceo-review
```

**언제 쓰나:**
- 피처 우선순위가 불분명할 때
- 사용자 경험 방향성을 재검토할 때
- 수익 모델 변경 검토 시

---

### /plan-design-review

**디자인 리뷰.** 각 디자인 차원을 0-10점으로 평가하고 10점이 되려면 무엇이 필요한지 설명한 뒤 플랜을 수정합니다.

```
/plan-design-review
```

**언제 쓰나:**
- 신규 화면 UI 설계 전
- 카드 뽑기 애니메이션 계획 검토 시
- 온보딩 플로우 디자인 확정 전

> 라이브 사이트 시각 감사는 `/design-review` 사용

---

### /review

**PR 코드 리뷰.** base 브랜치 대비 diff를 분석해 SQL 안전성, LLM 트러스트 경계 위반, 조건부 사이드 이펙트, 구조적 이슈를 잡아냅니다.

```
/review
```

**언제 쓰나:**
- 구현 완료 후, PR 올리기 직전
- 크레딧 차감/지급 로직 변경 후
- 인증 미들웨어 수정 후

**타로 앱에서 특히 중요한 체크포인트:**
- `deductCredit()` 트랜잭션 안전성
- RevenueCat 영수증 검증 로직
- JWT 서명 검증 우회 가능성

---

### /qa

**QA 자동화.** 앱을 실제로 테스트하고 발견된 버그를 소스에서 수정, 각 수정을 커밋하고 재검증합니다.

```
/qa
```

**언제 쓰나:**
- "기능 완성됐다"고 판단한 직후
- 새 화면 추가 후 전체 플로우 점검
- 배포 전 회귀 테스트

---

### /ship

**배포 워크플로우.** base 브랜치 머지 → 테스트 → diff 리뷰 → VERSION 업 → CHANGELOG 업데이트 → 커밋 → 푸시 → PR 생성까지 자동화합니다.

```
/ship
```

**언제 쓰나:**
- PR을 올릴 때는 직접 push하지 말고 반드시 이 커맨드 사용
- 릴리즈 브랜치 정리 시

---

### /retro

**엔지니어링 회고.** 커밋 히스토리, 작업 패턴, 코드 품질 지표를 분석해 주간 리포트를 생성합니다. MEMORY.md도 함께 업데이트합니다.

```
/retro
```

**언제 쓰나:**
- 스프린트/작업 세션 종료 시
- 주간 회고 시
- 메모리 업데이트가 필요할 때

---

### /careful

**안전 모드.** `rm -rf`, `DROP TABLE`, force-push, `git reset --hard`, `kubectl delete` 등 파괴적 명령 전에 경고를 표시합니다. 각 경고를 사용자가 개별 승인할 수 있습니다.

```
/careful
```

**타로 앱에서 반드시 선행하는 상황:**
- Prisma 스키마 변경 (`prisma migrate` 포함)
- 크레딧 원장 테이블 구조 변경
- Apple/Google 소셜 인증 로직 수정
- RevenueCat IAP 검증 로직 수정
- 프로덕션 DB 직접 접근

---

### /freeze

**편집 범위 잠금.** 지정한 디렉토리 밖의 파일 수정을 차단합니다. 디버깅 시 의도치 않은 코드 변경을 방지합니다.

```
/freeze apps/web/app/api/tarot/draw/
```

**언제 쓰나:**
- 특정 모듈만 집중해서 디버깅할 때
- 아키텍처 확정 후 해당 파일 보호 시

> 잠금 해제: `/unfreeze`

---

### /browse

**헤드리스 브라우저.** URL 탐색, 요소 상호작용, 스크린샷, 반응형 레이아웃 테스트, 폼 테스트를 약 100ms/커맨드 속도로 실행합니다.

```
/browse
```

**규칙: 모든 웹 브라우징은 이 커맨드로만 수행**

**타로 앱 활용 예:**
```
/browse
> localhost:3000/admin 어드민 대시보드 열어서 스크린샷 찍어줘
> /api/tarot/draw 응답을 실제 브라우저에서 확인해줘
```

---

## 보조 커맨드

| 커맨드 | 설명 | 언제 |
|---|---|---|
| `/autoplan` | CEO + 디자인 + 엔지니어링 + DX 리뷰를 순차 자동 실행 | 큰 기능 시작 전 종합 리뷰 |
| `/investigate` | 4단계 디버깅 (조사→분석→가설→구현). 원인 없이 수정 금지. | 버그 재현이 안 될 때 |
| `/guard` | `/careful` + `/freeze` 동시 활성화. 최대 안전 모드. | 프로덕션 직접 작업 시 |
| `/health` | 타입체커, 린터, 테스트, 데드코드 감지를 종합해 0-10 점수 산출 | 주기적 코드 품질 점검 |
| `/design-review` | 실제 사이트의 시각적 불일치, 간격 문제, AI slop 패턴 수정 | 어드민/웹 UI 완성 후 |
| `/devex-review` | 실제 개발자 경험 감사 (문서 탐색, 시작 플로우, TTHW 측정) | 외부 기여자 온보딩 개선 시 |
| `/plan-devex-review` | DX 계획 리뷰, 개발자 페르소나 설계 | SDK/API 공개 전 |
| `/pair-agent` | 원격 AI 에이전트를 브라우저와 연결 | 멀티 에이전트 협업 시 |

---

## 타로 증권 앱 적용 예시

### 새 기능: 카드 공유 기능 추가

```
1. /plan-eng-review   → 공유 이미지 생성 API 설계 확정
2. /plan-design-review → 공유 카드 UI 디자인 리뷰
3. (구현)
4. /review            → PR 전 코드 검토
5. /qa                → 실제 공유 플로우 테스트
6. /ship              → PR 생성
7. /retro             → 회고
```

### Prisma 스키마 변경

```
1. /careful           → 안전 모드 선행
2. /plan-eng-review   → 마이그레이션 전략 확정
3. (스키마 변경 + migrate)
4. /review            → 변경 검토
5. /ship              → PR
```

### 버그 디버깅

```
1. /investigate       → 원인 파악 (수정 전 필수)
2. /freeze <해당 파일> → 범위 제한
3. (수정)
4. /review            → 검토
5. /ship              → PR
```

---

## 규칙 요약

| 상황 | 커맨드 |
|---|---|
| 새 기능 시작 전 | `/plan-eng-review` 필수 |
| 코드 완성 후 | `/review` 필수 |
| PR 올리기 전 | `/ship` (직접 push 금지) |
| 작업 종료 후 | `/retro` |
| Prisma·인증·결제 코드 변경 | `/careful` 선행 필수 |
| 웹 브라우징 | `/browse` 만 사용 |
| 버그 수정 시 | `/investigate` → 원인 확인 후 수정 |

---

> **gstack 업데이트:** `~/.claude/skills/gstack/gstack-upgrade` 실행  
> **버전 확인:** `cat ~/.claude/skills/gstack/VERSION`  
> **전체 커맨드 목록:** `ls ~/.claude/skills/gstack/`
