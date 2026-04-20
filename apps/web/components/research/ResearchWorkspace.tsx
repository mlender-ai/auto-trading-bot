"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import {
  buildResearchWorkspace,
  formatResearchDateTime,
  getResearchSectorLabel,
  normalizeResearchPreferences,
  researchTickerOptions,
  type PatternConfidence,
  type ProductReviewNote,
  type ProductImplementationStatus,
  type ResearchNewsItem,
  type ResearchPipelineStep,
  type ResearchPipelineTranscriptMessage,
  type ResearchPriority,
  type ResearchSectorTag,
  type ResearchTab,
  type ResearchWorkspaceData,
  type TickerAnalysis,
  type UserResearchPreferences
} from "@trading/shared/src/research";
import type { GeneratedResearchSnapshot } from "@trading/shared/src/researchPipeline";

const STORAGE_KEY = "research-preferences-v1";
const DEFAULT_NEWS_IMAGE = "/news/default-cover.svg";

function toggleStringValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function getPriorityLabel(priority: ResearchPriority) {
  switch (priority) {
    case "critical":
      return "최우선";
    case "focus":
      return "핵심";
    default:
      return "관찰";
  }
}

function getConfidenceLabel(confidence: PatternConfidence) {
  switch (confidence) {
    case "high":
      return "높음";
    case "medium":
      return "보통";
    default:
      return "낮음";
  }
}

function getImplementationStatusLabel(status: ProductImplementationStatus) {
  switch (status) {
    case "ready":
      return "구현 준비";
    case "in-progress":
      return "구현 중";
    case "reviewing":
      return "리뷰 중";
    case "merged":
      return "반영 완료";
    default:
      return "대기";
  }
}

