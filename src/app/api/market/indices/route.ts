import { NextResponse } from "next/server";
import { fetchIndices } from "@/lib/api/yahoo";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchIndices();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch indices:", error);
    return NextResponse.json(
      { error: "Failed to fetch indices" },
      { status: 500 },
    );
  }
}
