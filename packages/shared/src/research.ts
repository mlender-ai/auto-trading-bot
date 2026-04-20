export type ResearchTab = "news" | "signals" | "meeting";
export type ResearchSectorTag = "semiconductors" | "energy-oil" | "ai-infra" | "industrial-tech";
export type ResearchPriority = "critical" | "focus" | "monitor";
export type PatternConfidence = "high" | "medium" | "low";
export type AgentRole = "PM" | "Trader" | "DA" | "QA" | "CTO";
export type ResearchPipelineStage = "news" | "macro" | "ticker" | "action";
export type ResearchPipelineAgentId = "news-editor" | "macro-analyst" | "ticker-analyst" | "execution-trader";
export type ResearchPipelineProvider = "rule-based" | "openai" | "github-models";
export type ResearchPipelineRunSource = "static" | "web-api" | "local-script" | "github-actions";

export interface ResearchSectorOption {
  id: ResearchSectorTag;
  label: string;
  description: string;
}

export interface TickerOption {
  ticker: string;
  label: string;
  sectorTag: ResearchSectorTag;
}

export interface UserResearchPreferences {
  sectors: ResearchSectorTag[];
  tickers: string[];
}

export interface ResearchNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string | null;
  publishedAt: string;
  imageUrl: string | null;
  sectorTag: ResearchSectorTag;
  tickerTags: string[];
  importanceScore: number;
  priority: ResearchPriority;
  analysis: string;
  recommendation: string;
}

export interface ResearchSectorIssue {
  sectorTag: ResearchSectorTag;
  sectorLabel: string;
  item: ResearchNewsItem;
}

export interface TickerPattern {
  name: string;
  detail: string;
  confidence: PatternConfidence;
}

export interface TickerAnalysis {
  ticker: string;
  company: string;
  sectorTag: ResearchSectorTag;
  importanceScore: number;
  summary: string;
  technicalAnalysis: string;
  patternAnalysis: TickerPattern[];
  marketContext: string;
  recommendation: string;
  linkedNewsIds: string[];
}

export interface AgentMeetingMessage {
  id: string;
  role: AgentRole;
  author: string;
  content: string;
  references: string[];
}

export interface AgentMeetingThread {
  topic: string;
  objective: string;
  nextAction: string;
  messages: AgentMeetingMessage[];
}

export interface UserBehaviorSignal {
  preferredTab: ResearchTab;
  returnDriver: string;
  frictionPoint: string;
  highIntentAction: string;
}

export interface ResearchPipelineAgentDefinition {
  id: ResearchPipelineAgentId;
  name: string;
  stage: ResearchPipelineStage;
  roleLabel: string;
  objective: string;
  promptBlueprint: string;
}

export interface ResearchPipelineStep {
  id: ResearchPipelineAgentId;
  stage: ResearchPipelineStage;
  name: string;
  roleLabel: string;
  objective: string;
  summary: string;
  outputLines: string[];
  handoffNote: string;
  references: string[];
}

export interface ResearchPipelineTranscriptMessage {
  id: string;
  agentId: ResearchPipelineAgentId;
  stage: ResearchPipelineStage;
  author: string;
  roleLabel: string;
  audience: string;
  summary: string;
  text: string;
  references: string[];
}

export interface ResearchPipelineRuntime {
  runId: string;
  provider: ResearchPipelineProvider;
  model: string | null;
  source: ResearchPipelineRunSource;
  status: "completed" | "fallback";
  generatedAt: string;
  artifactPath: string | null;
  summaryMarkdown: string;
  transcript: ResearchPipelineTranscriptMessage[];
}

export interface SectorStrengthCall {
  sector: string;
  horizon: "단기" | "중기";
  reason: string;
}

export interface MarketKeyEvent {
  title: string;
  reason: string;
}

export interface MarketInterpretation {
  summary: string;
  shortTermView: string;
  mediumTermView: string;
  strongSectors: SectorStrengthCall[];
  riskSectors: SectorStrengthCall[];
  keyEvents: MarketKeyEvent[];
}

export interface TraderActionPlan {
  strategy: string;
  recommendedActions: string[];
  avoidActions: string[];
  risks: string[];
}

export interface ProductReviewNote {
  role: AgentRole;
  title: string;
  points: string[];
  references: string[];
}

export interface ProductTeamReview {
  notes: ProductReviewNote[];
  actionItems: string[];
}

export interface ResearchAgentPipeline {
  definitions: ResearchPipelineAgentDefinition[];
  steps: ResearchPipelineStep[];
  market: MarketInterpretation;
  actionPlan: TraderActionPlan;
  runtime: ResearchPipelineRuntime;
}

export interface ResearchNewsBoard {
  headline: ResearchNewsItem | null;
  derivedArticles: ResearchNewsItem[];
  sectorIssues: ResearchSectorIssue[];
}

export interface NewsletterEnvelope {
  cadence: "daily";
  generatedAt: string;
  nextRunAt: string;
  subject: string;
  previewText: string;
  to: string[];
  bodyText: string;
  bodyHtml: string;
}

export interface ResearchWorkspaceData {
  generatedAt: string;
  preferences: UserResearchPreferences;
  focusedTickers: string[];
  availableSectors: ResearchSectorOption[];
  availableTickers: TickerOption[];
  userBehavior: UserBehaviorSignal;
  news: ResearchNewsBoard;
  tickerAnalyses: TickerAnalysis[];
  agentPipeline: ResearchAgentPipeline;
  productReview: ProductTeamReview;
  meeting: AgentMeetingThread;
  newsletter: NewsletterEnvelope;
}

export const researchSectorOptions: ResearchSectorOption[] = [
  {
    id: "semiconductors",
    label: "반도체",
    description: "GPU, 메모리, 파운드리 밸류체인"
  },
  {
    id: "energy-oil",
    label: "에너지(오일)",
    description: "메이저 오일, 서비스, 정유 마진"
  },
  {
    id: "ai-infra",
    label: "AI 인프라",
    description: "전력, 냉각, 데이터센터 지출"
  },
  {
    id: "industrial-tech",
    label: "산업 기술",
    description: "자동화, 장비, 공급망 효율화"
  }
];

export const researchTickerOptions: TickerOption[] = [
  { ticker: "NVDA", label: "NVIDIA", sectorTag: "semiconductors" },
  { ticker: "AMD", label: "AMD", sectorTag: "semiconductors" },
  { ticker: "TSM", label: "TSMC", sectorTag: "semiconductors" },
  { ticker: "XOM", label: "ExxonMobil", sectorTag: "energy-oil" },
  { ticker: "CVX", label: "Chevron", sectorTag: "energy-oil" },
  { ticker: "SLB", label: "SLB", sectorTag: "energy-oil" },
  { ticker: "VRT", label: "Vertiv", sectorTag: "ai-infra" },
  { ticker: "ETN", label: "Eaton", sectorTag: "ai-infra" }
];

