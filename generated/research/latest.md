# Research Pipeline

- Generated At: 2026-04-20T13:50:05.262Z
- Provider: rule-based
- Model: openai/gpt-4.1
- Source: github-actions
- Status: fallback
- Sectors: 반도체, 에너지(오일)
- Tickers: AMD, NVDA, XOM

## Main Headline
- Stock Market Today: Dow Falls, Oil Prices Jump On Rising U.S.-Iran Tensions (Live Coverage)
- Why it matters: 실적과 가이던스 변화가 공급 체인 기대치를 바로 다시 가격에 반영할 수 있어 리더 종목 밸류에이션에 직접 연결됩니다.
- Action: AMD는 추격보다 실적 코멘트 확인 뒤 눌림 구간에서만 대응하고, 후행주는 확산 신호가 나올 때까지 보수적으로 봅니다.

## Agent Transcript
### 01 News Editor -> Macro Analyst
메인 헤드라인을 "Stock Market Today: Dow Falls, Oil Prices Jump On Rising U.S.-Iran Tensions (Live Coverage)"로 고정하고 파생 뉴스 3개를 연결했습니다. 이 출력은 시황 해석 에이전트의 입력으로 넘어갑니다.
References: live-semiconductors-stock-market-today-dow-falls-oil-prices-jump-on-rising-u-s-iran-tensions-live-co, live-semiconductors-this-stock-will-be-more-profitable-than-amazon-and-meta-by-2027, live-semiconductors-nvidia-stock-slaughters-rivals-amd-intel-as-the-as-blackwell-ultra-racks-lead-th, live-energy-oil-diversified-upstream-e-p-stocks-q4-recap-benchmarking-exxonmobil-nyse-xom

### 02 Macro Analyst -> Ticker Analyst
지금 시장은 반도체 리더십과 방어형 에너지로 자금이 압축되는 국면입니다. 이 해석은 티커 딥분석과 행동 제안 에이전트의 공통 컨텍스트가 됩니다.
References: live-semiconductors-stock-market-today-dow-falls-oil-prices-jump-on-rising-u-s-iran-tensions-live-co, live-semiconductors-this-stock-will-be-more-profitable-than-amazon-and-meta-by-2027, live-energy-oil-diversified-upstream-e-p-stocks-q4-recap-benchmarking-exxonmobil-nyse-xom

### 03 Ticker Analyst -> Execution Trader
AMD를 대표 분석 티커로 선택해 추세, 패턴, 섹터 연결을 해석했습니다. 이 출력은 행동 제안 에이전트가 진입/관망/회피 조건을 만드는 기준이 됩니다.
References: AMD, live-semiconductors-stock-market-today-dow-falls-oil-prices-jump-on-rising-u-s-iran-tensions-live-co, live-semiconductors-this-stock-will-be-more-profitable-than-amazon-and-meta-by-2027, live-semiconductors-nvidia-stock-slaughters-rivals-amd-intel-as-the-as-blackwell-ultra-racks-lead-th

### 04 Execution Trader -> Operator
AMD 중심의 조정 매수만 허용하고, XOM로 방어 노출을 병행하는 전략이 우세합니다. 이 출력은 사용자에게 보이는 최종 실행 제안이자 제품 팀 리뷰의 평가 대상입니다.
References: AMD, live-semiconductors-this-stock-will-be-more-profitable-than-amazon-and-meta-by-2027, live-semiconductors-nvidia-stock-slaughters-rivals-amd-intel-as-the-as-blackwell-ultra-racks-lead-th, live-energy-oil-diversified-upstream-e-p-stocks-q4-recap-benchmarking-exxonmobil-nyse-xom

## Trader Plan
- Strategy: AMD 중심의 조정 매수만 허용하고, XOM로 방어 노출을 병행하는 전략이 우세합니다.
- Do: AMD는 추격 대신 조정 구간에서만 분할 진입합니다.
- Do: NVDA는 이벤트 전 기대가 과열되면 비중을 늘리지 않고, 가이던스 확인 뒤 확장합니다.
- Do: XOM 같은 방어형 에너지로 포지션 균형을 맞춥니다.
- Avoid: 서비스주나 후행 확산주를 뉴스 헤드라인만 보고 추격 매수하지 않습니다.
- Avoid: 행동 조건 없이 모든 관심 티커를 동시에 매수하는 분산 진입은 피합니다.
- Risk: 리드타임 둔화나 고객 믹스 악화 코멘트가 나오면 반도체 강세 논리가 빠르게 약해질 수 있습니다.
- Risk: 메이저 오일의 capex 보수화는 에너지 내 강세 확산을 막고 서비스주를 먼저 흔들 수 있습니다.

## Product Action Items
- 에이전트 출력 스키마를 API 계약으로 고정합니다.
  Owner: CTO
  Detail: 뉴스 선별, 시황 해석, 티커 분석, 행동 제안 에이전트의 출력 스키마를 JSON 계약으로 고정해 프론트와 GitHub 자동화를 같은 데이터 기준으로 맞춥니다.
  Issue: https://github.com/mlender-ai/auto-trading-bot/issues/1
  Branch: codex/agent-council/schema-contract
  PR: https://github.com/mlender-ai/auto-trading-bot/pull/4

- 메인 헤드라인 아래에 오늘 전략과 금지 행동을 바로 노출합니다.
  Owner: PM
  Detail: 메인 헤드라인 아래에 오늘 전략과 하지 말아야 할 행동을 붙여 사용자가 뉴스만 읽고 멈추지 않고 곧바로 실행 판단으로 넘어가게 만듭니다.
  Issue: https://github.com/mlender-ai/auto-trading-bot/issues/2
  Branch: codex/agent-council/headline-to-action-flow
  PR: https://github.com/mlender-ai/auto-trading-bot/pull/5

- 핵심 전환 이벤트를 수집해 단계별 이탈을 추적합니다.
  Owner: DA
  Detail: headline_open, stage_continue, ticker_select, action_expand 이벤트를 수집해 시황 해석이 행동 제안으로 연결되지 않으면 티커 분석 전에 이탈하는 경향이 있습니다. 지점을 실제 데이터로 확인합니다.
  Issue: https://github.com/mlender-ai/auto-trading-bot/issues/3
  Branch: codex/agent-council/behavior-tracking
  PR: https://github.com/mlender-ai/auto-trading-bot/pull/6
