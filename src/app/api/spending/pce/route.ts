import { NextRequest, NextResponse } from "next/server";
import { fetchFredSeries } from "@/lib/api/fred";

export const revalidate = 86400;

/**
 * 미국 PCE(Personal Consumption Expenditures) 월별 시계열을 반환한다.
 *
 * - FRED 시리즈: PCE (월별, 명목, billions USD).
 * - period 파라미터: 1Y, 3Y, 5Y, 10Y, All
 *
 * 주/일 단위는 BEA가 발표하지 않으므로 지원 불가.
 */
export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || "5Y";

  let startDate: string | undefined;
  const yearMatch = period.match(/^(\d+)Y$/);
  if (period === "All") {
    startDate = undefined;
  } else if (yearMatch) {
    const years = parseInt(yearMatch[1], 10);
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    startDate = d.toISOString().split("T")[0];
  } else {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const raw = await fetchFredSeries("PCE", startDate);
    // billions → trillions로 환산해서 일관성 유지
    const data = raw.map((p) => ({ time: p.time, value: p.value / 1000 }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch PCE:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
