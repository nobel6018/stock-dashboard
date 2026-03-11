import { NextResponse } from "next/server";
import { getInvestorPortfolio } from "@/lib/api/edgar";
import { INVESTORS } from "@/types/portfolio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ investorId: string }> },
) {
  const { investorId } = await params;

  const investor = INVESTORS.find((i) => i.id === investorId);
  if (!investor) {
    return NextResponse.json({ error: "Unknown investor" }, { status: 404 });
  }

  try {
    const portfolio = await getInvestorPortfolio(
      investor.name,
      investor.nameKo,
      investor.cik,
    );

    if (!portfolio) {
      return NextResponse.json(
        { error: "No 13F filing found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: portfolio });
  } catch (error) {
    console.error(`Failed to fetch portfolio for ${investorId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 },
    );
  }
}
