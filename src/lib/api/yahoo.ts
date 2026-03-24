// yahoo-finance2 v3: must instantiate with new
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;

import { IndexData, SectorData, MAJOR_INDICES, SECTOR_ETFS } from "@/types/market";
import { TimeSeriesPoint } from "@/types/macro";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

interface YFQuote {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
}

interface YFChartQuote {
  date: Date;
  close?: number | null;
}

interface YFChartResult {
  quotes: YFChartQuote[];
}

export async function fetchIndices(): Promise<IndexData[]> {
  const results: IndexData[] = [];

  for (const idx of MAJOR_INDICES) {
    try {
      const quote: YFQuote = await yf.quote(idx.symbol);
      results.push({
        symbol: idx.symbol,
        name: idx.name,
        nameKo: idx.nameKo,
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        changePercent: quote.regularMarketChangePercent ?? 0,
        volume: quote.regularMarketVolume ?? undefined,
      });
    } catch (e) {
      console.error(`Failed to fetch ${idx.symbol}:`, e);
    }
  }

  return results;
}

export async function fetchYahooMacroSeries(
  symbol: string,
  startDate: string,
): Promise<TimeSeriesPoint[]> {
  const result: YFChartResult = await yf.chart(symbol, {
    period1: startDate,
    interval: "1d",
  });

  return result.quotes
    .filter((q: YFChartQuote) => q.close != null)
    .map((q: YFChartQuote) => ({
      time: q.date.toISOString().split("T")[0],
      value: q.close as number,
    }));
}

export async function fetchSectors(): Promise<SectorData[]> {
  const results: SectorData[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  for (const sector of SECTOR_ETFS) {
    try {
      const [quote, history]: [YFQuote, YFChartResult] = await Promise.all([
        yf.quote(sector.symbol),
        yf.chart(sector.symbol, {
          period1: threeMonthsAgo.toISOString().split("T")[0],
          interval: "1d",
        }),
      ]);

      const closes = history.quotes.filter(
        (q: YFChartQuote) => q.close != null,
      );
      const currentPrice = quote.regularMarketPrice ?? 0;

      const oneMonthIdx = closes.findIndex(
        (q: YFChartQuote) => new Date(q.date) >= oneMonthAgo,
      );
      const oneMonthPrice =
        oneMonthIdx >= 0 ? (closes[oneMonthIdx].close ?? currentPrice) : currentPrice;
      const threeMonthPrice = closes.length > 0 ? (closes[0].close ?? currentPrice) : currentPrice;

      results.push({
        symbol: sector.symbol,
        name: sector.name,
        nameKo: sector.nameKo,
        return1M:
          oneMonthPrice > 0
            ? ((currentPrice - oneMonthPrice) / oneMonthPrice) * 100
            : 0,
        return3M:
          threeMonthPrice > 0
            ? ((currentPrice - threeMonthPrice) / threeMonthPrice) * 100
            : 0,
        dailyChange: quote.regularMarketChangePercent ?? 0,
      });
    } catch (e) {
      console.error(`Failed to fetch sector ${sector.symbol}:`, e);
    }
  }

  return results;
}
