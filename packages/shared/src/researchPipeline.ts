import {
  buildResearchMeetingThread,
  buildResearchNewsletter,
  buildResearchProductReview,
  buildResearchWorkspace,
  getResearchSectorLabel,
  normalizeResearchPreferences,
  renderResearchPipelineMarkdown,
  type MarketInterpretation,
  type PatternConfidence,
  type ResearchAgentPipeline,
  type ResearchNewsBoard,
  type ResearchNewsItem,
  type ResearchPipelineAgentDefinition,
  type ResearchPipelineProvider,
  type ResearchPipelineRunSource,
  type ResearchPipelineRuntime,
  type ResearchPipelineStage,
  type ResearchPipelineStep,
  type ResearchSectorIssue,
  type ResearchSectorTag,
  type ResearchWorkspaceData,
  type SectorStrengthCall,
  type TickerAnalysis,
  type TickerPattern,
  type TraderActionPlan,
  type UserResearchPreferences
} from "./research";

export interface GenerateResearchPipelineOptions {
  preferences?: Partial<UserResearchPreferences>;
  source?: ResearchPipelineRunSource;
  provider?: ResearchPipelineProvider | "auto";
  model?: string;
  artifactPath?: string | null;
  openAiApiKey?: string;
  openAiBaseUrl?: string;
}

export interface GeneratedResearchSnapshot {
  workspace: ResearchWorkspaceData;
  markdown: string;
  warnings: string[];
}

interface ResolvedPipelineConfig {
  provider: ResearchPipelineProvider;
  model: string | null;
  apiKey: string | null;
  apiUrl: string;
  temperature: number;
}

interface NewsEditorDerivedSelection {
  newsId: string;
  whyImportant: string;
}

interface NewsEditorSectorSelection {
  sectorTag: ResearchSectorTag;
  newsId: string;
  whyImportant: string;
}

interface NewsEditorOutput {
  headlineId: string | null;
  headlineSummary: string;
  whyImportant: string;
  derived: NewsEditorDerivedSelection[];
  sectorIssues: NewsEditorSectorSelection[];
  editorMessage: string;
  handoffNote: string;
}

interface MacroAnalystOutput {
  summary: string;
  shortTermView: string;
  mediumTermView: string;
  strongSectors: SectorStrengthCall[];
  riskSectors: SectorStrengthCall[];
  keyEvents: MarketInterpretation["keyEvents"];
  analystMessage: string;
  handoffNote: string;
}

interface TickerAnalystStageOutput {
  ticker: string;
  summary: string;
  technicalAnalysis: string;
  patternAnalysis: TickerPattern[];
  marketContext: string;
  recommendation: string;
}

interface TickerAnalystOutput {
  leadTicker: string | null;
  analyses: TickerAnalystStageOutput[];
  analystMessage: string;
  handoffNote: string;
}

interface ExecutionTraderOutput {
  strategy: string;
  recommendedActions: string[];
  avoidActions: string[];
  risks: string[];
  traderMessage: string;
}

const DEFAULT_GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";
const DEFAULT_GITHUB_MODELS_MODEL = "openai/gpt-4.1";
const DEFAULT_OPENAI_API_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

function readEnvString(name: string): string | undefined {
  const value = process.env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveApiUrl(rawUrl: string): string {
  const url = rawUrl.replace(/\/+$/, "");

  if (url.endsWith("/chat/completions") || url.endsWith("/v1/chat/completions")) {
    return url;
  }

  if (url.endsWith("/v1")) {
    return `${url}/chat/completions`;
  }

  return `${url}/v1/chat/completions`;
}

function unwrapContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const parts = content.map((item) => {
      if (item && typeof item === "object" && "text" in item && typeof item.text === "string") {
        return item.text;
      }

      return typeof item === "string" ? item : JSON.stringify(item);
    });

    return parts.join("\n");
  }

  return String(content ?? "");
}