export const defaultResearchPreferences: UserResearchPreferences = {
  sectors: ["semiconductors", "energy-oil"],
  tickers: ["NVDA", "AMD", "XOM"]
};

const defaultUserBehaviorSignal: UserBehaviorSignal = {
  preferredTab: "news",
  returnDriver: "사용자는 메인 헤드라인을 읽은 뒤 바로 행동 제안까지 이어질 때 재방문 가능성이 높습니다.",
  frictionPoint: "시황 해석이 행동 제안으로 연결되지 않으면 티커 분석 전에 이탈하는 경향이 있습니다.",
  highIntentAction: "관심 티커를 눌러 조건부 행동 제안을 확인하는 행동이 가장 강한 의도 신호입니다."
};

const researchAgentDefinitions: ResearchPipelineAgentDefinition[] = [
  {
    id: "news-editor",
    name: "News Editor",
    stage: "news",
    roleLabel: "뉴스 선별",
    objective: "가격 영향이 큰 뉴스만 추려 메인 헤드라인과 파생 뉴스, 섹터 핵심 이슈를 만든다.",
    promptBlueprint:
      "가장 중요한 뉴스 1개를 고르고, 직접 연결된 파생 뉴스 2~3개와 사용자 관심 섹터별 핵심 이슈 1개를 뽑는다. 단순 요약이 아니라 왜 중요한지 1줄로 설명한다."
  },
  {
    id: "macro-analyst",
    name: "Macro Analyst",
    stage: "macro",
    roleLabel: "시황 해석",
    objective: "뉴스 묶음을 단기/중기 시장 상태와 섹터 강약, 핵심 이벤트로 해석한다.",
    promptBlueprint:
      "뉴스를 반복하지 말고 시장이 어디로 자금이 이동할지 해석한다. 단기와 중기를 나누고, 강세 섹터와 리스크 섹터를 각각 2~3개씩 제시한다."
  },
  {
    id: "ticker-analyst",
    name: "Ticker Analyst",
    stage: "ticker",
    roleLabel: "티커 딥분석",
    objective: "선택한 핵심 티커의 기술적 상태, 패턴, 시황 연결을 해석해 판단 가능한 분석으로 만든다.",
    promptBlueprint:
      "지표를 단순 나열하지 말고 해석 중심으로 요약한다. 추세, 지지/저항, 패턴 신뢰도, 섹터 흐름 연결까지 설명하고 행동 조건으로 마무리한다."
  },
  {
    id: "execution-trader",
    name: "Execution Trader",
    stage: "action",
    roleLabel: "행동 제안",
    objective: "시장 해석과 티커 분석을 실제 행동 계획으로 번역한다.",
    promptBlueprint:
      "오늘 전략 1줄, 추천 행동 2~4개, 하지 말아야 할 행동, 핵심 리스크를 짧고 단호하게 작성한다. 실행 가능한 문장만 사용한다."
  }
];

function getResearchAgentDefinition(id: ResearchPipelineAgentId): ResearchPipelineAgentDefinition {
  const definition = researchAgentDefinitions.find((item) => item.id === id);

  if (!definition) {
    throw new Error(`Unknown research agent: ${id}`);
  }

  return definition;
}

