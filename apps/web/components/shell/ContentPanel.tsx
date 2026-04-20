"use client";

import type { ReactNode } from "react";

interface ContentPanelProps {
  children: ReactNode;
}

export function ContentPanel({ children }: ContentPanelProps) {
  return <section className="content-panel">{children}</section>;
}
