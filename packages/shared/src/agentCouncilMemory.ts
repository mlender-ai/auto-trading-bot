import { promises as fs } from "fs";
import path from "path";

import type { AgentRole } from "./research";

export interface CompletedActionRecord {
  id: string;
  title: string;
  owner: AgentRole;
  completedAt: string;
  issueUrl: string | null;
  pullRequestUrl: string | null;
}

const ARCHIVE_DIR = path.join(process.cwd(), ".github", "agent-council");
export const COMPLETED_ACTION_ARCHIVE_PATH = path.join(ARCHIVE_DIR, "completed-items.md");
const RECORD_PREFIX = "<!-- completed-action-record ";
const RECORD_SUFFIX = " -->";

function dedupeRecords(records: CompletedActionRecord[]): CompletedActionRecord[] {
  const byId = new Map<string, CompletedActionRecord>();

  for (const record of records) {
    const existing = byId.get(record.id);

    if (!existing || Date.parse(record.completedAt) >= Date.parse(existing.completedAt)) {
      byId.set(record.id, record);
    }
  }

  return Array.from(byId.values()).sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt));
}

function renderRecord(record: CompletedActionRecord): string {
  const links = [record.issueUrl ? `[Issue](${record.issueUrl})` : null, record.pullRequestUrl ? `[PR](${record.pullRequestUrl})` : null]
    .filter(Boolean)
    .join(" · ");

  return [
    `${RECORD_PREFIX}${JSON.stringify(record)}${RECORD_SUFFIX}`,
    `- \`${record.id}\` · ${record.owner} · ${record.title} · ${record.completedAt}${links ? ` · ${links}` : ""}`,
    ""
  ].join("\n");
}

export function renderCompletedActionArchive(records: CompletedActionRecord[]): string {
  const normalized = dedupeRecords(records);

  return [
    "# Agent Council Completed Items",
    "",
    "24시간 자동 에이전트 루프에서 이미 해결된 아이디어 기록입니다.",
    "이 파일의 `id`는 이후 새 액션 아이템 생성에서 제외됩니다.",
    "",
    ...(normalized.length > 0
      ? normalized.flatMap((record) => renderRecord(record).trimEnd().split("\n"))
      : ["_아직 기록된 완료 아이템이 없습니다._"])
  ].join("\n");
}

export async function readCompletedActionArchive(): Promise<CompletedActionRecord[]> {
  try {
    const raw = await fs.readFile(COMPLETED_ACTION_ARCHIVE_PATH, "utf8");
    const matches = Array.from(raw.matchAll(/<!-- completed-action-record (.+?) -->/g));

    return dedupeRecords(
      matches
        .map((match) => {
          try {
            const parsed = JSON.parse(match[1] ?? "") as CompletedActionRecord;
            return parsed?.id && parsed?.title && parsed?.owner && parsed?.completedAt ? parsed : null;
          } catch {
            return null;
          }
        })
        .filter((record): record is CompletedActionRecord => Boolean(record))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function writeCompletedActionArchive(records: CompletedActionRecord[]): Promise<void> {
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  await fs.writeFile(COMPLETED_ACTION_ARCHIVE_PATH, `${renderCompletedActionArchive(records).trimEnd()}\n`, "utf8");
}

export async function readResolvedActionItemIds(): Promise<string[]> {
  const archive = await readCompletedActionArchive();
  return archive.map((record) => record.id);
}