const researchNewsWire: ResearchNewsItem[] = [
  {
    id: "news-hbm-allocation",
    title: "HBM 공급 타이트닝이 GPU 체인의 이익 기대를 다시 끌어올린다",
    summary: "고객 발주가 메모리와 패키징 병목에 몰리면서 GPU 리더와 상위 공급망 중심의 프리미엄이 유지되는 그림입니다.",
    source: "Research Desk",
    sourceUrl: null,
    publishedAt: "2026-04-20T07:20:00+09:00",
    imageUrl: null,
    sectorTag: "semiconductors",
    tickerTags: ["NVDA", "AMD", "TSM"],
    importanceScore: 96,
    priority: "critical",
    analysis: "뉴스 자체보다 중요한 건 공급 제약이 여전히 가격 결정력을 생산자 쪽에 남겨둔다는 점입니다. 실적 시즌에서는 물량보다 리드타임 코멘트가 더 큰 주가 재료가 됩니다.",
    recommendation: "반도체 노출은 메인 리더 1개와 후행 추격주 1개로 압축하고, 리드타임 둔화 신호가 나오기 전까지는 감속보다 보유 유지에 무게를 둡니다."
  },
  {
    id: "news-foundry-utilization",
    title: "파운드리 가동률 회복 조짐은 설계주 체력 확인 구간으로 읽힌다",
    summary: "가동률 개선은 아직 전면적 회복이라기보다 상위 고객 편중이 강한 반등에 가깝습니다.",
    source: "Research Desk",
    sourceUrl: null,
    publishedAt: "2026-04-20T06:40:00+09:00",
    imageUrl: null,
    sectorTag: "semiconductors",
    tickerTags: ["AMD", "TSM"],
    importanceScore: 88,
    priority: "focus",
    analysis: "장비주 전반 확산보다 설계주 마진 방어 여부를 먼저 확인해야 합니다. 고객 믹스가 개선되면 밸류에이션 리레이팅 폭도 설계주가 더 큽니다.",
    recommendation: "공급망 확산 베팅보다 AMD 같은 실적 민감 종목을 우선 관찰하고, TSM은 가동률 수치보다 고객 믹스 코멘트를 체크합니다."
  },
  {
    id: "news-memory-pricing",
    title: "메모리 가격 반등 기대가 서버 투자 재개 논리를 지지한다",
    summary: "메모리 스팟 강세는 데이터센터 증설의 재개와 함께 서버 관련 밸류체인에 선행 신호를 줍니다.",
    source: "Research Desk",
    sourceUrl: null,
    publishedAt: "2026-04-20T06:10:00+09:00",
    imageUrl: null,
    sectorTag: "semiconductors",
    tickerTags: ["NVDA", "TSM"],
    importanceScore: 84,
    priority: "focus",
    analysis: "현 시점에서는 메모리 가격 상승 자체보다 서버 예산 복원 속도가 더 중요합니다. 결국 GPU 발주가 서버 투자 전체로 번지는지 확인해야 합니다.",
    recommendation: "반도체 섹터에서는 순수 메모리 베팅보다 서버 예산 재개 수혜가 큰 AI 인프라 종목과 함께 묶어서 봅니다."
  },
  {
    id: "news-oil-cashflow",
    title: "유가 상단이 열리지 않아도 메이저 오일의 현금흐름 방어력은 여전히 견조하다",
    summary: "가격 급등이 없어도 배당과 자사주 매입을 지속할 수 있는 종목에 자금이 다시 모이는 흐름입니다.",
    source: "Macro Wire",
    sourceUrl: null,
    publishedAt: "2026-04-20T07:05:00+09:00",
    imageUrl: null,
    sectorTag: "energy-oil",
    tickerTags: ["XOM", "CVX"],
    importanceScore: 91,
    priority: "critical",
    analysis: "에너지 섹터는 베타보다 현금흐름의 질이 중요해졌습니다. 정제 마진 둔화 구간에서는 업스트림 비중 높은 메이저가 방어주 역할을 합니다.",
    recommendation: "오일 노출은 배당 방어력이 높은 메이저 중심으로 유지하고, 단기 트레이드는 서비스주보다 XOM·CVX 같은 대형주에 집중합니다."
  },
  {
    id: "news-refining-spread",
    title: "정유 마진 둔화가 업스트림 비중 높은 오일 메이저의 상대 강세를 만든다",
    summary: "하류 부문 이익 기여가 줄어드는 환경에서는 탐사·생산 비중이 높은 기업이 더 안정적입니다.",
    source: "Macro Wire",
    sourceUrl: null,
    publishedAt: "2026-04-20T05:50:00+09:00",
    imageUrl: null,
    sectorTag: "energy-oil",
    tickerTags: ["XOM", "CVX", "SLB"],
    importanceScore: 83,
    priority: "focus",
    analysis: "정유 사이클 둔화는 섹터 전체 악재가 아니라 포트폴리오 재배치 신호에 가깝습니다. 서비스를 사더라도 대형 메이저의 capex 유지 여부가 먼저입니다.",
    recommendation: "서비스주는 메이저의 투자 계획이 유지될 때만 추종하고, 당장은 XOM·CVX를 코어로 두는 편이 안전합니다."
  },
  {
    id: "news-oil-service",
    title: "해상 프로젝트 재개 기대가 오일 서비스 업체의 단기 레버리지를 키운다",
    summary: "대형 프로젝트 재가동 신호는 서비스 업체의 수주 가시성을 높여 단기 탄력 요인이 됩니다.",
    source: "Macro Wire",
    sourceUrl: null,
    publishedAt: "2026-04-20T05:15:00+09:00",
    imageUrl: null,
    sectorTag: "energy-oil",
    tickerTags: ["SLB", "XOM"],
    importanceScore: 78,
    priority: "monitor",
    analysis: "서비스주는 레버리지가 크지만 방향성보다 실행 지연 리스크를 같이 봐야 합니다. 오일 메이저의 capex가 흔들리면 주가 탄력도 빠르게 꺾일 수 있습니다.",
    recommendation: "SLB는 추격보다 눌림 확인 후 대응하고, 메이저 capex 코멘트가 약해지면 우선순위를 낮춥니다."
  },
  {
    id: "news-power-density",
    title: "AI 데이터센터 전력 밀도 상승이 전력·냉각 체인 수요를 앞당긴다",
    summary: "AI 투자 논리가 GPU에서 전력 인프라로 확장되며 수혜 체인이 넓어지고 있습니다.",
    source: "Infra Monitor",
    sourceUrl: null,
    publishedAt: "2026-04-20T06:55:00+09:00",
    imageUrl: null,
    sectorTag: "ai-infra",
    tickerTags: ["VRT", "ETN", "NVDA"],
    importanceScore: 86,
    priority: "focus",
    analysis: "AI 인프라는 소프트웨어보다 설비 CAPEX와 연결되는 영역이라 발주 확인이 빠릅니다. GPU 뉴스가 실제 시설 투자로 전이되는지 보는 데 좋은 확인 지표입니다.",
    recommendation: "AI 인프라는 반도체와 함께 묶되, 전력·냉각 체인은 후행 수혜로 보는 대신 조정 시 분할 관찰 대상으로 둡니다."
  },
  {
    id: "news-automation-backlog",
    title: "산업 자동화 백로그 회복은 공급망 효율화 테마를 다시 살린다",
    summary: "제조사 투자 재개는 장비와 자동화 소프트웨어 결합 업체에 선택적으로 우호적입니다.",
    source: "Industrial Review",
    sourceUrl: null,
    publishedAt: "2026-04-20T04:55:00+09:00",
    imageUrl: null,
    sectorTag: "industrial-tech",
    tickerTags: ["ETN"],
    importanceScore: 72,
    priority: "monitor",
    analysis: "전면적 경기민감 반등이 아니라 생산성 투자 재개 성격이 강합니다. 주문잔고 회복이 이어지는지 분기 단위로 확인할 필요가 있습니다.",
    recommendation: "핵심 포트폴리오 편입보다는 감시 리스트에 두고, AI 인프라 수요와 연결되는 종목부터 우선 확인합니다."
  }
];

