import { Redirect } from "expo-router";

// 앱 진입점 — 항상 스플래시로 시작
export default function Index() {
  return <Redirect href="/splash" />;
}