function dedupeNews(items: Array<ResearchNewsItem | null | undefined>): ResearchNewsItem[] {
  const seen = new Set<string>();

  return items.filter((item): item is ResearchNewsItem => {
    if (!item || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getCandidateNews(workspace: ResearchWorkspaceData): ResearchNewsItem[] {
  return dedupeNews([workspace.news.headline, ...workspace.news.derivedArticles, ...workspace.news.sectorIssues.map((issue) => issue.item)]).sort(
    (left, right) => right.importanceScore - left.importanceScore
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown, limit = 6): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .slice(0, limit);
}

function asConfidence(value: unknown): PatternConfidence {
  const confidence = asString(value).toLowerCase();

  if (confidence === "high" || confidence === "medium" || confidence === "low") {
    return confidence;
  }

  return "medium";
}

function asSectorStrengthCalls(value: unknown): SectorStrengthCall[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item);
      const sector = asString(record.sector);
      const reason = asString(record.reason);
      const horizon = asString(record.horizon) === "중기" ? "중기" : "단기";

      if (!sector || !reason) {
        return null;
      }

      return {
        sector,
        horizon,
        reason
      } satisfies SectorStrengthCall;
    })
    .filter((item): item is SectorStrengthCall => Boolean(item))
    .slice(0, 3);
}

function asPatternAnalysis(value: unknown): TickerPattern[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item);
      const name = asString(record.name);
      const detail = asString(record.detail);

      if (!name || !detail) {
        return null;
      }

      return {
        name,
        detail,
        confidence: asConfidence(record.confidence)
      } satisfies TickerPattern;
    })
    .filter((item): item is TickerPattern => Boolean(item))
    .slice(0, 2);
}

function buildRuntime(
  steps: ResearchPipelineStep[],
  generatedAt: string,
  options: Pick<ResearchPipelineRuntime, "provider" | "model" | "source" | "status" | "artifactPath"> & { runId: string }
): ResearchPipelineRuntime {
  return {
    runId: options.runId,
    provider: options.provider,
    model: options.model,
    source: options.source,
    status: options.status,
    generatedAt,
    artifactPath: options.artifactPath,
    summaryMarkdown: "",
    transcript: steps.map((step, index) => ({
      id: `${step.id}-runtime-${index + 1}`,
      agentId: step.id,
      stage: step.stage,
      author: step.name,
      roleLabel: step.roleLabel,
      audience: steps[index + 1]?.name ?? "Operator",
      summary: step.summary,
      text: [...step.outputLines, step.handoffNote].join(" "),
      references: step.references
    }))
  };
}

function buildFallbackSnapshot(baseWorkspace: ResearchWorkspaceData, config: ResolvedPipelineConfig, options: GenerateResearchPipelineOptions, warnings: string[]): GeneratedResearchSnapshot {
  const runtime = {
    ...baseWorkspace.agentPipeline.runtime,
    runId: `fallback-${baseWorkspace.generatedAt}`,
    provider: "rule-based" as const,
    model: config.provider !== "rule-based" ? config.model : null,
    source: options.source ?? "local-script",
    status: "fallback" as const,
    generatedAt: baseWorkspace.generatedAt,
    artifactPath: options.artifactPath ?? null
  };

  const workspace: ResearchWorkspaceData = {
    ...baseWorkspace,
    agentPipeline: {
      ...baseWorkspace.agentPipeline,
      runtime
    }
  };

  workspace.agentPipeline.runtime.summaryMarkdown = renderResearchPipelineMarkdown({
    generatedAt: workspace.generatedAt,
    preferences: workspace.preferences,
    news: workspace.news,
    tickerAnalyses: workspace.tickerAnalyses,
    agentPipeline: workspace.agentPipeline
  });

  return {
    workspace,
    markdown: workspace.agentPipeline.runtime.summaryMarkdown,
    warnings
  };
}