const tickerAnalysisLibrary: TickerAnalysis[] = [
  {
    ticker: "NVDA",
    company: "NVIDIA",
    sectorTag: "semiconductors",
    importanceScore: 95,
    summary: "리더십이 유지되는 한 눌림은 분배보다 재진입 검토 구간에 가깝습니다.",
    technicalAnalysis: "중기 추세는 여전히 상방 우위입니다. 다만 단기 과열이 해소되는 동안 20일선 부근에서 거래량이 줄어드는지 확인하는 편이 좋습니다.",
    patternAnalysis: [
      {
        name: "상승 추세 내 베이스 재형성",
        detail: "고점 돌파 이후 급격한 이탈 없이 횡보 폭이 줄면 기관 재집결 신호로 해석할 수 있습니다.",
        confidence: "high"
      },
      {
        name: "상대강도 재확인",
        detail: "지수 조정 구간에서 낙폭이 얕으면 업계 리더십이 유지된다는 뜻입니다.",
        confidence: "medium"
      }
    ],
    marketContext: "반도체 뉴스가 실적 추정치 상향으로 연결될 때 가장 먼저 반응하는 종목입니다. HBM 병목 해소 여부가 가장 큰 체크포인트입니다.",
    recommendation: "추격 매수보다 조정 시 분할 접근이 유효합니다. 리드타임 둔화 코멘트가 나오기 전까지는 코어 포지션 유지 관점이 우세합니다.",
    linkedNewsIds: ["news-hbm-allocation", "news-memory-pricing"]
  },
  {
    ticker: "AMD",
    company: "AMD",
    sectorTag: "semiconductors",
    importanceScore: 90,
    summary: "리더 추격주이지만 제품 믹스 개선이 확인되면 업사이드가 더 커질 수 있습니다.",
    technicalAnalysis: "단기 박스 상단 테스트 구간으로, 거래량이 동반되지 않으면 돌파 실패 가능성도 남아 있습니다.",
    patternAnalysis: [
      {
        name: "박스 상단 압축",
        detail: "저점이 높아지며 상단 저항에 붙는 흐름은 이벤트 전 기대가 쌓인다는 뜻입니다.",
        confidence: "medium"
      },
      {
        name: "실적 이벤트 민감도 확대",
        detail: "제품 믹스 코멘트 하나로 밸류에이션이 빠르게 재평가될 수 있는 구간입니다.",
        confidence: "high"
      }
    ],
    marketContext: "가동률 회복과 고객 믹스 개선 뉴스에 가장 민감한 종목 중 하나입니다. 시장이 리더 분산을 기대할 때 상대 수혜가 큽니다.",
    recommendation: "결정은 단순 추세 추종보다 실적 전후 가이던스 확인 이후가 낫습니다. 공격적으로 보더라도 비중은 NVDA보다 낮게 두는 편이 안전합니다.",
    linkedNewsIds: ["news-hbm-allocation", "news-foundry-utilization"]
  },
  {
    ticker: "TSM",
    company: "TSMC",
    sectorTag: "semiconductors",
    importanceScore: 86,
    summary: "밸류체인 허브이기 때문에 업황 회복 확인용 바로미터 역할이 큽니다.",
    technicalAnalysis: "추세는 우상향이지만 설비투자 코멘트에 따라 밴드가 넓어질 수 있습니다.",
    patternAnalysis: [
      {
        name: "완만한 추세 유지",
        detail: "고점 돌파보다 추세 보존이 중요한 종목이라 변동성보다 가이던스 체크가 우선입니다.",
        confidence: "medium"
      }
    ],
    marketContext: "상위 고객의 수요 집중도가 높아질수록 가동률 회복 속도가 빨라집니다. 반대로 고객 다변화 둔화는 디레이팅 요인입니다.",
    recommendation: "TSM은 공격 포지션보다 업황 확인용 코어로 두고, 고객 믹스가 개선될 때 추가 비중을 검토합니다.",
    linkedNewsIds: ["news-foundry-utilization", "news-memory-pricing"]
  },
  {
    ticker: "XOM",
    company: "ExxonMobil",
    sectorTag: "energy-oil",
    importanceScore: 92,
    summary: "상방 탄력보다 하방 방어에 강점이 있어 에너지 코어 포지션으로 적합합니다.",
    technicalAnalysis: "장기 박스 상단에서 버티는 흐름이라 유가 변동성 대비 낙폭 관리가 잘 되는 편입니다.",
    patternAnalysis: [
      {
        name: "고배당 방어형 박스",
        detail: "가격 급등이 없어도 수급이 유지되면 박스 상단 체류 시간이 길어집니다.",
        confidence: "high"
      }
    ],
    marketContext: "유가가 급등하지 않는 구간일수록 현금흐름의 질과 주주환원 정책이 더 부각됩니다. 방어적 에너지 익스포저의 중심입니다.",
    recommendation: "에너지 노출의 기본값으로 두기 좋습니다. 공격적 단기 매매보다 비중 유지와 배당 방어 관점이 적합합니다.",
    linkedNewsIds: ["news-oil-cashflow", "news-refining-spread"]
  },
  {
    ticker: "CVX",
    company: "Chevron",
    sectorTag: "energy-oil",
    importanceScore: 87,
    summary: "XOM 대비 공격성은 낮지만 안정적인 업스트림 노출을 제공합니다.",
    technicalAnalysis: "추세 전환보다 밴드 회복 단계라 급격한 추세 추종보다는 지지선 확인이 먼저입니다.",
    patternAnalysis: [
      {
        name: "완만한 회복형 구조",
        detail: "속도는 느리지만 하방이 얕으면 기관 자금의 방어성 선호가 들어온 것으로 볼 수 있습니다.",
        confidence: "medium"
      }
    ],
    marketContext: "정유 마진 부담이 있는 환경에서도 업스트림 비중 덕분에 실적 변동성이 상대적으로 완만합니다.",
    recommendation: "에너지 섹터를 넓게 보유할 필요가 있을 때 XOM과 짝을 이루는 보조 코어로 적합합니다.",
    linkedNewsIds: ["news-oil-cashflow", "news-refining-spread"]
  },
  {
    ticker: "SLB",
    company: "SLB",
    sectorTag: "energy-oil",
    importanceScore: 80,
    summary: "서비스주는 메이저 투자 집행이 살아 있을 때만 탄력이 크게 붙습니다.",
    technicalAnalysis: "박스 중단 회복 구간이라 추세보다 이벤트 확인이 우선입니다.",
    patternAnalysis: [
      {
        name: "프로젝트 재개 기대 선반영",
        detail: "수주 가시성이 높아질 때 급격한 리레이팅이 가능하지만, 지연되면 되돌림도 빠릅니다.",
        confidence: "medium"
      }
    ],
    marketContext: "서비스주는 오일 메이저의 설비투자 코멘트와 함께 봐야 합니다. 메이저가 보수적으로 돌아서면 민감도가 크게 꺾입니다.",
    recommendation: "코어보다 전술적 관찰 종목으로 두고, 메이저 capex 유지가 확인될 때만 비중을 올립니다.",
    linkedNewsIds: ["news-refining-spread", "news-oil-service"]
  },
  {
    ticker: "VRT",
    company: "Vertiv",
    sectorTag: "ai-infra",
    importanceScore: 82,
    summary: "AI 설비 투자 확산의 후행 수혜를 받는 전력·냉각 대표주입니다.",
    technicalAnalysis: "추세는 강하지만 이벤트 반응이 커서 눌림 구간의 거래량 감소가 중요합니다.",
    patternAnalysis: [
      {
        name: "고성장 후 변동성 확대",
        detail: "상승 추세는 살아 있지만 고점 근처 변동성이 커질 수 있어 분할 대응이 필요합니다.",
        confidence: "medium"
      }
    ],
    marketContext: "GPU 뉴스가 실제 데이터센터 설비 CAPEX로 이어질 때 밸류에이션이 더 열릴 수 있습니다.",
    recommendation: "반도체 핵심 노출을 이미 갖고 있다면, VRT는 보조 성장 축으로만 접근하는 편이 좋습니다.",
    linkedNewsIds: ["news-power-density", "news-memory-pricing"]
  },
  {
    ticker: "ETN",
    company: "Eaton",
    sectorTag: "ai-infra",
    importanceScore: 76,
    summary: "AI 전력 인프라와 산업 자동화가 겹치는 안정적 확장 스토리입니다.",
    technicalAnalysis: "완만한 우상향 구조로 급등보다는 누적 수익형 흐름에 가깝습니다.",
    patternAnalysis: [
      {
        name: "저변동 추세 추종",
        detail: "조용한 강세가 이어질 때 장기 자금 유입 가능성이 높습니다.",
        confidence: "low"
      }
    ],
    marketContext: "전력 인프라와 자동화가 모두 열릴 때 수혜를 받는 구조라 변동성이 낮은 편입니다.",
    recommendation: "고베타 대신 안정적 AI 인프라 확장을 원할 때 보조 편입 후보로 볼 수 있습니다.",
    linkedNewsIds: ["news-power-density", "news-automation-backlog"]
  }
];

