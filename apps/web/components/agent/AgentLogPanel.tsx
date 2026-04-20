"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { AgentLogFilter, AgentLogRow } from "../../lib/console-copy";

interface AgentLogPanelProps {
  rows: AgentLogRow[];
}

const filterCopy: Array<{ key: AgentLogFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "entry", label: "진입" },
  { key: "exit", label: "청산" },
  { key: "loss", label: "손실" },
  { key: "skip", label: "스킵" }
];

export function AgentLogPanel({ rows }: AgentLogPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AgentLogFilter>("all");
  const filteredRows = useMemo(
    () => (activeFilter === "all" ? rows : rows.filter((row) => row.filter === activeFilter)),
    [activeFilter, rows]
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || !stickToBottom) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [filteredRows, stickToBottom]);

  function handleScroll() {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setStickToBottom(distanceFromBottom < 24);
  }

  return (
    <section className="agent-log-panel">
      <div className="agent-log-head">
        <div className="agent-log-head-copy">
          <span className="agent-log-title">실행 로그</span>
          <span className="agent-log-mode">{stickToBottom ? "LIVE" : "이력 보기"}</span>
        </div>

        <div className="agent-log-filters" role="tablist" aria-label="로그 필터">
          {filterCopy.map((filter) => {
            const count = filter.key === "all" ? rows.length : rows.filter((row) => row.filter === filter.key).length;

            return (
              <button
                aria-selected={activeFilter === filter.key}
                className={`agent-log-filter ${activeFilter === filter.key ? "active" : ""}`}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                role="tab"
                type="button"
              >
                <span>{filter.label}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="agent-log-viewport" onScroll={handleScroll} ref={viewportRef}>
        {filteredRows.length === 0 ? <p className="agent-log-empty">선택한 조건의 로그가 없습니다.</p> : null}
        {filteredRows.map((row) => (
          <article className="agent-log-line" data-tone={row.tone} key={row.id}>
            <span className="agent-log-time">{row.time}</span>
            <span className={`agent-log-tag agent-log-tag-${row.tag.toLowerCase()}`}>{row.tag}</span>
            <div className="agent-log-body">
              <p className="agent-log-message">{row.message}</p>
              {row.detail ? <p className="agent-log-detail">{row.detail}</p> : null}
              {row.bullets && row.bullets.length > 0 ? (
                <ul className="agent-log-bullets">
                  {row.bullets.slice(0, 3).map((bullet) => (
                    <li key={`${row.id}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            {row.result ? (
              <span className={`agent-log-result ${row.tone === "positive" ? "value-positive" : row.tone === "negative" ? "value-negative" : ""}`}>
                {row.result}
              </span>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
