import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/colors";

function TabIcon({ label }: { label: string }) {
  return <Text style={styles.tabIcon}>{label}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "홈", tabBarIcon: () => <TabIcon label="✦" /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "기록", tabBarIcon: () => <TabIcon label="◈" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "프로필", tabBarIcon: () => <TabIcon label="◎" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
  },
  tabIcon: {
    fontSize: 12,
    color: Colors.muted,
  },
});