const validSectorSet = new Set<ResearchSectorTag>(researchSectorOptions.map((sector) => sector.id));
const validTickerSet = new Set<string>(researchTickerOptions.map((ticker) => ticker.ticker));

export function normalizeResearchPreferences(preferences?: Partial<UserResearchPreferences>): UserResearchPreferences {
  const sectors = (preferences?.sectors ?? defaultResearchPreferences.sectors).filter((sector): sector is ResearchSectorTag => validSectorSet.has(sector));
  const tickers = (preferences?.tickers ?? defaultResearchPreferences.tickers).filter((ticker) => validTickerSet.has(ticker));

  return {
    sectors: sectors.length > 0 ? Array.from(new Set(sectors)) : defaultResearchPreferences.sectors,
    tickers: Array.from(new Set(tickers))
  };
}

export function getResearchSectorLabel(sector: ResearchSectorTag): string {
  return researchSectorOptions.find((option) => option.id === sector)?.label ?? sector;
}

export function formatResearchDateTime(iso: string, timeZone = "Asia/Seoul"): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  }).format(new Date(iso));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildNextDailyRun(generatedAt: string, hour = 7, minute = 30): string {
  const base = new Date(generatedAt);
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);

  if (next.getTime() <= base.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

function buildTickerSelection(preferences: UserResearchPreferences): string[] {
  if (preferences.tickers.length > 0) {
    return preferences.tickers;
  }

  return researchTickerOptions.filter((option) => preferences.sectors.includes(option.sectorTag)).slice(0, 3).map((option) => option.ticker);
}

function buildMarketInterpretation(news: ResearchNewsBoard, analyses: TickerAnalysis[], preferences: UserResearchPreferences): MarketInterpretation {
  const headline = news.headline;
  const leadTicker = analyses[0];
  const selectedSectorLabels = preferences.sectors.map(getResearchSectorLabel);
  const strongSectors: SectorStrengthCall[] = [
    {
      sector: "반도체",
      horizon: "단기",
      reason: "공급 제약과 가격 결정력이 함께 언급돼 리더 종목 프리미엄이 유지되기 쉬운 환경입니다."
    },
    {
      sector: "에너지",
      horizon: "단기",
      reason: "유가 급등이 없어도 현금흐름과 주주환원 매력이 부각돼 방어성 자금이 머물기 좋습니다."
    },
    {
      sector: "AI 인프라",
      horizon: "중기",
      reason: "반도체 뉴스가 실제 데이터센터 CAPEX로 이어질 경우 후행 수혜가 커질 수 있습니다."
    }
  ];
  const riskSectors: SectorStrengthCall[] = [
    {
      sector: "오일 서비스",
      horizon: "단기",
      reason: "메이저 capex가 흔들리면 레버리지 노출이 먼저 꺾이는 구조라 추격 근거가 약합니다."
    },
    {
      sector: "산업 기술",
      horizon: "중기",
      reason: "생산성 투자 회복은 아직 확인 단계라 당장 강한 수급을 기대하기 어렵습니다."
    },
    {
      sector: "후행 반도체",
      horizon: "단기",
      reason: "업황 개선 기대가 리더보다 먼저 후행주에 확산되면 실패 확률이 높아지는 구간입니다."
    }
  ];

  return {
    summary: headline
      ? `지금 시장은 ${getResearchSectorLabel(headline.sectorTag)} 리더십과 방어형 에너지로 자금이 압축되는 국면입니다.`
      : "지금 시장은 선택한 섹터 안에서 가격 영향이 큰 뉴스가 부족해 방향성보다 선별이 중요한 국면입니다.",
    shortTermView: headline
      ? `${getResearchSectorLabel(headline.sectorTag)} 뉴스가 가격 결정력을 설명하는 핵심 축이 되면서, 단기 자금은 후행 확산보다 리더 종목과 현금흐름이 좋은 방어주로 몰릴 가능성이 높습니다.`
      : "단기적으로는 뚜렷한 주도 뉴스가 약해, 강한 방향성보다 이벤트 확인 이후 대응이 유효합니다.",
    mediumTermView:
      "중기적으로는 공급 제약과 설비투자 확산이 실제 실적 추정치 상향으로 이어지는지가 중요합니다. 지금은 테마 확산 자체보다 자금이 어디까지 전이되는지 확인하는 단계입니다.",
    strongSectors: strongSectors.filter((call) => call.sector !== "AI 인프라" || selectedSectorLabels.includes("AI 인프라") || news.sectorIssues.some((issue) => issue.sectorTag === "ai-infra")),
    riskSectors,
    keyEvents: [
      {
        title: "반도체 실적 시즌 코멘트",
        reason: "리드타임과 고객 믹스 발언이 업황 기대를 유지할지 결정합니다."
      },
      {
        title: "메이저 오일 capex 가이던스",
        reason: "에너지 방어 논리가 유지될지, 서비스주까지 확산될지를 가르는 기준입니다."
      },
      {
        title: leadTicker ? `${leadTicker.ticker} 연계 수요 확인` : "핵심 티커 수요 확인",
        reason: "리더 종목 강세가 섹터 전체 확산인지 단일 종목 집중인지 판별할 수 있습니다."
      }
    ]
  };
}

function buildActionPlan(market: MarketInterpretation, analyses: TickerAnalysis[]): TraderActionPlan {
  const leadTicker = analyses[0];
  const secondaryTicker = analyses[1];
  const energyTicker = analyses.find((analysis) => analysis.sectorTag === "energy-oil");

  return {
    strategy: `${leadTicker?.ticker ?? "리더 티커"} 중심의 조정 매수만 허용하고, ${energyTicker?.ticker ?? "에너지 메이저"}로 방어 노출을 병행하는 전략이 우세합니다.`,
    recommendedActions: [
      leadTicker ? `${leadTicker.ticker}는 추격 대신 조정 구간에서만 분할 진입합니다.` : "리더 종목은 추격보다 눌림 구간에서만 대응합니다.",
      secondaryTicker ? `${secondaryTicker.ticker}는 이벤트 전 기대가 과열되면 비중을 늘리지 않고, 가이던스 확인 뒤 확장합니다.` : "후행 종목은 실적 확인 전 과도한 비중 확대를 피합니다.",
      energyTicker ? `${energyTicker.ticker} 같은 방어형 에너지로 포지션 균형을 맞춥니다.` : "현금흐름이 안정적인 방어 섹터 비중을 함께 유지합니다."
    ],
    avoidActions: [
      "서비스주나 후행 확산주를 뉴스 헤드라인만 보고 추격 매수하지 않습니다.",
      "행동 조건 없이 모든 관심 티커를 동시에 매수하는 분산 진입은 피합니다."
    ],
    risks: [
      "리드타임 둔화나 고객 믹스 악화 코멘트가 나오면 반도체 강세 논리가 빠르게 약해질 수 있습니다.",
      "메이저 오일의 capex 보수화는 에너지 내 강세 확산을 막고 서비스주를 먼저 흔들 수 있습니다."
    ]
  };
}

function buildPipelineTranscript(steps: ResearchPipelineStep[]): ResearchPipelineTranscriptMessage[] {
  return steps.map((step, index) => ({
    id: `${step.id}-message-${index + 1}`,
    agentId: step.id,
    stage: step.stage,
    author: step.name,
    roleLabel: step.roleLabel,
    audience: steps[index + 1]?.name ?? "Operator",
    summary: step.summary,
    text: `${step.summary} ${step.handoffNote}`,
    references: step.references
  }));
}

function buildPipelineRuntime(
  steps: ResearchPipelineStep[],
  generatedAt: string,
  options?: Partial<Omit<ResearchPipelineRuntime, "generatedAt" | "summaryMarkdown" | "transcript">>
): ResearchPipelineRuntime {
  return {
    runId: options?.runId ?? `pipeline-${generatedAt}`,
    provider: options?.provider ?? "rule-based",
    model: options?.model ?? null,
    source: options?.source ?? "static",
    status: options?.status ?? "fallback",
    generatedAt,
    artifactPath: options?.artifactPath ?? null,
    summaryMarkdown: "",
    transcript: buildPipelineTranscript(steps)
  };
}

function buildAgentPipeline(news: ResearchNewsBoard, analyses: TickerAnalysis[], preferences: UserResearchPreferences, generatedAt: string): ResearchAgentPipeline {
  const market = buildMarketInterpretation(news, analyses, preferences);
  const actionPlan = buildActionPlan(market, analyses);
  const headline = news.headline;
  const leadTicker = analyses[0];
  const newsEditor = getResearchAgentDefinition("news-editor");
  const macroAnalyst = getResearchAgentDefinition("macro-analyst");
  const tickerAnalyst = getResearchAgentDefinition("ticker-analyst");
  const executionTrader = getResearchAgentDefinition("execution-trader");

  const steps: ResearchPipelineStep[] = [
    {
      id: "news-editor",
      stage: "news",
      name: "News Editor",
      roleLabel: "뉴스 선별",
      objective: newsEditor.objective,
      summary: headline ? `메인 헤드라인을 "${headline.title}"로 고정하고 파생 뉴스 ${news.derivedArticles.length}개를 연결했습니다.` : "메인 헤드라인을 만들 만한 가격 영향 뉴스가 아직 부족합니다.",
      outputLines: [
        headline ? `메인 헤드라인: ${headline.title}` : "메인 헤드라인 없음",
        ...news.derivedArticles.slice(0, 3).map((item) => `파생 뉴스: ${item.title}`),
        ...news.sectorIssues.map((issue) => `${issue.sectorLabel}: ${issue.item.title}`)
      ],
      handoffNote: "이 출력은 시황 해석 에이전트의 입력으로 넘어갑니다.",
      references: [headline?.id, ...news.derivedArticles.map((item) => item.id)].filter((value): value is string => Boolean(value))
    },
    {
      id: "macro-analyst",
      stage: "macro",
      name: "Macro Analyst",
      roleLabel: "시황 해석",
      objective: macroAnalyst.objective,
      summary: market.summary,
      outputLines: [
        `시장 한 줄 요약: ${market.summary}`,
        `단기: ${market.shortTermView}`,
        `중기: ${market.mediumTermView}`
      ],
      handoffNote: "이 해석은 티커 딥분석과 행동 제안 에이전트의 공통 컨텍스트가 됩니다.",
      references: [headline?.id, ...news.sectorIssues.map((issue) => issue.item.id)].filter((value): value is string => Boolean(value))
    },
    {
      id: "ticker-analyst",
      stage: "ticker",
      name: "Ticker Analyst",
      roleLabel: "티커 딥분석",
      objective: tickerAnalyst.objective,
      summary: leadTicker
        ? `${leadTicker.ticker}를 대표 분석 티커로 선택해 추세, 패턴, 섹터 연결을 해석했습니다.`
        : "대표 분석 티커가 없어 티커 딥분석을 보류합니다.",
      outputLines: leadTicker
        ? [
            `요약: ${leadTicker.summary}`,
            `기술적 상태: ${leadTicker.technicalAnalysis}`,
            `패턴: ${leadTicker.patternAnalysis.map((pattern) => pattern.name).join(", ")}`,
            `시황 연결: ${leadTicker.marketContext}`
          ]
        : ["대표 티커 없음"],
      handoffNote: "이 출력은 행동 제안 에이전트가 진입/관망/회피 조건을 만드는 기준이 됩니다.",
      references: leadTicker ? [leadTicker.ticker, ...leadTicker.linkedNewsIds] : []
    },
    {
      id: "execution-trader",
      stage: "action",
      name: "Execution Trader",
      roleLabel: "행동 제안",
      objective: executionTrader.objective,
      summary: actionPlan.strategy,
      outputLines: [
        `오늘 전략: ${actionPlan.strategy}`,
        ...actionPlan.recommendedActions.map((item) => `추천 행동: ${item}`),
        ...actionPlan.avoidActions.map((item) => `하지 말 것: ${item}`)
      ],
      handoffNote: "이 출력은 사용자에게 보이는 최종 실행 제안이자 제품 팀 리뷰의 평가 대상입니다.",
      references: [leadTicker?.ticker, ...news.derivedArticles.map((item) => item.id)].filter((value): value is string => Boolean(value))
    }
  ];

  return {
    definitions: researchAgentDefinitions,
    steps,
    market,
    actionPlan,
    runtime: buildPipelineRuntime(steps, generatedAt)
  };
}

export function buildResearchProductReview(
  pipeline: ResearchAgentPipeline,
  behavior: UserBehaviorSignal,
  preferences: UserResearchPreferences,
  analyses: TickerAnalysis[]
): ProductTeamReview {
  const leadTicker = analyses[0]?.ticker ?? "대표 티커";
  const selectedSectors = preferences.sectors.map(getResearchSectorLabel).join(", ");

  return {
    notes: [
      {
        role: "PM",
        title: "뉴스에서 행동까지 한 줄 흐름을 더 명확히 보여줘야 합니다.",
        points: [
          `첫 화면에서 ${selectedSectors} 기준 뉴스 → 시황 → 행동 순서를 고정해 사용자가 다음 단계로 자연스럽게 넘어가게 해야 합니다.`,
          "메인 헤드라인 아래에 바로 오늘 전략 요약을 붙여 사용자가 뉴스만 읽고 끝나지 않게 만들어야 합니다."
        ],
        references: ["news-editor", "execution-trader"]
      },
      {
        role: "Trader",
        title: "행동 제안은 매수/관망/회피보다 조건 중심으로 보여주는 편이 더 실전적입니다.",
        points: [
          `${leadTicker} 같은 대표 티커는 '언제 진입'보다 '어떤 조건에서만 진입'을 먼저 보여줘야 추격 매수를 줄일 수 있습니다.`,
          "사용자가 하지 말아야 할 행동을 별도 블록으로 고정하면 잘못된 진입을 크게 줄일 수 있습니다."
        ],
        references: ["ticker-analyst", "execution-trader"]
      },
      {
        role: "DA",
        title: "현재 행동 의도가 가장 강한 지점은 관심 티커 클릭이므로 그 이후 전환을 추적해야 합니다.",
        points: [
          `사용자 행동상 ${behavior.highIntentAction}`,
          `반대로 ${behavior.frictionPoint} 따라서 stage_continue, ticker_select, action_expand 이벤트를 따로 수집해야 합니다.`
        ],
        references: ["macro-analyst", "ticker-analyst"]
      },
      {
        role: "QA",
        title: "같은 뉴스가 탭마다 다르게 해석되면 신뢰가 떨어집니다.",
        points: [
          "뉴스 탭의 행동 제안과 티커 분석 탭의 행동 제안이 충돌하지 않도록 검증 규칙이 필요합니다.",
          "에이전트별 출력 길이와 톤이 제각각이면 회의 탭에서 무엇이 결론인지 흐려지므로 출력 형식을 고정해야 합니다."
        ],
        references: ["news-editor", "execution-trader", "meeting"]
      },
      {
        role: "CTO",
        title: "에이전트는 UI 컴포넌트가 아니라 독립된 출력 스키마로 다뤄야 확장성이 생깁니다.",
        points: [
          "각 에이전트의 입력과 출력을 JSON 스키마로 고정해 두면 이후 실제 LLM 호출로 교체해도 화면을 바꾸지 않아도 됩니다.",
          "지금 단계에서 agent_id, stage, summary, output_lines, references를 표준화해 두면 GitHub 연동과 로그 추적도 쉬워집니다."
        ],
        references: ["news-editor", "macro-analyst", "ticker-analyst", "execution-trader"]
      }
    ],
    actionItems: [
      "뉴스 선별, 시황 해석, 티커 분석, 행동 제안 에이전트의 출력 스키마를 API 응답으로 고정합니다.",
      "메인 헤드라인 아래에 오늘 전략과 금지 행동을 붙여 뉴스에서 행동으로 바로 이어지게 만듭니다.",
      "headline_open, stage_continue, ticker_select, action_expand 이벤트를 수집해 어느 단계에서 이탈하는지 측정합니다."
    ]
  };
}

export function buildResearchMeetingThread(
  pipeline: ResearchAgentPipeline,
  review: ProductTeamReview,
  news: ResearchNewsBoard,
  analyses: TickerAnalysis[]
): AgentMeetingThread {
  const headline = news.headline;
  const leadTicker = analyses[0];

  return {
    topic: headline ? headline.title : "에이전트 파이프라인 회의",
    objective: "뉴스 → 시황 → 분석 → 행동 체인이 실제 제품 흐름으로 이어지는지 점검합니다.",
    nextAction: pipeline.actionPlan.recommendedActions[0] ?? (leadTicker ? `${leadTicker.ticker} 분석을 행동 조건과 함께 우선 노출합니다.` : "메인 헤드라인과 오늘 전략 연결을 우선 정리합니다."),
    messages: review.notes.map((note, index) => ({
      id: `${note.role.toLowerCase()}-${index + 1}`,
      role: note.role,
      author: note.role,
      content: `${note.title} ${note.points.join(" ")}`,
      references: note.references
    }))
  };
}

export function buildResearchNewsletter(news: ResearchNewsBoard, analyses: TickerAnalysis[], generatedAt: string): NewsletterEnvelope {
  const headline = news.headline;
  const subject = headline ? `[Daily Brief] ${headline.title}` : "[Daily Brief] 오늘의 리서치 요약";
  const previewText = headline
    ? `${headline.summary} / 행동 제안: ${headline.recommendation}`
    : "선택한 관심사에 맞춰 핵심 뉴스와 행동 제안을 정리합니다.";

  const textSections = [
    subject,
    "",
    previewText,
    "",
    "[메인 헤드라인]",
    headline ? `${headline.title}\n- 분석: ${headline.analysis}\n- 행동: ${headline.recommendation}` : "핵심 헤드라인 없음",
    "",
    "[파생 기사]",
    ...news.derivedArticles.map((item) => `- ${item.title}\n  분석: ${item.analysis}\n  행동: ${item.recommendation}`),
    "",
    "[섹터별 핵심 이슈]",
    ...news.sectorIssues.map((issue) => `- ${issue.sectorLabel}: ${issue.item.title}\n  행동: ${issue.item.recommendation}`),
    "",
    "[티커 행동 우선순위]",
    ...analyses.slice(0, 3).map((analysis) => `- ${analysis.ticker}: ${analysis.recommendation}`)
  ];

  const htmlSections = [
    `<h1>${escapeHtml(subject)}</h1>`,
    `<p>${escapeHtml(previewText)}</p>`,
    `<h2>메인 헤드라인</h2>`,
    headline
      ? `<article><strong>${escapeHtml(headline.title)}</strong><p>${escapeHtml(headline.analysis)}</p><p>${escapeHtml(headline.recommendation)}</p></article>`
      : "<p>핵심 헤드라인이 없습니다.</p>",
    `<h2>파생 기사</h2>`,
    `<ul>${news.derivedArticles
      .map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br />${escapeHtml(item.analysis)}<br />${escapeHtml(item.recommendation)}</li>`)
      .join("")}</ul>`,
    `<h2>섹터별 핵심 이슈</h2>`,
    `<ul>${news.sectorIssues
      .map((issue) => `<li><strong>${escapeHtml(issue.sectorLabel)}</strong> - ${escapeHtml(issue.item.title)}<br />${escapeHtml(issue.item.recommendation)}</li>`)
      .join("")}</ul>`,
    `<h2>티커 행동 우선순위</h2>`,
    `<ul>${analyses
      .slice(0, 3)
      .map((analysis) => `<li><strong>${escapeHtml(analysis.ticker)}</strong> - ${escapeHtml(analysis.recommendation)}</li>`)
      .join("")}</ul>`
  ];

  return {
    cadence: "daily",
    generatedAt,
    nextRunAt: buildNextDailyRun(generatedAt),
    subject,
    previewText,
    to: [],
    bodyText: textSections.join("\n"),
    bodyHtml: htmlSections.join("")
  };
}

export function renderResearchPipelineMarkdown(workspace: Pick<ResearchWorkspaceData, "generatedAt" | "preferences" | "news" | "tickerAnalyses" | "agentPipeline">): string {
  const { runtime } = workspace.agentPipeline;
  const headline = workspace.news.headline;

  const lines = [
    "# Research Pipeline",
    "",
    `- Generated At: ${runtime.generatedAt}`,
    `- Provider: ${runtime.provider}`,
    `- Model: ${runtime.model ?? "n/a"}`,
    `- Source: ${runtime.source}`,
    `- Status: ${runtime.status}`,
    `- Sectors: ${workspace.preferences.sectors.map(getResearchSectorLabel).join(", ") || "n/a"}`,
    `- Tickers: ${workspace.tickerAnalyses.map((analysis) => analysis.ticker).join(", ") || "n/a"}`,
    "",
    "## Main Headline",
    headline ? `- ${headline.title}` : "- headline unavailable",
    headline ? `- Why it matters: ${headline.analysis}` : "- Why it matters: n/a",
    headline ? `- Action: ${headline.recommendation}` : "- Action: n/a",
    "",
    "## Agent Transcript",
    ...runtime.transcript.flatMap((message, index) => [
      `### ${String(index + 1).padStart(2, "0")} ${message.author} -> ${message.audience}`,
      message.text,
      message.references.length > 0 ? `References: ${message.references.join(", ")}` : "References: n/a",
      ""
    ]),
    "## Trader Plan",
    `- Strategy: ${workspace.agentPipeline.actionPlan.strategy}`,
    ...workspace.agentPipeline.actionPlan.recommendedActions.map((item) => `- Do: ${item}`),
    ...workspace.agentPipeline.actionPlan.avoidActions.map((item) => `- Avoid: ${item}`),
    ...workspace.agentPipeline.actionPlan.risks.map((item) => `- Risk: ${item}`)
  ];

  return lines.join("\n");
}

