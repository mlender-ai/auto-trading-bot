import type { DrawnCard, MarketSnapshot } from "../types.js";

export const PROMPT_VERSION = "1.1.0";

function formatMarketContext(market: MarketSnapshot): string {
  const marketLabel = market.market === "KR" ? "한국" : "미국";
  const changeSign = market.changePercent > 0 ? "+" : "";
  const rsiNote = market.rsi !== undefined
    ? `\n- RSI: ${market.rsi.toFixed(1)}${market.rsi > 70 ? " (과매수 구간)" : market.rsi < 30 ? " (과매도 구간)" : ""}`
    : "";
  const sentimentNote = market.sentimentScore !== undefined
    ? `\n- 뉴스 감성: ${market.sentimentScore > 0 ? "긍정적" : market.sentimentScore < 0 ? "부정적" : "중립"} (${market.sentimentScore.toFixed(2)})`
    : "";

  return `- 종목: ${market.ticker} (${marketLabel} 시장)
- 현재가: ${market.price.toLocaleString()}원
- 등락: ${changeSign}${market.changePercent.toFixed(2)}%
- 시장 상황: ${conditionLabel(market.condition)}
- 시황 요약: ${market.summary}${rsiNote}${sentimentNote}`;
}

function conditionLabel(condition: MarketSnapshot["condition"]): string {
  switch (condition) {
    case "bullish":       return "강세 (상승 흐름)";
    case "bearish":       return "약세 (하락 흐름)";
    case "volatile":      return "변동성 확대";
    case "neutral":       return "중립 (방향 탐색)";
    case "consolidating": return "횡보 (에너지 응축)";
  }
}

function buildSingleCardPrompt(market: MarketSnapshot, card: DrawnCard): string {
  const orientation = card.orientation === "upright" ? "정방향" : "역방향";
  const meaning = card.orientation === "upright" ? card.card.meaningUpright : card.card.meaningReversed;

  return `당신은 동양의 신비로운 현자입니다. 타로 카드의 상징과 증권 시장의 에너지를 연결하여 통찰을 전합니다.
투자 조언이 아닌, 지금 이 순간의 기운과 흐름을 시적으로 읽어냅니다.

## 시장의 기운
${formatMarketContext(market)}

## 뽑힌 카드
- 카드: ${card.card.nameKo} (${card.card.name})
- 방향: ${orientation}
- 핵심 키워드: ${card.card.keywordsKo.join(", ")}
- 이 방향의 의미: ${meaning}
- 톤 가이드: ${card.card.toneGuide}

## 해석 방향
- 카드 한 장이 지금 이 순간의 핵심 에너지를 담고 있습니다
- 시장의 상황과 카드의 상징을 유기적으로 연결하세요
- 한 가지 핵심 통찰을 깊게 파고드는 것이 좋습니다
- 투자 권유, 매수/매도 신호, 수익 예측 표현은 절대 금지입니다

## 응답 형식 (JSON만, 코드블록 없이)
{
  "headline": "이 순간을 관통하는 한 마디 (15자 이내)",
  "summary": "카드와 시장이 전하는 메시지 2문장",
  "detail": "카드 상징과 시장 에너지의 깊은 연결고리 (150-300자)"
}`;
}

function buildThreeCardPrompt(market: MarketSnapshot, cards: DrawnCard[]): string {
  const cardDescriptions = cards.map((dc) => {
    const orientation = dc.orientation === "upright" ? "정방향" : "역방향";
    const meaning = dc.orientation === "upright" ? dc.card.meaningUpright : dc.card.meaningReversed;
    const slotLabel = dc.slot === "past" ? "과거 — 지나온 흐름"
      : dc.slot === "present" ? "현재 — 지금 이 자리"
      : "미래 — 다가올 기운";
    return `[${slotLabel}]
카드: ${dc.card.nameKo} (${dc.card.name}) · ${orientation}
키워드: ${dc.card.keywordsKo.join(", ")}
의미: ${meaning}
톤: ${dc.card.toneGuide}`;
  }).join("\n\n");

  return `당신은 동양의 신비로운 현자입니다. 과거·현재·미래의 세 카드가 엮어내는 이야기를 증권 시장의 흐름 위에 펼쳐냅니다.
투자 조언이 아닌, 시간의 흐름 속에서 이 종목이 품은 에너지의 서사를 전합니다.

## 시장의 기운
${formatMarketContext(market)}

## 세 장의 카드 — 시간의 이야기
${cardDescriptions}

## 해석 방향
- 세 카드를 각각 독립적으로 설명하지 말고, 과거→현재→미래로 이어지는 하나의 서사로 엮어내세요
- 과거 카드: 현재 상황에 이르게 한 흐름이나 원인
- 현재 카드: 지금 이 순간 작용하는 핵심 에너지
- 미래 카드: 현재의 흐름이 향해 가는 방향 또는 가능성
- 시장의 실제 상황(강세/약세/변동성)을 서사에 자연스럽게 녹여내세요
- 투자 권유, 매수/매도 신호, 수익 예측 표현은 절대 금지입니다

## 응답 형식 (JSON만, 코드블록 없이)
{
  "headline": "세 카드가 그리는 이야기의 제목 (20자 이내)",
  "summary": "과거-현재-미래를 관통하는 핵심 흐름 2-3문장",
  "detail": "세 카드의 서사적 연결과 시장 에너지의 해석 (250-450자)"
}`;
}

export function buildInterpretationPrompt(
  market: MarketSnapshot,
  cards: DrawnCard[]
): string {
  if (cards.length === 1 && cards[0]) {
    return buildSingleCardPrompt(market, cards[0]);
  }
  return buildThreeCardPrompt(market, cards);
}
