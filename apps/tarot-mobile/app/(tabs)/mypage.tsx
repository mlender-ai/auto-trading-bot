import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text } from "../../components/ui";
import { Colors } from "../../constants/theme";

export default function MyPageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text variant="heading" color={Colors.taroEssence}>◎</Text>
        <Text variant="subheading" style={styles.mt8}>마이페이지</Text>
        <Text variant="body-sm" style={styles.mt8}>P2-3 이후 구현 예정</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ebonyCanvas },
  center:    { flex: 1, alignItems: "center", justifyContent: "center" },
  mt8:       { marginTop: 8, color: Colors.midGrayText },
});
