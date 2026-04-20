import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "리서치 브리핑 허브",
  description: "개인화된 주식 뉴스, 티커 시그널, 에이전트 회의를 하나로 묶은 리서치 워크스페이스",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