export function buildResearchWorkspace(preferences?: Partial<UserResearchPreferences>): ResearchWorkspaceData {
  const normalizedPreferences = normalizeResearchPreferences(preferences);
  const generatedAt = new Date().toISOString();
  const selectedTickers = buildTickerSelection(normalizedPreferences);
  const allowedSectors = new Set(normalizedPreferences.sectors);

  const eligibleNews = researchNewsWire
    .filter((item) => allowedSectors.has(item.sectorTag))
    .sort((left, right) => right.importanceScore - left.importanceScore);

  const headline = eligibleNews[0] ?? null;
  const derivedArticles = eligibleNews.filter((item) => item.id !== headline?.id).slice(0, 3);
  const sectorIssues = normalizedPreferences.sectors
    .map((sectorTag) => {
      const item = eligibleNews.find((newsItem) => newsItem.sectorTag === sectorTag && newsItem.id !== headline?.id) ?? eligibleNews.find((newsItem) => newsItem.sectorTag === sectorTag);

      if (!item) {
        return null;
      }

      return {
        sectorTag,
        sectorLabel: getResearchSectorLabel(sectorTag),
        item
      };
    })
    .filter((value): value is ResearchSectorIssue => Boolean(value));

  const tickerAnalyses = selectedTickers
    .map((ticker) => tickerAnalysisLibrary.find((analysis) => analysis.ticker === ticker))
    .filter((value): value is TickerAnalysis => Boolean(value))
    .sort((left, right) => right.importanceScore - left.importanceScore);

  const news: ResearchNewsBoard = {
    headline,
    derivedArticles,
    sectorIssues
  };

  const userBehavior = defaultUserBehaviorSignal;
  const agentPipeline = buildAgentPipeline(news, tickerAnalyses, normalizedPreferences, generatedAt);
  const productReview = buildResearchProductReview(agentPipeline, userBehavior, normalizedPreferences, tickerAnalyses);
  const meeting = buildResearchMeetingThread(agentPipeline, productReview, news, tickerAnalyses);
  const newsletter = buildResearchNewsletter(news, tickerAnalyses, generatedAt);

  agentPipeline.runtime.summaryMarkdown = renderResearchPipelineMarkdown({
    generatedAt,
    preferences: normalizedPreferences,
    news,
    tickerAnalyses,
    agentPipeline
  });

  return {
    generatedAt,
    preferences: {
      sectors: normalizedPreferences.sectors,
      tickers: normalizedPreferences.tickers
    },
    focusedTickers: selectedTickers,
    availableSectors: researchSectorOptions,
    availableTickers: researchTickerOptions.filter((ticker) => allowedSectors.has(ticker.sectorTag)),
    userBehavior,
    news,
    tickerAnalyses,
    agentPipeline,
    productReview,
    meeting,
    newsletter
  };
}
