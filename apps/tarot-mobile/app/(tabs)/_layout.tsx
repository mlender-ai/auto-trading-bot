import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.taroEssence,
        tabBarInactiveTintColor: Colors.ironOutline,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="draw"
        options={{
          title: "카드",
          tabBarIcon: ({ focused }) => <TabIcon label="◈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "기록",
          tabBarIcon: ({ focused }) => <TabIcon label="◷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이",
          tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} />,
        }}
      />
      {/* profile 탭은 숨김 — mypage로 대체 */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.ebonyCanvas,
    borderTopWidth: 1,
    borderTopColor: Colors.carbonBorder,
    height: 56,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: -0.007,
  },
  tabIcon: {
    fontSize: 14,
    color: Colors.ironOutline,
  },
  tabIconActive: {
    color: Colors.taroEssence,
  },
});
