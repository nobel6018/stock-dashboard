import { NextResponse } from "next/server";
import { fetchYahooMacroSeries, fetchQuotes } from "@/lib/api/yahoo";
import { fetchFredSeries } from "@/lib/api/fred";
import type { PortfolioSignalsResponse } from "@/types/my-portfolio";

function getStartDate(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split("T")[0];
}

function last(arr: { value: number }[]): number | null {
  return arr.length > 0 ? arr[arr.length - 1].value : null;
}

export async function GET() {
  try {
    const [
      wtiHistory,
      treasury10yHistory,
      vixHistory,
      nasdaqHistory,
      fedRateHistory,
      etfPrices,
    ] = await Promise.all([
      fetchYahooMacroSeries("CL=F", getStartDate(12)),
      fetchYahooMacroSeries("^TNX", getStartDate(12)),
      fetchYahooMacroSeries("^VIX", getStartDate(12)),
      fetchYahooMacroSeries("^NDX", getStartDate(14)),
      fetchFredSeries("FEDFUNDS", getStartDate(12)),
      fetchQuotes(["QQQ", "QLD", "TQQQ", "GLD", "SHY"]),
    ]);

    // VIX 5일 평균
    const vixRecent5 = vixHistory.slice(-5);
    const vixAvg5 =
      vixRecent5.length > 0
        ? vixRecent5.reduce((s, p) => s + p.value, 0) / vixRecent5.length
        : null;

    // 나스닥 200일 이동평균, 52주 고/저
    const nasdaqCloses = nasdaqHistory.map((p) => p.value);
    const ma200 =
      nasdaqCloses.length >= 200
        ? nasdaqCloses.slice(-200).reduce((s, v) => s + v, 0) / 200
        : null;
    const tradingDays252 = nasdaqCloses.slice(-252);
    const low52w =
      tradingDays252.length > 0 ? Math.min(...tradingDays252) : null;
    const high52w =
      tradingDays252.length > 0 ? Math.max(...tradingDays252) : null;

    // 연준 금리: 현재, 3개월 전, 6개월 전
    const fedCurrent = last(fedRateHistory);
    const fedThreeMonthsAgo =
      fedRateHistory.length >= 4
        ? fedRateHistory[fedRateHistory.length - 4].value
        : null;
    const fedSixMonthsAgo =
      fedRateHistory.length >= 7
        ? fedRateHistory[fedRateHistory.length - 7].value
        : null;

    const response: PortfolioSignalsResponse = {
      signals: {
        wti: { current: last(wtiHistory), history: wtiHistory },
        treasury10y: {
          current: last(treasury10yHistory),
          history: treasury10yHistory,
        },
        vix: { current: last(vixHistory), avg5: vixAvg5, history: vixHistory },
      },
      etfPrices,
      nasdaq: {
        current: last(nasdaqHistory.slice(-1).length > 0 ? nasdaqHistory : []),
        ma200: ma200 ? Math.round(ma200 * 100) / 100 : null,
        low52w,
        high52w,
      },
      fedRate: {
        current: fedCurrent,
        threeMonthsAgo: fedThreeMonthsAgo,
        sixMonthsAgo: fedSixMonthsAgo,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch portfolio signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio signals" },
      { status: 500 },
    );
  }
}
