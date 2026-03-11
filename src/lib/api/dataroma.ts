import { Holding } from "@/types/portfolio";

const DATAROMA_BASE = "https://www.dataroma.com/m";

export async function fetchDataromaHoldings(
  managerCode: string,
): Promise<Holding[]> {
  const url = `${DATAROMA_BASE}/holdings.php?m=${managerCode}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Dataroma error: ${res.status}`);
  }

  const html = await res.text();
  return parseDataromaTable(html);
}

function parseDataromaTable(html: string): Holding[] {
  const holdings: Holding[] = [];

  const tableMatch = html.match(
    /<table[^>]*id="grid"[^>]*>([\s\S]*?)<\/table>/i,
  );
  if (!tableMatch) return [];

  const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!rows) return [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cells || cells.length < 5) continue;

    const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").trim();

    const nameCell = stripHtml(cells[1]);
    const tickerMatch = nameCell.match(/^(.*?)\s*-\s*(.*)$/);
    const name = tickerMatch ? tickerMatch[2].trim() : nameCell;
    const ticker = tickerMatch ? tickerMatch[1].trim() : undefined;

    const weightStr = stripHtml(cells[2]).replace("%", "");
    const weight = parseFloat(weightStr) || 0;

    const sharesStr = stripHtml(cells[4]).replace(/,/g, "");
    const shares = parseInt(sharesStr, 10) || 0;

    const valueStr = stripHtml(cells[3]).replace(/[$,]/g, "");
    const value = parseInt(valueStr, 10) || 0;

    let change: Holding["change"] = "unchanged";
    const activityCell = stripHtml(cells[5] || "").toLowerCase();
    if (activityCell.includes("new")) change = "new";
    else if (activityCell.includes("add")) change = "add";
    else if (activityCell.includes("reduce")) change = "reduce";
    else if (activityCell.includes("sold")) change = "sold";

    holdings.push({ name, ticker, value, shares, weight, change });
  }

  return holdings;
}

export async function fetchSuperinvestorList(): Promise<
  { name: string; code: string }[]
> {
  const res = await fetch(`${DATAROMA_BASE}/managers.php`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const html = await res.text();
  const managers: { name: string; code: string }[] = [];
  const regex = /holdings\.php\?m=([^"&]+)[^>]*>([^<]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    managers.push({ code: match[1], name: match[2].trim() });
  }

  return managers;
}
