import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.placeholder}>로그인하면 프로필이 표시됩니다</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  center:      { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholder: { fontSize: 14, color: Colors.muted },
});
