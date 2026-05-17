import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Colors } from "../constants/theme";

// expo-router가 자동으로 숨기는 걸 막고 splash에서 직접 제어
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // 네이티브 스플래시는 즉시 숨김 (우리 스플래시 화면이 대신)
    void SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.ebonyCanvas },
          headerTintColor: Colors.whiteout,
          contentStyle: { backgroundColor: Colors.ebonyCanvas },
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="splash/index" options={{ animation: "none" }} />
        <Stack.Screen name="onboarding/index" options={{ animation: "slide_from_bottom", gestureEnabled: false }} />
        <Stack.Screen name="login/index" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="result/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="collection/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="favorites/index" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="history/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="history/analytics" options={{ animation: "slide_from_right" }} />
      </Stack>
    </>
  );
}
