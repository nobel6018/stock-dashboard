import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Sanitize id to prevent path traversal
  if (!/^\d+$/.test(id)) {
    return new NextResponse("Invalid id", { status: 400 });
  }

  try {
    const filePath = join(
      process.cwd(),
      "src/lib/data/summaries",
      `${id}.html`
    );
    const content = readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
