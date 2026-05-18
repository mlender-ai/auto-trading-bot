import { useRef, useEffect, useState } from "react";
import {
  SafeAreaView, View, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Modal, TextInput, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { useDrawStore, type DrawnCard } from "../../lib/drawStore";
import { apiFetch } from "../../lib/api";

const DISCLAIMER = "본 해석은 오락 목적으로 제공되며 투자 조언이 아닙니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.";

function CardReveal({ card, index }: { card: DrawnCard; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: index * 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: index * 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.cardReveal, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardThumb}>
          <Text style={styles.cardThumSymbol}>{card.symbol}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text variant="subheading">{card.name}</Text>
          <Text variant="body-sm">{card.nameKo}</Text>
          {card.isReversed && (
            <View style={styles.reversedBadge}>
              <Text variant="caption" color={Colors.taroEssence}>역방향</Text>
            </View>
          )}
        </View>
      </View>

      <Text variant="heading" style={styles.headline}>{card.headline}</Text>
      <Text variant="body-sm" style={styles.summary}>{card.summary}</Text>
      <Text variant="body-sm" style={styles.detail}>{card.detail}</Text>
    </Animated.View>
  );
}

const REPORT_REASONS = ["투자 조언 포함", "불쾌한 내용", "오류/버그", "기타"];

