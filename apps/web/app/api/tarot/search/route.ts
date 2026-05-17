import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  quoteType?: string;
}

interface YahooSearchResponse {
  quotes?: YahooSearchQuote[];
}

// Yahoo Finance 종목 검색 — 타로앱 전용 (구버전 @trading/shared 의존성 제거)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const market = req.nextUrl.searchParams.get("market"); // "US" | "KR" | undefined

  if (!q || q.length < 1) return NextResponse.json({ results: [] });

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=ko-KR&region=KR&quotesCount=10&newsCount=0&enableFuzzyQuery=true`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TarotStockBot/1.0)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4_000),
    });

    if (!res.ok) throw new Error(`Yahoo search failed: ${res.status}`);

    const data = (await res.json()) as YahooSearchResponse;
    const quotes = data.quotes ?? [];

    // 주식/ETF만 필터 (EQUITY, ETF, CRYPTOCURRENCY 제외)
    const filtered = quotes.filter(
      (q) => q.quoteType === "EQUITY" || q.quoteType === "ETF"
    );

    // 마켓 필터 (KR은 .KS / .KQ 포함)
    const marketFiltered = market
      ? filtered.filter((q) => {
          if (market === "KR") return q.symbol.endsWith(".KS") || q.symbol.endsWith(".KQ");
          if (market === "US") return !q.symbol.includes(".");
          return true;
        })
      : filtered;

    return NextResponse.json({
      results: marketFiltered.map((q) => ({
        ticker: q.symbol,
        label: q.shortname ?? q.longname ?? q.symbol,
        market: q.symbol.endsWith(".KS") || q.symbol.endsWith(".KQ") ? "KR" : "US",
        exchange: q.exchDisp ?? "",
      })),
    });
  } catch (err) {
    console.error("[tarot/search] Yahoo Finance error:", err);

    // 폴백: 하드코딩 인기 종목
    const FALLBACK = [
      { ticker: "AAPL", label: "Apple Inc.", market: "US", exchange: "NASDAQ" },
      { ticker: "NVDA", label: "NVIDIA Corporation", market: "US", exchange: "NASDAQ" },
      { ticker: "TSLA", label: "Tesla Inc.", market: "US", exchange: "NASDAQ" },
      { ticker: "MSFT", label: "Microsoft Corporation", market: "US", exchange: "NASDAQ" },
      { ticker: "005930.KS", label: "삼성전자", market: "KR", exchange: "KRX" },
      { ticker: "000660.KS", label: "SK하이닉스", market: "KR", exchange: "KRX" },
    ].filter((r) =>
      r.label.toLowerCase().includes(q.toLowerCase()) ||
      r.ticker.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json({ results: FALLBACK });
  }
}
