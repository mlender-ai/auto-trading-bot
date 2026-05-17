import { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing } from "../../constants/theme";
import { useUserStore } from "../../lib/store";
import { useCollectionStore, type CollectionCard } from "../../lib/collectionStore";

const { width } = Dimensions.get("window");
const COLS = 4;
const CELL = (width - Spacing.s16 * 2 - 8 * (COLS - 1)) / COLS;

// 메이저 아르카나 전통 심볼 (카드 플레이스홀더용)
const CARD_SYMBOLS: Record<number, string> = {
  0: "☀", 1: "✦", 2: "☽", 3: "♀", 4: "♂", 5: "☩",
  6: "♥", 7: "⚔", 8: "♾", 9: "◎", 10: "☸", 11: "⚖",
  12: "⌛", 13: "⚰", 14: "☯", 15: "♟", 16: "⚡", 17: "★",
  18: "☾", 19: "☀", 20: "⚜", 21: "🌍",
};

function CardCell({ card }: { card: CollectionCard }) {
  const symbol = CARD_SYMBOLS[card.number] ?? "✦";

  return (
    <View style={[styles.cell, !card.collected && styles.cellLocked]}>
      {card.collected ? (
        <>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.cardNameKo} numberOfLines={1}>{card.nameKo}</Text>
          {card.drawCount > 1 && (
            <Text style={styles.drawCount}>×{card.drawCount}</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.symbolLocked}>？</Text>
          <Text style={styles.lockIcon}>🔒</Text>
        </>
      )}
    </View>
  );
}

export default function CollectionScreen() {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const { stats, loading, fetchCollection } = useCollectionStore();

  useEffect(() => {
    const controller = new AbortController();
    fetchCollection(controller.signal);
    return () => controller.abort();
  }, [fetchCollection]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>◈</Text>
          <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
          <Text style={styles.emptyDesc}>카드 도감은 로그인 후 확인할 수 있습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카드 도감</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading && !stats ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.taroEssence} />
        </View>
      ) : stats ? (
        <FlatList
          data={stats.cards}
          keyExtractor={(c) => c.id}
          numColumns={COLS}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <View style={styles.statsSection}>
              {/* 완료 배너 */}
              {stats.isComplete && (
                <View style={styles.completeBanner}>
                  <Text style={styles.completeBannerText}>🏆 타로 마스터 달성!</Text>
                  <Text style={styles.completeBannerSub}>22장을 모두 수집했습니다</Text>
                </View>
              )}

              {/* 진행률 */}
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>수집 현황</Text>
                  <Text style={styles.progressCount}>
                    {stats.collectedCount} / {stats.total}장
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${stats.completionRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressRate}>
                  {stats.completionRate.toFixed(0)}% 완료
                </Text>
              </View>

              <Text style={styles.gridLabel}>메이저 아르카나 22장</Text>
            </View>
          }
          renderItem={({ item }) => <CardCell card={item} />}
          contentContainerStyle={styles.list}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ebonyCanvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.s16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { paddingVertical: 4, width: 50 },
  backText: { fontSize: 14, color: Colors.taroEssence },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.whiteout },

  // List
  list: { paddingHorizontal: Spacing.s16, paddingBottom: 40 },
  row: { gap: 8, marginBottom: 8 },

  // Stats section
  statsSection: { marginBottom: Spacing.s16 },
  completeBanner: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(62,207,142,0.1)",
    borderWidth: 1,
    borderColor: "rgba(62,207,142,0.3)",
    alignItems: "center",
    marginBottom: 12,
  },
  completeBannerText: { fontSize: 18, fontWeight: "800", color: Colors.taroEssence },
  completeBannerSub: { fontSize: 12, color: Colors.midGrayText, marginTop: 2 },

  progressCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.graphiteBase,
    borderWidth: 1,
    borderColor: Colors.carbonBorder,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, color: Colors.silverHighlight, fontWeight: "600" },
  progressCount: { fontSize: 13, color: Colors.taroEssence, fontWeight: "700" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.steelSurface,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.taroEssence,
  },
  progressRate: { fontSize: 11, color: Colors.midGrayText },

  gridLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.midGrayText,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  // Card cell
  cell: {
    width: CELL,
    aspectRatio: 0.7,
    borderRadius: 8,
    backgroundColor: Colors.graphiteBase,
    borderWidth: 1,
    borderColor: Colors.taroEssence,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    gap: 3,
  },
  cellLocked: {
    borderColor: Colors.carbonBorder,
    backgroundColor: Colors.steelSurface,
    opacity: 0.5,
  },
  symbol: { fontSize: 22, color: Colors.taroEssence },
  symbolLocked: { fontSize: 22, color: Colors.ironOutline },
  lockIcon: { fontSize: 12 },
  cardNameKo: { fontSize: 9, color: Colors.silverHighlight, textAlign: "center" },
  drawCount: { fontSize: 9, color: Colors.midGrayText },

  // Empty
  emptyIcon: { fontSize: 36, color: Colors.carbonBorder, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.whiteout, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.midGrayText, textAlign: "center" },
});
