import { useState, useRef } from "react";
import {
  SafeAreaView, View, TouchableOpacity, Animated,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { useDrawStore, type SpreadType } from "../../lib/drawStore";
import { useUserStore } from "../../lib/store";
import { apiFetch } from "../../lib/api";

const SPREAD_OPTIONS: { type: SpreadType; label: string; desc: string; cost: number }[] = [
  { type: "single",     label: "1장",  desc: "핵심 흐름",    cost: 1 },
  { type: "three-card", label: "3장",  desc: "과거·현재·미래", cost: 3 },
];

// 스프레드 타입 → API 값 매핑
const SPREAD_MAP: Record<SpreadType, string> = {
  "single":     "SINGLE",
  "three-card": "THREE_CARD",
};

// API 응답 → DrawResult 변환
interface ApiDrawResponse {
  drawId: string;
  ticker: string;
  market: string;
  spread: string;
  creditCost: number;
  creditsRemaining: number;
  marketSnapshot: {
    price: number;
    changePercent: number;
    condition: string;
    summary: string;
  };
  interpretation: {
    headline: string;
    summary: string;
    detail: string;
    disclaimer: string;
    cards: Array<{
      id: string;
      nameKo: string;
      orientation: string;
      slot: string | null;
      imageUrl: string;
    }>;
  };
}

function CardBack({ flipped, delay }: { flipped: boolean; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  if (flipped) {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <Animated.View style={[styles.card, { transform: [{ rotateY: rotate }] }]}>
      <Text style={styles.cardSymbol}>✦</Text>
    </Animated.View>
  );
}

export default function DrawScreen() {
  const router = useRouter();
  const { spread, ticker, tickerName, isDrawing, setSpread, setDrawing, setResult } = useDrawStore();
  const { credits, setCredits, isLoggedIn } = useUserStore();
  const [phase, setPhase] = useState<"select" | "flipping" | "done">("select");

  const selectedOption = SPREAD_OPTIONS.find((o) => o.type === spread)!;
  const canDraw = !isLoggedIn || credits >= selectedOption.cost;

  const handleDraw = async () => {
    if (isDrawing) return;

    // 크레딧 부족 체크 (로그인 상태에서만)
    if (isLoggedIn && credits < selectedOption.cost) {
      Alert.alert(
        "크레딧 부족",
        `${selectedOption.cost} 크레딧이 필요합니다. (현재: ${credits})`,
        [{ text: "확인" }]
      );
      return;
    }

    setDrawing(true);
    setPhase("flipping");

    try {
      // 카드 뒤집기 애니메이션과 API 호출 병렬
      const [, apiData] = await Promise.all([
        new Promise((r) => setTimeout(r, 1200)), // 최소 애니메이션 시간
        apiFetch<ApiDrawResponse>("/api/tarot/draw", {
          method: "POST",
          body: JSON.stringify({
            ticker: ticker || "AAPL",
            market: ticker?.endsWith(".KS") || ticker?.endsWith(".KQ") ? "KR" : "US",
            spread: SPREAD_MAP[spread],
          }),
        }),
      ]);

      // 크레딧 잔액 업데이트
      setCredits(apiData.creditsRemaining);

      // DrawResult 형태로 변환해서 스토어에 저장
      setResult({
        id: apiData.drawId,
        ticker: apiData.ticker,
        tickerName: tickerName || apiData.ticker,
        spread,
        interpretation: apiData.interpretation.summary,
        drawnAt: new Date().toISOString(),
        cards: apiData.interpretation.cards.map((c, i) => ({
          id: c.id,
          name: c.id,
          nameKo: c.nameKo,
          symbol: "✦",
          isReversed: c.orientation === "reversed",
          headline: i === 0 ? apiData.interpretation.headline : c.nameKo,
          summary: apiData.interpretation.summary,
          detail: apiData.interpretation.detail,
          // 각 카드별 슬롯 안내
          ...(c.slot ? { slot: c.slot } : {}),
        })),
      });

      setPhase("done");
      setTimeout(() => router.push("/result"), 400);
    } catch (err) {
      setPhase("select");
      const msg = err instanceof Error ? err.message : "뽑기에 실패했습니다";
      Alert.alert("오류", msg, [{ text: "다시 시도" }]);
    } finally {
      setDrawing(false);
    }
  };

  const cardCount = spread === "single" ? 1 : 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text variant="body-sm" color={Colors.midGrayText}>← 뒤로</Text>
          </TouchableOpacity>
          <View style={styles.creditBadge}>
            <Text variant="caption" color={Colors.taroEssence}>
              {isLoggedIn ? `✦ ${credits} 크레딧` : "✦ 게스트"}
            </Text>
          </View>
        </View>

        {/* 종목 */}
        <View style={styles.tickerRow}>
          <Text variant="subheading" color={Colors.whiteout}>
            {tickerName || "종목 미선택"}
          </Text>
          {ticker ? (
            <Text variant="caption" color={Colors.taroEssence}>{ticker}</Text>
          ) : null}
        </View>

        {/* 스프레드 선택 */}
        <View style={styles.spreadRow}>
          {SPREAD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={[styles.spreadOpt, spread === opt.type && styles.spreadOptActive]}
              onPress={() => setSpread(opt.type)}
              disabled={phase !== "select"}
            >
              <Text
                variant="heading"
                color={spread === opt.type ? Colors.taroEssence : Colors.midGrayText}
              >
                {opt.label}
              </Text>
              <Text
                variant="caption"
                color={spread === opt.type ? Colors.taroEssence : Colors.ironOutline}
              >
                {opt.desc}
              </Text>
              <Text
                variant="caption"
                color={spread === opt.type ? Colors.taroEssence : Colors.ironOutline}
              >
                {opt.cost} 크레딧
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 카드 영역 */}
        <View style={styles.cardsArea}>
          <View style={styles.cardsRow}>
            {Array.from({ length: cardCount }).map((_, i) => (
              <CardBack key={i} flipped={phase === "flipping" || phase === "done"} delay={i * 200} />
            ))}
          </View>
          {phase === "flipping" && (
            <ActivityIndicator color={Colors.taroEssence} style={{ marginTop: 16 }} />
          )}
          {phase === "select" && (
            <Text variant="body-sm" style={styles.hint}>
              카드를 집중하여 바라보세요
            </Text>
          )}
        </View>

        {/* CTA */}
        <View style={styles.ctaArea}>
          {!ticker && (
            <Text variant="caption" color={Colors.midGrayText} style={styles.noTickerHint}>
              홈에서 종목을 선택하면 해당 종목으로 해석됩니다
            </Text>
          )}
          {!canDraw && (
            <Text variant="caption" color={Colors.taroEssence} style={styles.noTickerHint}>
              크레딧이 부족합니다
            </Text>
          )}
          <Button
            variant="primary"
            label={phase === "select" ? `카드 뽑기 (${selectedOption.cost} 크레딧)` : "해석 중..."}
            loading={isDrawing}
            disabled={phase !== "select"}
            onPress={handleDraw}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.ebonyCanvas },
  inner:          { flex: 1, paddingHorizontal: Spacing.s24, paddingTop: Spacing.s16 },
  header:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.s24 },
  backBtn:        { padding: 4 },
  creditBadge:    { borderWidth: 1, borderColor: Colors.deepInsight, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 },
  tickerRow:      { marginBottom: Spacing.s24, gap: 4 },
  spreadRow:      { flexDirection: "row", gap: 12, marginBottom: Spacing.s32 },
  spreadOpt:      { flex: 1, alignItems: "center", paddingVertical: Spacing.s16, backgroundColor: Colors.graphiteBase, borderRadius: Radius.cards, borderWidth: 1, borderColor: Colors.carbonBorder, gap: 4 },
  spreadOptActive:{ borderColor: Colors.taroEssence, backgroundColor: Colors.voidGreen },
  cardsArea:      { flex: 1, alignItems: "center", justifyContent: "center" },
  cardsRow:       { flexDirection: "row", gap: 12 },
  card:           { width: 80, height: 128, backgroundColor: Colors.graphiteBase, borderRadius: 10, borderWidth: 1, borderColor: Colors.taroEssence, alignItems: "center", justifyContent: "center" },
  cardSymbol:     { fontSize: 28, color: Colors.taroEssence },
  hint:           { marginTop: 16, color: Colors.ironOutline, textAlign: "center" },
  ctaArea:        { paddingBottom: Spacing.s32, gap: 12 },
  noTickerHint:   { textAlign: "center" },
});