function resolvePipelineConfig(options: GenerateResearchPipelineOptions): { config: ResolvedPipelineConfig; warnings: string[] } {
  const warnings: string[] = [];
  const providerSetting =
    options.provider ?? ((readEnvString("RESEARCH_PIPELINE_PROVIDER") as ResearchPipelineProvider | "auto" | undefined) ?? "auto");
  const configuredApiKey = options.openAiApiKey ?? readEnvString("AI_API_KEY") ?? readEnvString("OPENAI_API_KEY") ?? null;
  const githubToken = readEnvString("GITHUB_TOKEN") ?? null;
  const usesGithubToken = !configuredApiKey || configuredApiKey.toUpperCase() === "USE_GITHUB_TOKEN";
  const apiKey = usesGithubToken ? githubToken : configuredApiKey;
  const requestedApiUrl = options.openAiBaseUrl ?? readEnvString("AI_API_URL") ?? readEnvString("OPENAI_BASE_URL");
  const temperature = Number.parseFloat(readEnvString("AI_TEMPERATURE") ?? "0.2");
  const resolvedTemperature = Number.isFinite(temperature) ? temperature : 0.2;
  const provider =
    providerSetting === "github-models"
      ? "github-models"
      : providerSetting === "openai"
        ? "openai"
        : requestedApiUrl
          ? requestedApiUrl.includes("models.github.ai")
            ? "github-models"
            : configuredApiKey && !usesGithubToken
              ? "openai"
              : githubToken
                ? "github-models"
                : "rule-based"
          : configuredApiKey && !usesGithubToken
            ? "openai"
            : githubToken
              ? "github-models"
              : "rule-based";
  const model =
    options.model ??
    readEnvString("AI_MODEL") ??
    readEnvString("OPENAI_MODEL") ??
    readEnvString("RESEARCH_PIPELINE_MODEL") ??
    (provider === "github-models" ? DEFAULT_GITHUB_MODELS_MODEL : DEFAULT_OPENAI_MODEL);
  const apiUrl = resolveApiUrl(requestedApiUrl ?? (provider === "github-models" ? DEFAULT_GITHUB_MODELS_URL : DEFAULT_OPENAI_API_URL));

  if ((providerSetting === "openai" || provider === "openai") && !apiKey) {
    warnings.push("AI_API_KEY 또는 OPENAI_API_KEY가 없어 규칙 기반 파이프라인으로 대체했습니다.");

    return {
      config: {
        provider: "rule-based",
        model: null,
        apiKey: null,
        apiUrl,
        temperature: resolvedTemperature
      },
      warnings
    };
  }

  if (provider === "github-models" && !apiKey) {
    warnings.push("GITHUB_TOKEN fallback이 없어 GitHub Models 대신 규칙 기반 파이프라인으로 대체했습니다.");

    return {
      config: {
        provider: "rule-based",
        model: null,
        apiKey: null,
        apiUrl,
        temperature: resolvedTemperature
      },
      warnings
    };
  }

  if (provider !== "rule-based" && apiKey) {
    return {
      config: {
        provider,
        model,
        apiKey,
        apiUrl,
        temperature: resolvedTemperature
      },
      warnings
    };
  }

  return {
    config: {
      provider: "rule-based",
      model: null,
      apiKey: null,
      apiUrl,
      temperature: resolvedTemperature
    },
    warnings
  };
}

function extractJson(content: string): Record<string, unknown> {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? content).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("JSON payload not found in model response.");
  }

  return asRecord(JSON.parse(candidate.slice(start, end + 1)));
}

