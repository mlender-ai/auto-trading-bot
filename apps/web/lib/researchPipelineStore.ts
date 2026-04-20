import { promises as fs } from "fs";
import path from "path";

import { buildResearchWorkspace, renderResearchPipelineMarkdown, type ResearchWorkspaceData, type UserResearchPreferences } from "@trading/shared/src/research";
import { generateResearchPipelineSnapshot, type GeneratedResearchSnapshot } from "@trading/shared/src/researchPipeline";

const OUTPUT_DIR = path.join(process.cwd(), "generated", "research");
const JSON_BASENAME = "latest.json";
const MARKDOWN_BASENAME = "latest.md";
const DEFAULT_PUBLISHED_SNAPSHOT_URL = "https://raw.githubusercontent.com/mlender-ai/auto-trading-bot/main/generated/research/latest.json";

export const RESEARCH_PIPELINE_JSON_PATH = path.join(OUTPUT_DIR, JSON_BASENAME);
export const RESEARCH_PIPELINE_MARKDOWN_PATH = path.join(OUTPUT_DIR, MARKDOWN_BASENAME);
export const RESEARCH_PIPELINE_ARTIFACT_PATH = path.posix.join("generated", "research", JSON_BASENAME);

function samePreferences(left: UserResearchPreferences, right: UserResearchPreferences): boolean {
  return left.sectors.join(",") === right.sectors.join(",") && left.tickers.join(",") === right.tickers.join(",");
}

function buildStaticSnapshot(preferences?: Partial<UserResearchPreferences>): GeneratedResearchSnapshot {
  const workspace = buildResearchWorkspace(preferences);
  const markdown = renderResearchPipelineMarkdown({
    generatedAt: workspace.generatedAt,
    preferences: workspace.preferences,
    news: workspace.news,
    tickerAnalyses: workspace.tickerAnalyses,
    agentPipeline: workspace.agentPipeline
  });

  workspace.agentPipeline.runtime.summaryMarkdown = markdown;

  return {
    workspace,
    markdown,
    warnings: []
  };
}

function getSnapshotTimestamp(snapshot: GeneratedResearchSnapshot): number {
  const candidate = snapshot.workspace.agentPipeline.runtime.generatedAt || snapshot.workspace.generatedAt;
  const parsed = Date.parse(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
}

function snapshotMatchesPreferences(snapshot: GeneratedResearchSnapshot, preferences?: Partial<UserResearchPreferences>): boolean {
  if (!preferences) {
    return true;
  }

  const normalized = buildResearchWorkspace(preferences).preferences;
  return samePreferences(snapshot.workspace.preferences, normalized);
}

export async function readStoredResearchSnapshot(): Promise<GeneratedResearchSnapshot | null> {
  try {
    const raw = await fs.readFile(RESEARCH_PIPELINE_JSON_PATH, "utf8");
    return JSON.parse(raw) as GeneratedResearchSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function readPublishedResearchSnapshot(): Promise<GeneratedResearchSnapshot | null> {
  const snapshotUrl = process.env.RESEARCH_PUBLISHED_SNAPSHOT_URL || DEFAULT_PUBLISHED_SNAPSHOT_URL;

  try {
    const response = await fetch(snapshotUrl, {
      headers: {
        accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4_000)
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as GeneratedResearchSnapshot;
  } catch {
    return null;
  }
}

export async function readPreferredResearchSnapshot(preferences?: Partial<UserResearchPreferences>): Promise<GeneratedResearchSnapshot | null> {
  const [stored, published] = await Promise.all([readStoredResearchSnapshot(), readPublishedResearchSnapshot()]);
  const candidates = [published, stored].filter((snapshot): snapshot is GeneratedResearchSnapshot => Boolean(snapshot && snapshotMatchesPreferences(snapshot, preferences)));

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((left, right) => getSnapshotTimestamp(right) - getSnapshotTimestamp(left))[0] ?? null;
}

export async function getInitialResearchWorkspace(preferences?: Partial<UserResearchPreferences>): Promise<ResearchWorkspaceData> {
  const snapshot = await readPreferredResearchSnapshot(preferences);
  const fallback = buildStaticSnapshot(preferences);

  if (!snapshot) {
    return fallback.workspace;
  }

  snapshot.workspace.agentPipeline.runtime.summaryMarkdown ||= snapshot.markdown;
  return snapshot.workspace;
}

export async function runAndPersistResearchPipeline(preferences?: Partial<UserResearchPreferences>, source: "web-api" | "local-script" | "github-actions" = "local-script") {
  const snapshot = await generateResearchPipelineSnapshot({
    ...(preferences ? { preferences } : {}),
    source,
    artifactPath: RESEARCH_PIPELINE_ARTIFACT_PATH
  });

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(RESEARCH_PIPELINE_JSON_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  await fs.writeFile(RESEARCH_PIPELINE_MARKDOWN_PATH, snapshot.markdown, "utf8");

  return snapshot;
}
