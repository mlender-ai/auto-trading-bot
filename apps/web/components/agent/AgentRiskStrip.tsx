"use client";

import type { AgentRiskSnapshot } from "../../lib/console-copy";

interface AgentRiskStripProps {
  risk: AgentRiskSnapshot | null;
}

export function AgentRiskStrip({ risk }: AgentRiskStripProps) {
  if (!risk) {
    return (
      <section className="agent-risk-strip" aria-label="현재 포지션 리스크">
        <div className="agent-risk-head">
          <span className="agent-risk-title">현재 리스크</span>
          <span className="agent-risk-note">열린 포지션 없음</span>
        </div>
      </section>
    );
  }

  return (
    <section className="agent-risk-strip" aria-label="현재 포지션 리스크">
      <div className="agent-risk-head">
        <span className="agent-risk-title">
          현재 리스크 · {risk.symbol} {risk.side}
        </span>
        <span className="agent-risk-note">{risk.note}</span>
      </div>

      <div className="agent-risk-grid">
        <div className="agent-risk-item">
          <span>진입가</span>
          <strong>{risk.entryPrice}</strong>
        </div>
        <div className="agent-risk-item">
          <span>손절가</span>
          <strong>{risk.stopPrice}</strong>
        </div>
        <div className="agent-risk-item">
          <span>목표가</span>
          <strong>{risk.targetPrice}</strong>
        </div>
        <div className="agent-risk-item">
          <span>포지션 크기</span>
          <strong>{risk.positionSize}</strong>
        </div>
        <div className="agent-risk-item">
          <span>최대 손실</span>
          <strong className="value-negative">{risk.maxLossUsd}</strong>
        </div>
      </div>
    </section>
  );
}
