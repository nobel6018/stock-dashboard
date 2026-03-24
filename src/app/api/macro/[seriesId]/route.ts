import { NextRequest, NextResponse } from "next/server";
import { fetchFredSeries, getStartDateForPeriod } from "@/lib/api/fred";
import { fetchEcosSeries, getEcosDateRange } from "@/lib/api/ecos";
import { fetchYahooMacroSeries } from "@/lib/api/yahoo";
import { MACRO_INDICATORS } from "@/types/macro";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const { seriesId } = await params;
  const period = req.nextUrl.searchParams.get("period") || "1Y";

  const indicator = MACRO_INDICATORS.find((i) => i.id === seriesId);
  if (!indicator) {
    return NextResponse.json({ error: "Unknown indicator" }, { status: 404 });
  }

  try {
    if (indicator.source === "fred") {
      const startDate = getStartDateForPeriod(period);
      const data = await fetchFredSeries(indicator.seriesId, startDate);
      return NextResponse.json({ data });
    }

    if (indicator.source === "yahoo") {
      const startDate = getStartDateForPeriod(period);
      const data = await fetchYahooMacroSeries(indicator.seriesId, startDate);
      return NextResponse.json({ data });
    }

    if (indicator.source === "ecos") {
      const { start, end } = getEcosDateRange(period);
      const data = await fetchEcosSeries(indicator.seriesId, start, end);
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Unknown source" }, { status: 400 });
  } catch (error) {
    console.error(`Failed to fetch ${seriesId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
