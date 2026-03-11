import { NextResponse } from "next/server";
import { fetchFearGreed } from "@/lib/api/feargreed";

export async function GET() {
  try {
    const data = await fetchFearGreed();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch Fear & Greed:", error);
    return NextResponse.json(
      { error: "Failed to fetch Fear & Greed data" },
      { status: 500 },
    );
  }
}