function compactCopy(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function buildNewsLookup(workspace: ResearchWorkspaceData, supplementalNews: ResearchNewsItem[] = []) {
  const entries = [
    ...supplementalNews,
    workspace.news.headline,
    ...workspace.news.derivedArticles,
    ...workspace.news.sectorIssues.map((issue) => issue.item)
  ].filter((item): item is ResearchNewsItem => Boolean(item));

  return new Map(entries.map((item) => [item.id, item]));
}

function NewsVisual({ item, variant = "card" }: { item: ResearchNewsItem; variant?: "hero" | "card" | "mini" }) {
  return (
    <div className={`news-visual ${variant}`}>
      <img alt={item.title} src={item.imageUrl ?? DEFAULT_NEWS_IMAGE} />
      <div className="news-visual-overlay">
        <span>{getResearchSectorLabel(item.sectorTag)}</span>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: ResearchNewsItem }) {
  return (
    <article className="story-card">
      <NewsVisual item={item} variant="card" />
      <div className="story-copy">
        <div className="story-meta">
          <span className={`priority-pill priority-${item.priority}`}>{getPriorityLabel(item.priority)}</span>
          <span>{item.source}</span>
          <span>{formatResearchDateTime(item.publishedAt)}</span>
          <span className="story-score">{item.importanceScore}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="story-summary">{compactCopy(item.summary, 110)}</p>
        <div className="story-points">
          <p>
            <strong>핵심</strong>
            {compactCopy(item.analysis, 132)}
          </p>
          <p>
            <strong>행동</strong>
            {compactCopy(item.recommendation, 132)}
          </p>
        </div>
        <p className="story-linked-tickers">관련 티커 {item.tickerTags.join(" · ")}</p>
        {item.sourceUrl ? (
          <a className="story-source-link" href={item.sourceUrl} rel="noreferrer" target="_blank">
            원문 보기
          </a>
        ) : null}
      </div>
    </article>
  );
}

function PipelineStepCard({ step, order }: { step: ResearchPipelineStep; order: number }) {
  return (
    <article className="pipeline-card">
      <div className="pipeline-card-head">
        <div className="pipeline-meta">
          <span className="pipeline-order">0{order}</span>
          <div>
            <span className="eyebrow">{step.roleLabel}</span>
            <h3>{step.name}</h3>
          </div>
        </div>
        <span className="subtle-chip">{step.stage}</span>
      </div>
      <p className="pipeline-summary">{step.summary}</p>
      <ul className="pipeline-output-list">
        {step.outputLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="pipeline-handoff">{step.handoffNote}</p>
    </article>
  );
}

function ReviewNoteCard({ note }: { note: ProductReviewNote }) {
  return (
    <article className="review-card">
      <div className="review-card-head">
        <span className={`role-pill role-${note.role.toLowerCase()}`}>{note.role}</span>
        <strong>{note.title}</strong>
      </div>
      <ul className="review-list">
        {note.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {note.references.length > 0 ? <p className="review-references">참조 {note.references.join(" · ")}</p> : null}
    </article>
  );
}

function TranscriptMessageCard({ message, isLast }: { message: ResearchPipelineTranscriptMessage; isLast: boolean }) {
  return (
    <div className={`meeting-row ${isLast ? "last" : ""}`}>
      <div className="meeting-marker">
        <span className="eyebrow">{message.roleLabel}</span>
      </div>
      <article className="meeting-bubble section-panel">
        <div className="meeting-meta">
          <strong>{message.author}</strong>
          <span>{message.audience}</span>
        </div>
        <p>{message.summary}</p>
        <p>{message.text}</p>
        {message.references.length > 0 ? <p className="review-references">참조 {message.references.join(" · ")}</p> : null}
      </article>
    </div>
  );
}

export function ResearchWorkspace({ initialData }: { initialData: ResearchWorkspaceData }) {
  const [activeTab, setActiveTab] = useState<ResearchTab>("news");
  const [preferences, setPreferences] = useState<UserResearchPreferences>(initialData.preferences);
  const [workspace, setWorkspace] = useState<ResearchWorkspaceData>(initialData);
  const [selectedTicker, setSelectedTicker] = useState(initialData.focusedTickers[0] ?? "");
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isRefreshingWorkspace, setIsRefreshingWorkspace] = useState(false);
  const [isAnalyzingTicker, setIsAnalyzingTicker] = useState(false);
  const [customTickerInput, setCustomTickerInput] = useState("");
  const [customTickerSector, setCustomTickerSector] = useState<ResearchSectorTag>(initialData.preferences.sectors[0] ?? "semiconductors");
  const [supplementalNews, setSupplementalNews] = useState<ResearchNewsItem[]>([]);
  const [tickerNotice, setTickerNotice] = useState<string | null>(null);
  const [pipelineNotice, setPipelineNotice] = useState<string | null>(null);
  const relatedNewsLookup = useMemo(() => buildNewsLookup(workspace, supplementalNews), [workspace, supplementalNews]);
  const activeAnalysis = useMemo(
    () => workspace.tickerAnalyses.find((analysis) => analysis.ticker === selectedTicker) ?? workspace.tickerAnalyses[0] ?? null,
    [selectedTicker, workspace.tickerAnalyses]
  );
  const newsletterHref = useMemo(() => {
    const params = new URLSearchParams();

    if (preferences.sectors.length > 0) {
      params.set("sectors", preferences.sectors.join(","));
    }

    if (preferences.tickers.length > 0) {
      params.set("tickers", preferences.tickers.join(","));
    }

    const query = params.toString();
    return query ? `/api/newsletter/daily?${query}` : "/api/newsletter/daily";
  }, [preferences]);
  const pipelineHref = useMemo(() => {
    const params = new URLSearchParams();

    if (preferences.sectors.length > 0) {
      params.set("sectors", preferences.sectors.join(","));
    }

    if (preferences.tickers.length > 0) {
      params.set("tickers", preferences.tickers.join(","));
    }

    const query = params.toString();
    return query ? `/api/research/pipeline?${query}` : "/api/research/pipeline";
  }, [preferences]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<UserResearchPreferences>;
      const nextPreferences = normalizeResearchPreferences(parsed);

      startTransition(() => {
        setPreferences(nextPreferences);
        setWorkspace(buildResearchWorkspace(nextPreferences));
      });

      void refreshWorkspace(nextPreferences);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (workspace.tickerAnalyses.some((analysis) => analysis.ticker === selectedTicker)) {
      return;
    }

    setSelectedTicker(workspace.tickerAnalyses[0]?.ticker ?? "");
  }, [selectedTicker, workspace.tickerAnalyses]);

  useEffect(() => {
    if (preferences.sectors.includes(customTickerSector)) {
      return;
    }

    setCustomTickerSector(preferences.sectors[0] ?? "semiconductors");
  }, [customTickerSector, preferences.sectors]);

  async function refreshWorkspace(nextPreferences: UserResearchPreferences) {
    const normalized = normalizeResearchPreferences(nextPreferences);
    const params = new URLSearchParams();

    if (normalized.sectors.length > 0) {
      params.set("sectors", normalized.sectors.join(","));
    }

    if (normalized.tickers.length > 0) {
      params.set("tickers", normalized.tickers.join(","));
    }

    startTransition(() => {
      setPreferences(normalized);
      setWorkspace(buildResearchWorkspace(normalized));
    });
    setSupplementalNews([]);
    setTickerNotice(null);

    setIsRefreshingWorkspace(true);

    try {
      const href = params.toString() ? `/api/research/pipeline?${params.toString()}` : "/api/research/pipeline";
      const response = await fetch(href, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Workspace request failed with ${response.status}`);
      }

      const payload = (await response.json()) as GeneratedResearchSnapshot;

      startTransition(() => {
        setWorkspace(payload.workspace);
        setPreferences(payload.workspace.preferences);
        setSelectedTicker((current) => (payload.workspace.tickerAnalyses.some((analysis) => analysis.ticker === current) ? current : payload.workspace.focusedTickers[0] ?? ""));
      });
      setSupplementalNews([]);

      setPipelineNotice(payload.warnings.length > 0 ? payload.warnings.join(" ") : "실데이터 기준으로 화면을 새로고침했습니다.");
    } catch (error) {
      setPipelineNotice(error instanceof Error ? error.message : "실데이터 불러오기에 실패했습니다.");
    } finally {
      setIsRefreshingWorkspace(false);
    }
  }

  async function handleAnalyzeTicker() {
    const ticker = customTickerInput.trim().toUpperCase();

    if (!ticker) {
      setTickerNotice("티커를 입력해 주세요.");
      return;
    }

    setIsAnalyzingTicker(true);
    setTickerNotice(`${ticker} 라이브 분석을 불러오는 중입니다.`);

    try {
      const response = await fetch("/api/research/ticker", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ticker,
          sectorTag: customTickerSector,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`Ticker analysis request failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        analysis: TickerAnalysis | null;
        relatedNews: ResearchNewsItem[];
        warnings: string[];
      };

      if (!payload.analysis) {
        setTickerNotice(payload.warnings.join(" ") || `${ticker} 분석을 만들 수 없었습니다.`);
        return;
      }

      const nextAnalysis = payload.analysis;

      startTransition(() => {
        setWorkspace((current) => ({
          ...current,
          focusedTickers: [nextAnalysis.ticker, ...current.focusedTickers.filter((item) => item !== nextAnalysis.ticker)],
          tickerAnalyses: [nextAnalysis, ...current.tickerAnalyses.filter((item) => item.ticker !== nextAnalysis.ticker)]
        }));
        setSelectedTicker(nextAnalysis.ticker);
      });
      setSupplementalNews((current) => {
        const merged = [...payload.relatedNews, ...current];
        return Array.from(new Map(merged.map((item) => [item.id, item])).values());
      });
      setTickerNotice(payload.warnings.length > 0 ? payload.warnings.join(" ") : `${ticker} 실데이터 분석으로 업데이트했습니다.`);
    } catch (error) {
      setTickerNotice(error instanceof Error ? error.message : "티커 분석 요청에 실패했습니다.");
    } finally {
      setIsAnalyzingTicker(false);
    }
  }

  function handleToggleSector(sector: ResearchSectorTag) {
    const nextSectors = toggleStringValue(preferences.sectors, sector) as ResearchSectorTag[];

    if (nextSectors.length === 0) {
      return;
    }

    const nextTickers = preferences.tickers.filter((ticker) => {
      const option = researchTickerOptions.find((candidate) => candidate.ticker === ticker);
      return option ? nextSectors.includes(option.sectorTag) : false;
    });

    void refreshWorkspace({
      sectors: nextSectors,
      tickers: nextTickers
    });
  }

  function handleToggleTicker(ticker: string) {
    void refreshWorkspace({
      sectors: preferences.sectors,
      tickers: toggleStringValue(preferences.tickers, ticker)
    });
  }

  async function handleRunPipeline() {
    setIsRunningPipeline(true);
    setPipelineNotice("AI 파이프라인을 실행 중입니다.");

    try {
      const response = await fetch("/api/research/pipeline", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline request failed with ${response.status}`);
      }

      const payload = (await response.json()) as GeneratedResearchSnapshot;

      startTransition(() => {
        setWorkspace(payload.workspace);
        setPreferences(payload.workspace.preferences);
        setSelectedTicker(payload.workspace.focusedTickers[0] ?? "");
        setActiveTab("meeting");
      });

      setPipelineNotice(
        payload.warnings.length > 0
          ? payload.warnings.join(" ")
          : `${payload.workspace.agentPipeline.runtime.provider} 파이프라인 결과로 업데이트했습니다.`
      );
    } catch (error) {
      setPipelineNotice(error instanceof Error ? error.message : "AI 파이프라인 실행에 실패했습니다.");
    } finally {
      setIsRunningPipeline(false);
    }
  }

  return (
    <main className="research-app">
      <header className="research-masthead">
        <div className="masthead-copy">
          <div className="masthead-meta">
            <span className="section-kicker">Market Brief</span>
            <span className="masthead-updated">업데이트 {formatResearchDateTime(workspace.generatedAt)}</span>
          </div>
          <h1>뉴스는 적게, 판단은 깊게.</h1>
          <p className="masthead-summary">
            중요한 기사만 먼저 읽고, 바로 이어서 분석과 행동 제안을 확인할 수 있도록 화면을 다시 정리했습니다. 시선이 흩어지지 않게 위계와 여백을 크게 가져간 구성이 핵심입니다.
          </p>
        </div>

        <div className="masthead-panel">
          <div className="masthead-stat">
            <span>선택 섹터</span>
            <strong>{workspace.preferences.sectors.length}</strong>
          </div>
          <div className="masthead-stat">
            <span>집중 티커</span>
            <strong>{workspace.focusedTickers.length}</strong>
          </div>
          <div className="masthead-stat">
            <span>다음 브리프</span>
            <strong>{formatResearchDateTime(workspace.newsletter.nextRunAt)}</strong>
          </div>
        </div>
      </header>

      <section className="research-toolbar">
        <div className="research-tabs" role="tablist" aria-label="리서치 탭">
          {[
            { id: "news", label: "뉴스" },
            { id: "signals", label: "티커 분석" },
            { id: "meeting", label: "에이전트 회의" }
          ].map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ResearchTab)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <span className="eyebrow">관심 섹터</span>
            <div className="chip-row">
              {workspace.availableSectors.map((sector) => (
                <button
                  className={`filter-chip ${preferences.sectors.includes(sector.id) ? "active" : ""}`}
                  key={sector.id}
                  onClick={() => handleToggleSector(sector.id)}
                  type="button"
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="eyebrow">관심 티커</span>
            <div className="chip-row">
              {workspace.availableTickers.map((ticker) => (
                <button
                  className={`filter-chip ${preferences.tickers.includes(ticker.ticker) ? "active" : ""}`}
                  key={ticker.ticker}
                  onClick={() => handleToggleTicker(ticker.ticker)}
                  type="button"
                >
                  {ticker.ticker}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="research-layout">
        <section className="research-main">
          {activeTab === "news" ? (
            <NewsTab workspace={workspace} />
          ) : null}

          {activeTab === "signals" ? (
            <SignalsTab
              analysis={activeAnalysis}
              customTickerInput={customTickerInput}
              customTickerSector={customTickerSector}
              isAnalyzingTicker={isAnalyzingTicker}
              newsLookup={relatedNewsLookup}
              onAnalyzeTicker={handleAnalyzeTicker}
              onChangeTickerInput={setCustomTickerInput}
              onChangeTickerSector={setCustomTickerSector}
              onSelectTicker={setSelectedTicker}
              tickerNotice={tickerNotice}
              workspace={workspace}
            />
          ) : null}

          {activeTab === "meeting" ? (
            <MeetingTab workspace={workspace} />
          ) : null}
        </section>

        <aside className="research-rail">
          <article className="rail-card">
            <span className="section-kicker">Selection Rule</span>
            <h2>화면 기준</h2>
            <ul className="rail-list">
              <li>importance_score가 높은 뉴스만 남깁니다.</li>
              <li>선택한 섹터와 티커 중심으로만 화면을 구성합니다.</li>
              <li>모든 섹션은 뉴스 다음에 행동 제안이 따라오게 설계했습니다.</li>
            </ul>
          </article>

          <article className="rail-card">
            <span className="section-kicker">Newsletter</span>
            <h2>{workspace.newsletter.subject}</h2>
            <p>{workspace.newsletter.previewText}</p>
            <a className="api-link" href={newsletterHref}>
              뉴스레터 JSON 보기
            </a>
          </article>

          <article className="rail-card">
            <span className="section-kicker">Pipeline Runtime</span>
            <h2>{workspace.agentPipeline.runtime.provider === "openai" ? "실행된 AI 파이프라인" : "실데이터 파이프라인"}</h2>
            <p>
              {workspace.agentPipeline.runtime.provider.toUpperCase()} · {workspace.agentPipeline.runtime.source} ·{" "}
              {formatResearchDateTime(workspace.agentPipeline.runtime.generatedAt)}
            </p>
            {pipelineNotice ? <p>{pipelineNotice}</p> : null}
            {isRefreshingWorkspace ? <p>실데이터 스냅샷을 불러오는 중입니다.</p> : null}
            <div className="rail-actions">
              <button className="api-button" disabled={isRunningPipeline} onClick={handleRunPipeline} type="button">
                {isRunningPipeline ? "실행 중..." : "AI 파이프라인 실행"}
              </button>
              <a className="api-link" href={pipelineHref}>
                파이프라인 JSON 보기
              </a>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function NewsTab({ workspace }: { workspace: ResearchWorkspaceData }) {
  if (!workspace.news.headline) {
    return (
      <article className="section-panel empty-state">
        <h2>선택한 섹터에 표시할 핵심 뉴스가 없습니다.</h2>
        <p>섹터 필터를 넓히면 헤드라인과 파생 기사가 함께 채워집니다.</p>
      </article>
    );
  }

  const headline = workspace.news.headline;

  return (
    <section className="news-tab">
      <article className="headline-spotlight">
        <NewsVisual item={headline} variant="hero" />
        <div className="headline-copy">
          <div className="story-meta">
            <span className={`priority-pill priority-${headline.priority}`}>{getPriorityLabel(headline.priority)}</span>
            <span>{headline.source}</span>
            <span>{formatResearchDateTime(headline.publishedAt)}</span>
            <span className="story-score">{headline.importanceScore}</span>
          </div>
          <h2>{headline.title}</h2>
          <p className="headline-summary">{headline.summary}</p>
          <div className="headline-notes">
            <div>
              <span className="eyebrow">왜 중요한가</span>
              <p>{headline.analysis}</p>
            </div>
            <div>
              <span className="eyebrow">지금 행동</span>
              <p>{headline.recommendation}</p>
            </div>
          </div>
        </div>
      </article>

      <section className="section-panel brief-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">At A Glance</span>
            <h2>한눈에 보기</h2>
          </div>
          <p>한 번에 다 읽지 않아도 되도록, 지금 판단에 필요한 내용만 세 줄로 압축했습니다.</p>
        </div>
        <div className="brief-list">
          <article className="brief-item">
            <span className="eyebrow">핵심 시그널</span>
            <p>{headline.analysis}</p>
          </article>
          <article className="brief-item">
            <span className="eyebrow">권장 행동</span>
            <p>{headline.recommendation}</p>
          </article>
          <article className="brief-item">
            <span className="eyebrow">관련 티커</span>
            <p>{headline.tickerTags.join(" · ")}</p>
          </article>
        </div>
      </section>

      <section className="section-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Derived</span>
            <h2>파생 기사</h2>
          </div>
          <p>헤드라인 다음으로 봐야 할 기사만 세로 리스트로 이어 붙였습니다.</p>
        </div>
        <div className="story-stack">
          {workspace.news.derivedArticles.map((item) => (
            <NewsCard item={item} key={item.id} />
          ))}
        </div>
      </section>

      <section className="section-panel sector-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Sector Focus</span>
            <h2>섹터별 핵심 이슈</h2>
          </div>
          <p>각 섹터는 제목과 행동 포인트만 빠르게 읽히게 요약했습니다.</p>
        </div>
        <div className="sector-brief-list">
          {workspace.news.sectorIssues.map((issue) => (
            <article className="sector-brief-card" key={issue.sectorTag}>
              <div className="card-headline-meta">
                <span className="subtle-chip">{issue.sectorLabel}</span>
                <span className="story-score">{issue.item.importanceScore}</span>
              </div>
              <strong>{issue.item.title}</strong>
              <p>{compactCopy(issue.item.analysis, 140)}</p>
              <span className="decision-callout">{compactCopy(issue.item.recommendation, 120)}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function SignalsTab({
  analysis,
  customTickerInput,
  customTickerSector,
  isAnalyzingTicker,
  newsLookup,
  onAnalyzeTicker,
  onChangeTickerInput,
  onChangeTickerSector,
  onSelectTicker,
  tickerNotice,
  workspace
}: {
  analysis: TickerAnalysis | null;
  customTickerInput: string;
  customTickerSector: ResearchSectorTag;
  isAnalyzingTicker: boolean;
  newsLookup: Map<string, ResearchNewsItem>;
  onAnalyzeTicker: () => void;
  onChangeTickerInput: (value: string) => void;
  onChangeTickerSector: (value: ResearchSectorTag) => void;
  onSelectTicker: (ticker: string) => void;
  tickerNotice: string | null;
  workspace: ResearchWorkspaceData;
}) {
  if (!analysis) {
    return (
      <article className="section-panel empty-state">
        <h2>선택된 티커가 없습니다.</h2>
        <p>관심 티커를 추가하거나 섹터 대표주 자동 선택을 사용해 주세요.</p>
      </article>
    );
  }

  const relatedNews = analysis.linkedNewsIds.map((id) => newsLookup.get(id)).filter((item): item is ResearchNewsItem => Boolean(item));
  const leadVisual = relatedNews[0] ?? null;

  return (
    <section className="signal-shell">
      <section className="section-panel ticker-search-panel">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Live Search</span>
            <h2>티커 직접 분석</h2>
          </div>
          <p>관심 섹터 안에서 원하는 티커를 바로 넣고 실데이터 분석을 추가할 수 있습니다.</p>
        </div>
        <div className="ticker-search-controls">
          <input
            autoCapitalize="characters"
            className="ticker-search-input"
            onChange={(event) => onChangeTickerInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onAnalyzeTicker();
              }
            }}
            placeholder="예: PLTR, TSM, OXY"
            type="text"
            value={customTickerInput}
          />
          <select className="ticker-search-select" onChange={(event) => onChangeTickerSector(event.target.value as ResearchSectorTag)} value={customTickerSector}>
            {workspace.availableSectors
              .filter((sector) => workspace.preferences.sectors.includes(sector.id))
              .map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.label}
                </option>
              ))}
          </select>
          <button className="api-button" disabled={isAnalyzingTicker} onClick={() => void onAnalyzeTicker()} type="button">
            {isAnalyzingTicker ? "분석 중..." : "티커 분석 추가"}
          </button>
        </div>
        {tickerNotice ? <p className="ticker-search-notice">{tickerNotice}</p> : null}
      </section>

      <section className="section-panel signal-selector">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">Ticker Focus</span>
            <h2>집중 종목</h2>
          </div>
          <p>좌우 비교보다 하나씩 깊게 읽을 수 있도록 종목 선택을 상단으로 올렸습니다.</p>
        </div>
        <div className="signal-selector-list">
          {workspace.tickerAnalyses.map((item) => (
            <button
              className={`signal-nav-item ${analysis.ticker === item.ticker ? "active" : ""}`}
              key={item.ticker}
              onClick={() => onSelectTicker(item.ticker)}
              type="button"
            >
              <div>
                <span className="eyebrow">{getResearchSectorLabel(item.sectorTag)}</span>
                <strong>{item.ticker}</strong>
                <p>{compactCopy(item.summary, 62)}</p>
              </div>
              <span className="story-score">{item.importanceScore}</span>
            </button>
          ))}
        </div>
      </section>

      <article className="signal-report">
        <header className="section-panel signal-hero">
          {leadVisual ? <NewsVisual item={leadVisual} variant="hero" /> : null}
          <div className="signal-hero-copy">
            <div className="story-meta">
              <span className="subtle-chip">{getResearchSectorLabel(analysis.sectorTag)}</span>
              <span>{analysis.company}</span>
              <span className="story-score">{analysis.importanceScore}</span>
            </div>
            <h2>{analysis.ticker}</h2>
            <p className="headline-summary">{analysis.summary}</p>
          </div>
        </header>

        <div className="signal-sections">
          <section className="section-panel signal-section">
            <h3>요약</h3>
            <p>{analysis.summary}</p>
          </section>
          <section className="section-panel signal-section">
            <h3>기술적 분석</h3>
            <p>{analysis.technicalAnalysis}</p>
          </section>
          <section className="section-panel signal-section">
            <h3>패턴 분석</h3>
            <div className="pattern-list">
              {analysis.patternAnalysis.map((pattern) => (
                <article className="pattern-card" key={pattern.name}>
                  <div className="card-headline-meta">
                    <strong>{pattern.name}</strong>
                    <span className="subtle-chip">{getConfidenceLabel(pattern.confidence)}</span>
                  </div>
                  <p>{pattern.detail}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="section-panel signal-section">
            <h3>시황 연결</h3>
            <p>{analysis.marketContext}</p>
          </section>
          <section className="section-panel signal-section action">
            <h3>행동 제안</h3>
            <p>{analysis.recommendation}</p>
          </section>
        </div>

        <section className="section-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Linked News</span>
              <h2>연결된 뉴스</h2>
            </div>
            <p>차트만 따로 보지 않고, 현재 뉴스 흐름 안에서 판단을 이어가도록 묶었습니다.</p>
          </div>
          <div className="story-stack">
            {relatedNews.map((item) => (
              <NewsCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      </article>
    </section>
  );
}

function MeetingTab({ workspace }: { workspace: ResearchWorkspaceData }) {
  return (
    <section className="meeting-shell">
      <article className="section-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Agent Pipeline</span>
            <h2>{workspace.meeting.topic}</h2>
          </div>
          <p>{workspace.meeting.objective}</p>
        </div>
        <div className="meeting-summary">
          <div>
            <span className="eyebrow">파이프라인</span>
            <p>뉴스 선별 에이전트가 이슈를 압축하고, 시황 에이전트가 해석한 뒤, 티커 분석과 행동 제안 에이전트가 순서대로 넘겨받아 최종 전략을 만듭니다.</p>
          </div>
          <div>
            <span className="eyebrow">다음 액션</span>
            <p>{workspace.meeting.nextAction}</p>
          </div>
          <div>
            <span className="eyebrow">런타임</span>
            <p>
              {workspace.agentPipeline.runtime.provider.toUpperCase()} · {workspace.agentPipeline.runtime.source} ·{" "}
              {formatResearchDateTime(workspace.agentPipeline.runtime.generatedAt)}
            </p>
          </div>
        </div>
      </article>

      <section className="section-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Agent Thread</span>
            <h2>에이전트 대화 로그</h2>
          </div>
          <p>실제 파이프라인에서 각 단계가 다음 단계로 넘긴 메시지를 그대로 보여줍니다.</p>
        </div>
        <div className="meeting-thread">
          {workspace.agentPipeline.runtime.transcript.map((message, index) => (
            <TranscriptMessageCard isLast={index === workspace.agentPipeline.runtime.transcript.length - 1} key={message.id} message={message} />
          ))}
        </div>
      </section>

      <section className="pipeline-flow">
        {workspace.agentPipeline.steps.map((step, index) => (
          <PipelineStepCard key={step.id} order={index + 1} step={step} />
        ))}
      </section>

      <section className="market-grid">
        <article className="section-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Macro Read</span>
              <h2>시장 해석</h2>
            </div>
          </div>
          <div className="market-readout">
            <p>{workspace.agentPipeline.market.summary}</p>
            <p>{workspace.agentPipeline.market.shortTermView}</p>
            <p>{workspace.agentPipeline.market.mediumTermView}</p>
          </div>
        </article>

        <article className="section-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Trader Read</span>
              <h2>오늘 전략</h2>
            </div>
          </div>
          <div className="market-readout">
            <p>{workspace.agentPipeline.actionPlan.strategy}</p>
            <ul className="review-list">
              {workspace.agentPipeline.actionPlan.recommendedActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="market-grid">
        <article className="section-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Strong Sectors</span>
              <h2>강세 판단</h2>
            </div>
          </div>
          <ul className="market-call-list">
            {workspace.agentPipeline.market.strongSectors.map((call) => (
              <li key={`${call.sector}-${call.horizon}`}>
                <strong>
                  {call.sector} · {call.horizon}
                </strong>
                <p>{call.reason}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="section-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Risk Sectors</span>
              <h2>리스크 판단</h2>
            </div>
          </div>
          <ul className="market-call-list">
            {workspace.agentPipeline.market.riskSectors.map((call) => (
              <li key={`${call.sector}-${call.horizon}`}>
                <strong>
                  {call.sector} · {call.horizon}
                </strong>
                <p>{call.reason}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Product Team</span>
            <h2>PM · Trader · DA · QA · CTO 리뷰</h2>
          </div>
          <p>에이전트 파이프라인을 실제 제품 흐름으로 연결하기 위해 팀 역할별 개선안을 정리합니다.</p>
        </div>
        <div className="review-grid">
          {workspace.productReview.notes.map((note) => (
            <ReviewNoteCard key={note.role} note={note} />
          ))}
        </div>
      </section>

      <section className="section-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Conclusion</span>
            <h2>실행 아이템</h2>
          </div>
          <p>{workspace.userBehavior.frictionPoint}</p>
        </div>
        <ul className="action-item-list">
          {workspace.productReview.actionItems.map((item) => (
            <li key={item.id}>
              <div className="action-item-head">
                <strong>{item.title}</strong>
                <span className={`action-status-chip status-${item.implementationStatus}`}>{getImplementationStatusLabel(item.implementationStatus)}</span>
              </div>
              <p>{item.detail}</p>
              <p className="action-focus-copy">{item.implementationFocus}</p>
              <div className="action-implementation-grid">
                <div>
                  <span className="eyebrow">대상 파일</span>
                  <ul className="action-detail-list">
                    {item.targetPaths.map((path) => (
                      <li key={path}>
                        <code>{path}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="eyebrow">검증</span>
                  <ul className="action-detail-list">
                    {item.verificationCommands.map((command) => (
                      <li key={command}>
                        <code>{command}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {item.changedFiles.length > 0 ? (
                <p className="review-references">
                  구현 변경 파일 · {item.changedFiles.join(" · ")}
                </p>
              ) : null}
              <p className="review-references">
                {item.owner} · {item.references.join(" · ")}
                {item.issueUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={item.issueUrl} rel="noreferrer" target="_blank">
                      GitHub Issue #{item.issueNumber}
                    </a>
                  </>
                ) : (
                  <> · GitHub 이슈 미생성</>
                )}
                {item.branchName ? <> · Branch <code>{item.branchName}</code></> : null}
                {item.planPath ? <> · Plan <code>{item.planPath}</code></> : null}
                {item.pullRequestUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={item.pullRequestUrl} rel="noreferrer" target="_blank">
                      Draft PR #{item.pullRequestNumber}
                    </a>
                  </>
                ) : (
                  <> · Draft PR 미생성</>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
