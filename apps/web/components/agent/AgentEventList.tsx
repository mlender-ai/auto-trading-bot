"use client";

import type { AgentEventRow } from "../../lib/console-copy";

interface AgentEventListProps {
  events: AgentEventRow[];
}

export function AgentEventList({ events }: AgentEventListProps) {
  return (
    <section className="agent-events-panel">
      <span className="agent-section-label">최근 이벤트</span>
      <div className="agent-event-list">
        {events.length === 0 ? <p className="agent-empty-line">최근 이벤트가 없습니다.</p> : null}
        {events.map((event) => (
          <article className="agent-event-item" data-tone={event.tone} key={event.id}>
            <p>{event.sentence}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