function FeedbackSection({ drawId }: { drawId: string }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleRate = async (star: number) => {
    if (submitted) return;
    setRating(star);
    try {
      await apiFetch("/api/tarot/feedback", {
        method: "POST",
        body: JSON.stringify({ drawId, rating: star }),
      });
      setSubmitted(true);
    } catch {
      setRating(0);
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await apiFetch("/api/tarot/report", {
        method: "POST",
        body: JSON.stringify({ drawId, reason: reportReason }),
      });
      setReportSubmitted(true);
      setReportVisible(false);
    } catch {
      Alert.alert("오류", "신고 전송에 실패했습니다.");
    }
  };

  return (
    <View style={styles.feedbackSection}>
      <View style={styles.feedbackRow}>
        <Text variant="caption" color={Colors.midGrayText}>해석이 도움이 됐나요?</Text>
        {reportSubmitted ? null : (
          <TouchableOpacity onPress={() => setReportVisible(true)}>
            <Text variant="caption" color={Colors.ironOutline}>신고</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => handleRate(s)} disabled={submitted}>
            <Text style={[styles.star, s <= rating ? styles.starFilled : styles.starEmpty]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
        {submitted && (
          <Text variant="caption" color={Colors.taroEssence} style={styles.thankYou}>감사합니다</Text>
        )}
      </View>

      <Modal visible={reportVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text variant="subheading" color={Colors.whiteout} style={{ marginBottom: 16 }}>
              신고 사유
            </Text>
            {REPORT_REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonBtn, reportReason === r && styles.reasonBtnActive]}
                onPress={() => setReportReason(r)}
              >
                <Text variant="body-sm" color={reportReason === r ? Colors.taroEssence : Colors.silverHighlight}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setReportVisible(false)} style={styles.modalCancel}>
                <Text variant="body-sm" color={Colors.midGrayText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReport}
                style={[styles.modalSubmit, !reportReason && styles.modalSubmitDisabled]}
                disabled={!reportReason}
              >
                <Text variant="body-sm" color={reportReason ? Colors.taroEssence : Colors.ironOutline}>
                  신고하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { result, reset } = useDrawStore();

  if (!result) {
    router.replace("/(tabs)");
    return null;
  }

  const handleDrawAgain = () => {
    reset();
    router.replace("/(tabs)/draw");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text variant="body-sm" color={Colors.midGrayText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>

        {/* 종목 + 날짜 */}
        <View style={styles.meta}>
          <Text variant="caption" color={Colors.taroEssence} style={styles.spreadLabel}>
            {result.spread === "single" ? "1장 스프레드" : "3장 스프레드"}
          </Text>
          <Text variant="heading" style={styles.tickerTitle}>
            {result.tickerName}
          </Text>
          <Text variant="caption" color={Colors.ironOutline}>{result.ticker}</Text>
        </View>

        {/* 카드들 */}
        <View style={styles.cards}>
          {result.cards.map((card, i) => (
            <CardReveal key={card.id} card={card} index={i} />
          ))}
        </View>

        {/* 피드백 */}
        <FeedbackSection drawId={result.id} />

        {/* 면책 고지 */}
        <View style={styles.disclaimer}>
          <Text variant="caption" color={Colors.ironOutline} style={styles.disclaimerText}>
            ⚠ {DISCLAIMER}
          </Text>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <Button variant="primary" label="다시 뽑기" onPress={handleDrawAgain} />
          <Button
            variant="secondary"
            label="홈으로"
            onPress={() => { reset(); router.replace("/(tabs)"); }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.ebonyCanvas },
  scroll:             { paddingHorizontal: Spacing.s24, paddingBottom: 48 },
  header:             { paddingTop: Spacing.s16, marginBottom: Spacing.s16 },
  backBtn:            { alignSelf: "flex-start", padding: 4 },
  meta:               { marginBottom: Spacing.s32, gap: 4 },
  spreadLabel:        { letterSpacing: 1, marginBottom: 4 },
  tickerTitle:        { color: Colors.whiteout },
  cards:              { gap: 16, marginBottom: Spacing.s24 },
  cardReveal:         { backgroundColor: Colors.graphiteBase, borderRadius: Radius.cards, padding: Spacing.s24, borderWidth: 1, borderColor: Colors.carbonBorder },
  cardHeader:         { flexDirection: "row", gap: 16, marginBottom: Spacing.s16 },
  cardThumb:          { width: 56, height: 80, backgroundColor: Colors.ebonyCanvas, borderRadius: 8, borderWidth: 1, borderColor: Colors.taroEssence, alignItems: "center", justifyContent: "center" },
  cardThumSymbol:     { fontSize: 14, color: Colors.taroEssence, fontWeight: "700" },
  cardMeta:           { flex: 1, justifyContent: "center", gap: 2 },
  reversedBadge:      { marginTop: 4, alignSelf: "flex-start", borderWidth: 1, borderColor: Colors.taroEssence, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  headline:           { color: Colors.whiteout, marginBottom: Spacing.s8 },
  summary:            { color: Colors.silverHighlight, marginBottom: Spacing.s8 },
  detail:             { color: Colors.midGrayText, lineHeight: 22 },
  feedbackSection:    { backgroundColor: Colors.graphiteBase, borderRadius: 12, padding: Spacing.s16, borderWidth: 1, borderColor: Colors.carbonBorder, marginBottom: Spacing.s16 },
  feedbackRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  starsRow:           { flexDirection: "row", gap: 8, alignItems: "center" },
  star:               { fontSize: 28 },
  starFilled:         { color: Colors.taroEssence },
  starEmpty:          { color: Colors.carbonBorder },
  thankYou:           { marginLeft: 8 },
  modalOverlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalBox:           { backgroundColor: Colors.graphiteBase, borderRadius: 16, padding: 24, width: "100%", borderWidth: 1, borderColor: Colors.carbonBorder },
  reasonBtn:          { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.carbonBorder, marginBottom: 8 },
  reasonBtnActive:    { borderColor: Colors.taroEssence, backgroundColor: Colors.voidGreen },
  modalActions:       { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 8 },
  modalCancel:        { padding: 8 },
  modalSubmit:        { padding: 8 },
  modalSubmitDisabled:{ opacity: 0.4 },
  disclaimer:         { backgroundColor: Colors.steelSurface, borderRadius: 10, padding: Spacing.s16, marginBottom: Spacing.s24, borderWidth: 1, borderColor: Colors.carbonBorder },
  disclaimerText:     { lineHeight: 18 },
  actions:            { gap: 12 },
});
