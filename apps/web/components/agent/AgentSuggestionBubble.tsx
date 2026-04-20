"use client";

import { useState } from "react";

import type { AgentSuggestionItem } from "../../lib/console-copy";

interface AgentSuggestionBubbleProps {
  suggestions: AgentSuggestionItem[];
}

type SuggestionAction = "accept" | "defer" | "ignore" | null;

const actionLabelMap: Record<Exclude<SuggestionAction, null>, string> = {
  accept: "수락",
  defer: "보류",
  ignore: "무시"
};

export function AgentSuggestionBubble({ suggestions }: AgentSuggestionBubbleProps) {
  const queue =
    suggestions.length > 0
      ? suggestions
      : [
          {
            id: "fallback",
            issue: "표본 부족",
            cause: "의미 있는 손실 패턴을 확정할 만큼 데이터가 충분하지 않습니다.",
            action: "현재 규칙을 유지한 채 표본을 더 쌓아 주세요."
          }
        ];
  const [cursor, setCursor] = useState(0);
  const [lastAction, setLastAction] = useState<SuggestionAction>(null);
  const activeSuggestion = queue[cursor] ?? null;

  function handleAction(action: Exclude<SuggestionAction, null>) {
    setLastAction(action);
    setCursor((current) => Math.min(current + 1, queue.length));
  }

  if (!activeSuggestion) {
    return (
      <aside className="agent-suggestion-panel">
        <div className="agent-suggestion-bubble complete">
          <span className="agent-suggestion-label">에이전트 제안</span>
          <p>현재 제안 검토를 마쳤습니다.</p>
          <div className="agent-suggestion-meta">
            <span>{lastAction ? `${actionLabelMap[lastAction]} 처리 완료` : "검토 완료"}</span>
            <button className="agent-suggestion-reset" onClick={() => setCursor(0)} type="button">
              다시 보기
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="agent-suggestion-panel">
      <div className="agent-suggestion-bubble">
        <span className="agent-suggestion-label">에이전트 제안</span>
        <div className="agent-suggestion-copy">
          <div className="agent-suggestion-row">
            <span className="agent-suggestion-key">현재 문제</span>
            <p>{activeSuggestion.issue}</p>
          </div>
          <div className="agent-suggestion-row">
            <span className="agent-suggestion-key">원인</span>
            <p>{activeSuggestion.cause}</p>
          </div>
          <div className="agent-suggestion-row">
            <span className="agent-suggestion-key">제안</span>
            <p>{activeSuggestion.action}</p>
          </div>
        </div>

        <div className="agent-suggestion-actions">
          <button className="agent-suggestion-button" onClick={() => handleAction("accept")} type="button">
            수락
          </button>
          <button className="agent-suggestion-button" onClick={() => handleAction("defer")} type="button">
            보류
          </button>
          <button className="agent-suggestion-button" onClick={() => handleAction("ignore")} type="button">
            무시
          </button>
        </div>

        <div className="agent-suggestion-meta">
          <span>
            제안 {Math.min(cursor + 1, queue.length)} / {queue.length}
          </span>
          {lastAction ? <span>직전 처리 {actionLabelMap[lastAction]}</span> : null}
        </div>
      </div>
    </aside>
  );
}
