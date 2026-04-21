import { promises as fs } from "fs";
import path from "path";

import {
  RESEARCH_BEHAVIOR_EVENT_LABELS,
  createEmptyResearchBehaviorSummary,
  type ResearchBehaviorEventName,
  type ResearchBehaviorSummary
} from "./research";

const OUTPUT_DIR = path.join(process.cwd(), "generated", "research");
const SUMMARY_PATH = path.join(OUTPUT_DIR, "behavior-summary.json");

function normalizeBehaviorSummary(value: unknown): ResearchBehaviorSummary {
  const fallback = createEmptyResearchBehaviorSummary();

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Partial<ResearchBehaviorSummary>;
  const metrics = fallback.metrics.map((metric) => {
    const matched = Array.isArray(record.metrics) ? record.metrics.find((candidate) => candidate?.eventName === metric.eventName) : null;
    return {
      eventName: metric.eventName,
      label: RESEARCH_BEHAVIOR_EVENT_LABELS[metric.eventName],
      count: typeof matched?.count === "number" ? matched.count : 0,
      lastTriggeredAt: typeof matched?.lastTriggeredAt === "string" ? matched.lastTriggeredAt : null,
      lastValue: typeof matched?.lastValue === "string" ? matched.lastValue : null
    };
  });

  return {
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
    totalEvents: metrics.reduce((sum, metric) => sum + metric.count, 0),
    lastEventName: fallback.metrics.some((metric) => metric.eventName === record.lastEventName) ? (record.lastEventName as ResearchBehaviorEventName) : null,
    lastEventAt: typeof record.lastEventAt === "string" ? record.lastEventAt : null,
    metrics
  };
}

export async function readResearchBehaviorSummary(): Promise<ResearchBehaviorSummary> {
  try {
    const raw = await fs.readFile(SUMMARY_PATH, "utf8");
    return normalizeBehaviorSummary(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyResearchBehaviorSummary();
    }

    throw error;
  }
}

async function writeResearchBehaviorSummary(summary: ResearchBehaviorSummary) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(SUMMARY_PATH, JSON.stringify(summary, null, 2), "utf8");
}

export async function recordResearchBehaviorEvent(eventName: ResearchBehaviorEventName, value?: string | null): Promise<ResearchBehaviorSummary> {
  const current = await readResearchBehaviorSummary();
  const occurredAt = new Date().toISOString();
  const next: ResearchBehaviorSummary = {
    ...current,
    updatedAt: occurredAt,
    lastEventName: eventName,
    lastEventAt: occurredAt,
    metrics: current.metrics.map((metric) =>
      metric.eventName === eventName
        ? {
            ...metric,
            count: metric.count + 1,
            lastTriggeredAt: occurredAt,
            lastValue: value?.trim() ? value.trim() : metric.lastValue
          }
        : metric
    )
  };

  next.totalEvents = next.metrics.reduce((sum, metric) => sum + metric.count, 0);
  await writeResearchBehaviorSummary(next);
  return next;
}
