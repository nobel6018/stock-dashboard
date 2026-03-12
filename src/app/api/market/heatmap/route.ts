import { NextResponse } from "next/server";
import { SP500_TOP_STOCKS } from "@/lib/data/sp500-stocks";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const revalidate = 300;

export interface HeatmapStock {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  changePercent: number;
}

export async function GET() {
  try {
    const symbols = SP500_TOP_STOCKS.map((s) => s.symbol);
    const quotes = await yf.quote(symbols);

    const data: HeatmapStock[] = [];

    for (const q of quotes) {
      const def = SP500_TOP_STOCKS.find((s) => s.symbol === q.symbol);
      if (!def) continue;

      data.push({
        symbol: q.symbol,
        name: def.name,
        sector: def.sector,
        marketCap: q.marketCap ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch heatmap data:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 },
    );
  }
}
