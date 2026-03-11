import { NextResponse } from "next/server";
import { fetchSectors } from "@/lib/api/yahoo";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchSectors();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch sectors:", error);
    return NextResponse.json(
      { error: "Failed to fetch sectors" },
      { status: 500 },
    );
  }
}
