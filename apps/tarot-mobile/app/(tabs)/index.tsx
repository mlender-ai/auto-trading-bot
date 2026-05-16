import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.symbol}>✦</Text>
        <Text style={styles.title}>타로 증권</Text>
        <Text style={styles.subtitle}>종목을 검색하고 타로 카드를 뽑아보세요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  symbol:    { fontSize: 40, color: Colors.gold, marginBottom: 8 },
  title:     { fontSize: 24, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  subtitle:  { fontSize: 14, color: Colors.muted, textAlign: "center" },
});
