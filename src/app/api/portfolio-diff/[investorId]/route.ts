import { NextResponse } from "next/server";
import { getInvestorDiff } from "@/lib/api/edgar";
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
    const diff = await getInvestorDiff(
      investor.name,
      investor.nameKo,
      investor.cik,
    );
    if (!diff) {
      return NextResponse.json(
        { error: "Not enough 13F filings (need 2)" },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: diff });
  } catch (error) {
    console.error(`Failed diff for ${investorId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch diff" },
      { status: 500 },
    );
  }
}