async function callAiJson<T>(config: ResolvedPipelineConfig, system: string, user: string): Promise<T> {
  if (!config.apiKey || !config.model) {
    throw new Error("AI configuration is incomplete.");
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${config.apiKey}`
  };

  if (config.apiUrl.includes("models.github.ai")) {
    headers.Accept = "application/vnd.github+json";
    headers["X-GitHub-Api-Version"] = "2022-11-28";
  }

  const payload = JSON.stringify({
    model: config.model,
    temperature: config.temperature,
    max_tokens: 2200,
    messages: [
      {
        role: "system",
        content: system
      },
      {
        role: "user",
        content: user
      }
    ]
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers,
        body: payload
      });

      if (response.status === 429 || response.status >= 500) {
        const detail = await response.text();
        lastError = new Error(`AI request failed (${response.status}): ${detail}`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(60_000, 5_000 * 2 ** (attempt - 1))));
        continue;
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`AI request failed (${response.status}): ${detail}`);
      }

      const parsed = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: unknown;
          };
        }>;
      };
      const content = unwrapContent(parsed.choices?.[0]?.message?.content).trim();

      if (!content) {
        throw new Error("AI response content was empty.");
      }

      return extractJson(content) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === 5) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.min(30_000, 3_000 * attempt)));
    }
  }

  throw lastError ?? new Error("AI request exhausted retries without a response.");
}

function parseNewsEditorOutput(value: unknown, preferences: UserResearchPreferences): NewsEditorOutput {
  const record = asRecord(value);
  const allowedSectors = new Set(preferences.sectors);

  return {
    headlineId: asString(record.headlineId) || null,
    headlineSummary: asString(record.headlineSummary),
    whyImportant: asString(record.whyImportant),
    derived: Array.isArray(record.derived)
      ? record.derived
          .map((item) => {
            const entry = asRecord(item);
            const newsId = asString(entry.newsId);
            const whyImportant = asString(entry.whyImportant);

            if (!newsId || !whyImportant) {
              return null;
            }

            return { newsId, whyImportant } satisfies NewsEditorDerivedSelection;
          })
          .filter((item): item is NewsEditorDerivedSelection => Boolean(item))
          .slice(0, 3)
      : [],
    sectorIssues: Array.isArray(record.sectorIssues)
      ? record.sectorIssues
          .map((item) => {
            const entry = asRecord(item);
            const sectorTag = asString(entry.sectorTag) as ResearchSectorTag;
            const newsId = asString(entry.newsId);
            const whyImportant = asString(entry.whyImportant);

            if (!allowedSectors.has(sectorTag) || !newsId || !whyImportant) {
              return null;
            }

            return { sectorTag, newsId, whyImportant } satisfies NewsEditorSectorSelection;
          })
          .filter((item): item is NewsEditorSectorSelection => Boolean(item))
      : [],
    editorMessage: asString(record.editorMessage),
    handoffNote: asString(record.handoffNote)
  };
}

function parseMacroAnalystOutput(value: unknown): MacroAnalystOutput {
  const record = asRecord(value);

  return {
    summary: asString(record.summary),
    shortTermView: asString(record.shortTermView),
    mediumTermView: asString(record.mediumTermView),
    strongSectors: asSectorStrengthCalls(record.strongSectors),
    riskSectors: asSectorStrengthCalls(record.riskSectors),
    keyEvents: Array.isArray(record.keyEvents)
      ? record.keyEvents
          .map((item) => {
            const entry = asRecord(item);
            const title = asString(entry.title);
            const reason = asString(entry.reason);

            if (!title || !reason) {
              return null;
            }

            return { title, reason };
          })
          .filter((item): item is MarketInterpretation["keyEvents"][number] => Boolean(item))
          .slice(0, 3)
      : [],
    analystMessage: asString(record.analystMessage),
    handoffNote: asString(record.handoffNote)
  };
}

function parseTickerAnalystOutput(value: unknown): TickerAnalystOutput {
  const record = asRecord(value);

  return {
    leadTicker: asString(record.leadTicker) || null,
    analyses: Array.isArray(record.analyses)
      ? record.analyses
          .map((item) => {
            const entry = asRecord(item);
            const ticker = asString(entry.ticker);
            const summary = asString(entry.summary);
            const technicalAnalysis = asString(entry.technicalAnalysis);
            const marketContext = asString(entry.marketContext);
            const recommendation = asString(entry.recommendation);

            if (!ticker || !summary || !technicalAnalysis || !marketContext || !recommendation) {
              return null;
            }

            return {
              ticker,
              summary,
              technicalAnalysis,
              patternAnalysis: asPatternAnalysis(entry.patternAnalysis),
              marketContext,
              recommendation
            } satisfies TickerAnalystStageOutput;
          })
          .filter((item): item is TickerAnalystStageOutput => Boolean(item))
      : [],
    analystMessage: asString(record.analystMessage),
    handoffNote: asString(record.handoffNote)
  };
}

function parseExecutionTraderOutput(value: unknown): ExecutionTraderOutput {
  const record = asRecord(value);

  return {
    strategy: asString(record.strategy),
    recommendedActions: asStringArray(record.recommendedActions, 4),
    avoidActions: asStringArray(record.avoidActions, 3),
    risks: asStringArray(record.risks, 3),
    traderMessage: asString(record.traderMessage)
  };
}

function cloneNewsItem(item: ResearchNewsItem, override?: Partial<Pick<ResearchNewsItem, "summary" | "analysis">>): ResearchNewsItem {
  return {
    ...item,
    summary: override?.summary ?? item.summary,
    analysis: override?.analysis ?? item.analysis
  };
}

function buildNewsBoardFromSelection(baseWorkspace: ResearchWorkspaceData, newsOutput: NewsEditorOutput): ResearchNewsBoard {
  const candidates = getCandidateNews(baseWorkspace);
  const newsById = new Map(candidates.map((item) => [item.id, item]));
  const derivedById = new Map(newsOutput.derived.map((item) => [item.newsId, item.whyImportant]));
  const sectorByKey = new Map(newsOutput.sectorIssues.map((item) => [item.sectorTag, item]));
  const selectedHeadline = newsOutput.headlineId ? newsById.get(newsOutput.headlineId) : undefined;
  const fallbackHeadline = baseWorkspace.news.headline ?? candidates[0] ?? null;
  const headlineBase = selectedHeadline ?? fallbackHeadline;
  const headline = headlineBase
    ? cloneNewsItem(headlineBase, {
        summary: newsOutput.headlineSummary || headlineBase.summary,
        analysis: newsOutput.whyImportant || headlineBase.analysis
      })
    : null;
  const derivedArticles = newsOutput.derived
    .map((item) => newsById.get(item.newsId))
    .filter((item): item is ResearchNewsItem => Boolean(item))
    .filter((item) => item.id !== headline?.id)
    .slice(0, 3)
    .map((item) => cloneNewsItem(item, { analysis: derivedById.get(item.id) ?? item.analysis }));
  const fallbackDerived = baseWorkspace.news.derivedArticles
    .filter((item) => item.id !== headline?.id)
    .slice(0, 3)
    .map((item) => cloneNewsItem(item, { analysis: derivedById.get(item.id) ?? item.analysis }));

  const sectorIssues = baseWorkspace.preferences.sectors
    .map((sectorTag) => {
      const selected = sectorByKey.get(sectorTag);
      const item =
        (selected ? newsById.get(selected.newsId) : undefined) ??
        candidates.find((candidate) => candidate.sectorTag === sectorTag && candidate.id !== headline?.id) ??
        candidates.find((candidate) => candidate.sectorTag === sectorTag);

      if (!item) {
        return null;
      }

      return {
        sectorTag,
        sectorLabel: getResearchSectorLabel(sectorTag),
        item: cloneNewsItem(item, { analysis: selected?.whyImportant ?? item.analysis })
      } satisfies ResearchSectorIssue;
    })
    .filter((item): item is ResearchSectorIssue => Boolean(item));

  return {
    headline,
    derivedArticles: derivedArticles.length > 0 ? derivedArticles : fallbackDerived,
    sectorIssues
  };
}

function mergeTickerAnalyses(baseAnalyses: TickerAnalysis[], output: TickerAnalystOutput): TickerAnalysis[] {
  const overrides = new Map(output.analyses.map((item) => [item.ticker, item]));

  return baseAnalyses.map((analysis) => {
    const override = overrides.get(analysis.ticker);

    if (!override) {
      return analysis;
    }

    return {
      ...analysis,
      summary: override.summary,
      technicalAnalysis: override.technicalAnalysis,
      patternAnalysis: override.patternAnalysis.length > 0 ? override.patternAnalysis : analysis.patternAnalysis,
      marketContext: override.marketContext,
      recommendation: override.recommendation
    };
  });
}

function buildMarketInterpretation(baseWorkspace: ResearchWorkspaceData, output: MacroAnalystOutput): MarketInterpretation {
  return {
    summary: output.summary || baseWorkspace.agentPipeline.market.summary,
    shortTermView: output.shortTermView || baseWorkspace.agentPipeline.market.shortTermView,
    mediumTermView: output.mediumTermView || baseWorkspace.agentPipeline.market.mediumTermView,
    strongSectors: output.strongSectors.length > 0 ? output.strongSectors : baseWorkspace.agentPipeline.market.strongSectors,
    riskSectors: output.riskSectors.length > 0 ? output.riskSectors : baseWorkspace.agentPipeline.market.riskSectors,
    keyEvents: output.keyEvents.length > 0 ? output.keyEvents : baseWorkspace.agentPipeline.market.keyEvents
  };
}

function buildActionPlan(baseWorkspace: ResearchWorkspaceData, output: ExecutionTraderOutput): TraderActionPlan {
  return {
    strategy: output.strategy || baseWorkspace.agentPipeline.actionPlan.strategy,
    recommendedActions: output.recommendedActions.length > 0 ? output.recommendedActions : baseWorkspace.agentPipeline.actionPlan.recommendedActions,
    avoidActions: output.avoidActions.length > 0 ? output.avoidActions : baseWorkspace.agentPipeline.actionPlan.avoidActions,
    risks: output.risks.length > 0 ? output.risks : baseWorkspace.agentPipeline.actionPlan.risks
  };
}

function buildPipelineSteps(
  definitions: ResearchAgentPipeline["definitions"],
  news: ResearchNewsBoard,
  market: MarketInterpretation,
  analyses: TickerAnalysis[],
  newsOutput: NewsEditorOutput,
  macroOutput: MacroAnalystOutput,
  tickerOutput: TickerAnalystOutput,
  actionPlan: TraderActionPlan,
  actionOutput: ExecutionTraderOutput
): ResearchPipelineStep[] {
  const newsEditor = definitions.find((definition) => definition.id === "news-editor") as ResearchPipelineAgentDefinition;
  const macroAnalyst = definitions.find((definition) => definition.id === "macro-analyst") as ResearchPipelineAgentDefinition;
  const tickerAnalyst = definitions.find((definition) => definition.id === "ticker-analyst") as ResearchPipelineAgentDefinition;
  const executionTrader = definitions.find((definition) => definition.id === "execution-trader") as ResearchPipelineAgentDefinition;
  const headline = news.headline;
  const leadTicker = analyses.find((analysis) => analysis.ticker === (tickerOutput.leadTicker ?? "")) ?? analyses[0] ?? null;

  return [
    {
      id: "news-editor",
      stage: "news",
      name: newsEditor.name,
      roleLabel: newsEditor.roleLabel,
      objective: newsEditor.objective,
      summary: newsOutput.editorMessage || (headline ? `${headline.title}를 메인 헤드라인으로 선정했습니다.` : "핵심 뉴스 선정을 보류했습니다."),
      outputLines: [
        headline ? `메인 헤드라인: ${headline.title}` : "메인 헤드라인 없음",
        ...(newsOutput.derived.length > 0
          ? newsOutput.derived.map((item) => {
              const selected = news.derivedArticles.find((article) => article.id === item.newsId);
              return `파생 뉴스: ${selected?.title ?? item.newsId} / ${item.whyImportant}`;
            })
          : news.derivedArticles.map((item) => `파생 뉴스: ${item.title}`)),
        ...news.sectorIssues.map((issue) => `${issue.sectorLabel}: ${issue.item.analysis}`)
      ],
      handoffNote: newsOutput.handoffNote || "이 출력은 시황 해석 에이전트의 입력으로 넘어갑니다.",
      references: dedupeNews([headline, ...news.derivedArticles]).map((item) => item.id)
    },
    {
      id: "macro-analyst",
      stage: "macro",
      name: macroAnalyst.name,
      roleLabel: macroAnalyst.roleLabel,
      objective: macroAnalyst.objective,
      summary: macroOutput.analystMessage || market.summary,
      outputLines: [
        `시장 한 줄 요약: ${market.summary}`,
        `단기: ${market.shortTermView}`,
        `중기: ${market.mediumTermView}`
      ],
      handoffNote: macroOutput.handoffNote || "이 해석은 티커 딥분석과 행동 제안 에이전트의 공통 컨텍스트가 됩니다.",
      references: [headline?.id, ...news.sectorIssues.map((issue) => issue.item.id)].filter((value): value is string => Boolean(value))
    },
    {
      id: "ticker-analyst",
      stage: "ticker",
      name: tickerAnalyst.name,
      roleLabel: tickerAnalyst.roleLabel,
      objective: tickerAnalyst.objective,
      summary: tickerOutput.analystMessage || (leadTicker ? `${leadTicker.ticker}를 대표 분석 티커로 해석했습니다.` : "대표 티커 분석을 보류했습니다."),
      outputLines: leadTicker
        ? [
            `요약: ${leadTicker.summary}`,
            `기술적 상태: ${leadTicker.technicalAnalysis}`,
            `패턴: ${leadTicker.patternAnalysis.map((pattern) => pattern.name).join(", ") || "패턴 없음"}`,
            `시황 연결: ${leadTicker.marketContext}`
          ]
        : ["대표 티커 없음"],
      handoffNote: tickerOutput.handoffNote || "이 출력은 행동 제안 에이전트가 진입/관망/회피 조건을 만드는 기준이 됩니다.",
      references: leadTicker ? [leadTicker.ticker, ...leadTicker.linkedNewsIds] : []
    },
    {
      id: "execution-trader",
      stage: "action",
      name: executionTrader.name,
      roleLabel: executionTrader.roleLabel,
      objective: executionTrader.objective,
      summary: actionOutput.traderMessage || actionPlan.strategy,
      outputLines: [
        `오늘 전략: ${actionPlan.strategy}`,
        ...actionPlan.recommendedActions.map((item) => `추천 행동: ${item}`),
        ...actionPlan.avoidActions.map((item) => `하지 말 것: ${item}`)
      ],
      handoffNote: "이 출력은 사용자에게 보이는 최종 실행 제안입니다.",
      references: [leadTicker?.ticker, ...news.derivedArticles.map((item) => item.id)].filter((value): value is string => Boolean(value))
    }
  ];
}

async function runNewsEditor(config: ResolvedPipelineConfig, workspace: ResearchWorkspaceData): Promise<NewsEditorOutput> {
  const candidates = getCandidateNews(workspace).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    analysis: item.analysis,
    sectorTag: item.sectorTag,
    sectorLabel: getResearchSectorLabel(item.sectorTag),
    tickerTags: item.tickerTags,
    importanceScore: item.importanceScore
  }));

  const response = await callAiJson<NewsEditorOutput>(
    config,
    "당신은 글로벌 금융시장 뉴스 편집자다. 가격 영향이 있는 뉴스만 선택하고 반드시 JSON만 반환한다.",
    [
      `사용자 관심 섹터: ${workspace.preferences.sectors.map(getResearchSectorLabel).join(", ")}`,
      "후보 뉴스:",
      JSON.stringify(candidates, null, 2),
      "",
      "반드시 아래 스키마로만 답하라.",
      JSON.stringify(
        {
          headlineId: "string | null",
          headlineSummary: "string",
          whyImportant: "string",
          derived: [{ newsId: "string", whyImportant: "string" }],
          sectorIssues: [{ sectorTag: "semiconductors", newsId: "string", whyImportant: "string" }],
          editorMessage: "string",
          handoffNote: "string"
        },
        null,
        2
      )
    ].join("\n")
  );

  return parseNewsEditorOutput(response, workspace.preferences);
}

async function runMacroAnalyst(config: ResolvedPipelineConfig, workspace: ResearchWorkspaceData, news: ResearchNewsBoard): Promise<MacroAnalystOutput> {
  const payload = {
    headline: news.headline
      ? {
          title: news.headline.title,
          summary: news.headline.summary,
          analysis: news.headline.analysis,
          recommendation: news.headline.recommendation
        }
      : null,
    derived: news.derivedArticles.map((item) => ({
      title: item.title,
      summary: item.summary,
      analysis: item.analysis,
      recommendation: item.recommendation
    })),
    sectorIssues: news.sectorIssues.map((issue) => ({
      sector: issue.sectorLabel,
      title: issue.item.title,
      analysis: issue.item.analysis
    }))
  };

  const response = await callAiJson<MacroAnalystOutput>(
    config,
    "당신은 글로벌 매크로 시장 분석가다. 뉴스를 반복하지 말고 시장 해석만 JSON으로 반환한다.",
    [
      `사용자 관심 섹터: ${workspace.preferences.sectors.map(getResearchSectorLabel).join(", ")}`,
      JSON.stringify(payload, null, 2),
      "",
      "반드시 아래 스키마로만 답하라.",
      JSON.stringify(
        {
          summary: "string",
          shortTermView: "string",
          mediumTermView: "string",
          strongSectors: [{ sector: "string", horizon: "단기", reason: "string" }],
          riskSectors: [{ sector: "string", horizon: "중기", reason: "string" }],
          keyEvents: [{ title: "string", reason: "string" }],
          analystMessage: "string",
          handoffNote: "string"
        },
        null,
        2
      )
    ].join("\n")
  );

  return parseMacroAnalystOutput(response);
}

async function runTickerAnalyst(
  config: ResolvedPipelineConfig,
  workspace: ResearchWorkspaceData,
  market: MarketInterpretation,
  news: ResearchNewsBoard
): Promise<TickerAnalystOutput> {
  const payload = {
    market,
    news: {
      headline: news.headline?.title ?? null,
      derived: news.derivedArticles.map((item) => item.title)
    },
    tickers: workspace.tickerAnalyses.map((analysis) => ({
      ticker: analysis.ticker,
      company: analysis.company,
      summary: analysis.summary,
      technicalAnalysis: analysis.technicalAnalysis,
      patternAnalysis: analysis.patternAnalysis,
      marketContext: analysis.marketContext,
      recommendation: analysis.recommendation
    }))
  };

  const response = await callAiJson<TickerAnalystOutput>(
    config,
    "당신은 전문 트레이더이자 기술적 분석가다. 지표를 단순 나열하지 말고 해석 중심 JSON만 반환한다.",
    [
      JSON.stringify(payload, null, 2),
      "",
      "반드시 아래 스키마로만 답하라.",
      JSON.stringify(
        {
          leadTicker: "string | null",
          analyses: [
            {
              ticker: "string",
              summary: "string",
              technicalAnalysis: "string",
              patternAnalysis: [{ name: "string", detail: "string", confidence: "high" }],
              marketContext: "string",
              recommendation: "string"
            }
          ],
          analystMessage: "string",
          handoffNote: "string"
        },
        null,
        2
      )
    ].join("\n")
  );

  return parseTickerAnalystOutput(response);
}

async function runExecutionTrader(
  config: ResolvedPipelineConfig,
  market: MarketInterpretation,
  analyses: TickerAnalysis[],
  news: ResearchNewsBoard
): Promise<ExecutionTraderOutput> {
  const payload = {
    market,
    headline: news.headline
      ? {
          title: news.headline.title,
          analysis: news.headline.analysis
        }
      : null,
    tickers: analyses.map((analysis) => ({
      ticker: analysis.ticker,
      summary: analysis.summary,
      recommendation: analysis.recommendation
    }))
  };

  const response = await callAiJson<ExecutionTraderOutput>(
    config,
    "당신은 기관 트레이더다. 실제 실행 가능한 행동 제안만 JSON으로 반환한다.",
    [
      JSON.stringify(payload, null, 2),
      "",
      "반드시 아래 스키마로만 답하라.",
      JSON.stringify(
        {
          strategy: "string",
          recommendedActions: ["string"],
          avoidActions: ["string"],
          risks: ["string"],
          traderMessage: "string"
        },
        null,
        2
      )
    ].join("\n")
  );

  return parseExecutionTraderOutput(response);
}

export async function generateResearchPipelineSnapshot(options: GenerateResearchPipelineOptions = {}): Promise<GeneratedResearchSnapshot> {
  const normalizedPreferences = normalizeResearchPreferences(options.preferences);
  const baseWorkspace = buildResearchWorkspace(normalizedPreferences);
  const { config, warnings } = resolvePipelineConfig(options);

  if (config.provider === "rule-based") {
    return buildFallbackSnapshot(baseWorkspace, config, options, warnings);
  }

  try {
    const newsOutput = await runNewsEditor(config, baseWorkspace);
    const news = buildNewsBoardFromSelection(baseWorkspace, newsOutput);
    const macroOutput = await runMacroAnalyst(config, baseWorkspace, news);
    const market = buildMarketInterpretation(baseWorkspace, macroOutput);
    const tickerOutput = await runTickerAnalyst(config, baseWorkspace, market, news);
    const tickerAnalyses = mergeTickerAnalyses(baseWorkspace.tickerAnalyses, tickerOutput);
    const actionOutput = await runExecutionTrader(config, market, tickerAnalyses, news);
    const actionPlan = buildActionPlan(baseWorkspace, actionOutput);
    const generatedAt = new Date().toISOString();
    const steps = buildPipelineSteps(baseWorkspace.agentPipeline.definitions, news, market, tickerAnalyses, newsOutput, macroOutput, tickerOutput, actionPlan, actionOutput);
    const runtime = buildRuntime(steps, generatedAt, {
      runId: `${config.provider}-${generatedAt}`,
      provider: config.provider,
      model: config.model,
      source: options.source ?? "local-script",
      status: "completed",
      artifactPath: options.artifactPath ?? null
    });
    const agentPipeline: ResearchAgentPipeline = {
      definitions: baseWorkspace.agentPipeline.definitions,
      steps,
      market,
      actionPlan,
      runtime
    };
    const workspace: ResearchWorkspaceData = {
      ...baseWorkspace,
      generatedAt,
      news,
      tickerAnalyses,
      agentPipeline,
      productReview: buildResearchProductReview(agentPipeline, baseWorkspace.userBehavior, normalizedPreferences, tickerAnalyses),
      meeting: baseWorkspace.meeting,
      newsletter: buildResearchNewsletter(news, tickerAnalyses, generatedAt)
    };

    workspace.meeting = buildResearchMeetingThread(workspace.agentPipeline, workspace.productReview, workspace.news, workspace.tickerAnalyses);
    workspace.agentPipeline.runtime.summaryMarkdown = renderResearchPipelineMarkdown({
      generatedAt: workspace.generatedAt,
      preferences: workspace.preferences,
      news: workspace.news,
      tickerAnalyses: workspace.tickerAnalyses,
      agentPipeline: workspace.agentPipeline
    });

    return {
      workspace,
      markdown: workspace.agentPipeline.runtime.summaryMarkdown,
      warnings
    };
  } catch (error) {
    return buildFallbackSnapshot(baseWorkspace, config, options, [
      ...warnings,
      error instanceof Error ? `AI 파이프라인 실행 실패: ${error.message}` : "AI 파이프라인 실행에 실패했습니다."
    ]);
  }
}
