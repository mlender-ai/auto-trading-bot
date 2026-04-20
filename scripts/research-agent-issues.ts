import { promises as fs } from "fs";

import { renderResearchPipelineMarkdown, type ProductActionItem, type ResearchWorkspaceData } from "../packages/shared/src/research";
import { type GeneratedResearchSnapshot } from "../packages/shared/src/researchPipeline";

const SNAPSHOT_PATH = "generated/research/latest.json";
const MARKDOWN_PATH = "generated/research/latest.md";
const LABELS = [
  { name: "agent-council", color: "1d76db", description: "Action items proposed by the agent council" },
  { name: "research-automation", color: "0e8a16", description: "Automatically managed research workflow issue" }
];

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: "open" | "closed";
  pull_request?: unknown;
}

function buildIssueMarker(itemId: string): string {
  return `<!-- research-action-item:${itemId} -->`;
}

function buildIssueTitle(item: ProductActionItem): string {
  return `[Agent Council] ${item.title}`;
}

function buildIssueBody(item: ProductActionItem, workspace: ResearchWorkspaceData): string {
  const headline = workspace.news.headline?.title ?? "헤드라인 없음";
  const strategy = workspace.agentPipeline.actionPlan.strategy;

  return [
    buildIssueMarker(item.id),
    "",
    "## Context",
    `- Generated At: ${workspace.generatedAt}`,
    `- Headline: ${headline}`,
    `- Strategy: ${strategy}`,
    `- Owner: ${item.owner}`,
    `- References: ${item.references.join(", ") || "n/a"}`,
    "",
    "## Action Item",
    item.detail,
    "",
    "## Acceptance",
    "- [ ] 작업 범위를 제품 변경으로 구체화한다.",
    "- [ ] 구현 또는 측정 지표를 연결한다.",
    "- [ ] 완료 후 에이전트 회의 탭과 snapshot에 반영한다."
  ].join("\n");
}

function withIssueMetadata(item: ProductActionItem, issue: GitHubIssue | null): ProductActionItem {
  if (!issue) {
    return {
      ...item,
      issueNumber: null,
      issueUrl: null,
      issueState: "proposed"
    };
  }

  return {
    ...item,
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    issueState: issue.state
  };
}

async function readSnapshot(): Promise<GeneratedResearchSnapshot> {
  return JSON.parse(await fs.readFile(SNAPSHOT_PATH, "utf8")) as GeneratedResearchSnapshot;
}

function getRepoContext() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repository = process.env.GITHUB_REPOSITORY?.trim();

  if (!token || !repository) {
    return null;
  }

  const [owner, repo] = repository.split("/");

  if (!owner || !repo) {
    return null;
  }

  return {
    token,
    owner,
    repo
  };
}

async function githubRequest<T>(context: NonNullable<ReturnType<typeof getRepoContext>>, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${context.token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function ensureLabels(context: NonNullable<ReturnType<typeof getRepoContext>>) {
  for (const label of LABELS) {
    try {
      await githubRequest(context, `/repos/${context.owner}/${context.repo}/labels`, {
        method: "POST",
        body: JSON.stringify(label)
      });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("already_exists")) {
        throw error;
      }
    }
  }
}

async function listManagedIssues(context: NonNullable<ReturnType<typeof getRepoContext>>): Promise<GitHubIssue[]> {
  const issues = await githubRequest<GitHubIssue[]>(
    context,
    `/repos/${context.owner}/${context.repo}/issues?state=all&labels=agent-council&per_page=100`
  );

  return issues.filter((issue) => !issue.pull_request && issue.body?.includes("research-action-item:"));
}

function findManagedIssue(issues: GitHubIssue[], itemId: string): GitHubIssue | null {
  const marker = buildIssueMarker(itemId);
  return issues.find((issue) => issue.body?.includes(marker)) ?? null;
}

async function upsertIssue(
  context: NonNullable<ReturnType<typeof getRepoContext>>,
  existing: GitHubIssue | null,
  item: ProductActionItem,
  workspace: ResearchWorkspaceData
): Promise<GitHubIssue> {
  const body = buildIssueBody(item, workspace);
  const title = buildIssueTitle(item);

  if (!existing) {
    return githubRequest<GitHubIssue>(context, `/repos/${context.owner}/${context.repo}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        labels: LABELS.map((label) => label.name)
      })
    });
  }

  if (existing.title === title && existing.body === body && existing.state === "open") {
    return existing;
  }

  return githubRequest<GitHubIssue>(context, `/repos/${context.owner}/${context.repo}/issues/${existing.number}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
      body,
      state: "open"
    })
  });
}

async function closeStaleIssues(
  context: NonNullable<ReturnType<typeof getRepoContext>>,
  issues: GitHubIssue[],
  activeIds: Set<string>
) {
  for (const issue of issues) {
    const marker = issue.body?.match(/research-action-item:([a-z0-9-]+)/i)?.[1];

    if (!marker || activeIds.has(marker) || issue.state === "closed") {
      continue;
    }

    await githubRequest(context, `/repos/${context.owner}/${context.repo}/issues/${issue.number}`, {
      method: "PATCH",
      body: JSON.stringify({
        state: "closed"
      })
    });
  }
}

async function persistSnapshot(snapshot: GeneratedResearchSnapshot) {
  snapshot.markdown = renderResearchPipelineMarkdown({
    generatedAt: snapshot.workspace.generatedAt,
    preferences: snapshot.workspace.preferences,
    news: snapshot.workspace.news,
    tickerAnalyses: snapshot.workspace.tickerAnalyses,
    agentPipeline: snapshot.workspace.agentPipeline,
    productReview: snapshot.workspace.productReview
  });
  snapshot.workspace.agentPipeline.runtime.summaryMarkdown = snapshot.markdown;

  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  await fs.writeFile(MARKDOWN_PATH, snapshot.markdown, "utf8");
}

async function main() {
  const snapshot = await readSnapshot();
  const context = getRepoContext();

  if (!context) {
    process.stdout.write("issues=skipped\nreason=GITHUB_TOKEN 또는 GITHUB_REPOSITORY가 없어 이슈 동기화를 건너뜁니다.\n");
    return;
  }

  await ensureLabels(context);
  const existingIssues = await listManagedIssues(context);
  const synced: GitHubIssue[] = [];

  for (const item of snapshot.workspace.productReview.actionItems) {
    const issue = await upsertIssue(context, findManagedIssue(existingIssues, item.id), item, snapshot.workspace);
    synced.push(issue);
  }

  await closeStaleIssues(context, existingIssues, new Set(snapshot.workspace.productReview.actionItems.map((item) => item.id)));

  snapshot.workspace.productReview.actionItems = snapshot.workspace.productReview.actionItems.map((item) =>
    withIssueMetadata(item, synced.find((issue) => issue.body?.includes(buildIssueMarker(item.id))) ?? null)
  );

  await persistSnapshot(snapshot);

  process.stdout.write(
    [
      `issues=synced`,
      `count=${snapshot.workspace.productReview.actionItems.length}`,
      ...snapshot.workspace.productReview.actionItems.map((item) => `${item.id}=${item.issueUrl ?? "pending"}`)
    ].join("\n")
  );
  process.stdout.write("\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
