import { Holding, InvestorPortfolio } from "@/types/portfolio";

const EDGAR_BASE = "https://data.sec.gov";
const USER_AGENT = "StockDashboard contact@example.com";

interface EdgarFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  primaryDocument: string;
}

export async function fetchLatest13F(cik: string): Promise<EdgarFiling | null> {
  const res = await fetch(`${EDGAR_BASE}/submissions/CIK${cik}.json`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`EDGAR submissions error: ${res.status}`);
  }

  const data = await res.json();
  const recent = data.filings.recent;

  for (let i = 0; i < recent.form.length; i++) {
    if (recent.form[i] === "13F-HR") {
      return {
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
        primaryDocument: recent.primaryDocument[i],
      };
    }
  }

  return null;
}

export async function fetch13FHoldings(
  cik: string,
  accessionNumber: string,
): Promise<Holding[]> {
  const accessionPath = accessionNumber.replace(/-/g, "");
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, "")}/${accessionPath}`;
  const indexUrl = `${baseUrl}/${accessionNumber}-index.htm`;

  const indexRes = await fetch(indexUrl, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!indexRes.ok) {
    throw new Error(`EDGAR index error: ${indexRes.status}`);
  }

  const indexHtml = await indexRes.text();

  // Find the holdings XML: could be infotable.xml, form13f_*.xml, etc.
  // Exclude primary_doc.xml (cover page) and xslForm paths (HTML renders)
  const allXmlLinks = Array.from(
    indexHtml.matchAll(/href="([^"]*\.xml)"/gi),
    (m) => m[1],
  ).filter(
    (href) =>
      !href.includes("primary_doc") && !href.includes("xslForm"),
  );

  if (allXmlLinks.length === 0) {
    return [];
  }

  // Use the first non-primary XML (this is the infotable/holdings file)
  const xmlHref = allXmlLinks[0];
  const xmlUrl = xmlHref.startsWith("/")
    ? `https://www.sec.gov${xmlHref}`
    : `${baseUrl}/${xmlHref}`;

  const xmlRes = await fetch(xmlUrl, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!xmlRes.ok) {
    throw new Error(`EDGAR XML error: ${xmlRes.status}`);
  }

  const xmlText = await xmlRes.text();
  return parseInfoTable(xmlText);
}

function parseInfoTable(xml: string): Holding[] {
  const rawEntries: { name: string; cusip: string; rawValue: number; shares: number }[] = [];
  const entryRegex = /<(?:[a-z0-9]+:)?infoTable[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?infoTable>/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const name = extractTag(entry, "nameOfIssuer") || "";
    const cusip = extractTag(entry, "cusip") || "";
    const rawValue = parseInt(extractTag(entry, "value") || "0", 10);
    const shares = parseInt(extractTag(entry, "sshPrnamt") || "0", 10);
    rawEntries.push({ name, cusip, rawValue, shares });
  }

  // Detect if values are in thousands (standard) or dollars (some large filers like Berkshire)
  // Heuristic: check median price-per-share assuming thousands. If > $50,000, values are in dollars.
  const pricesIfThousands = rawEntries
    .filter((e) => e.shares > 0)
    .map((e) => (e.rawValue * 1000) / e.shares);
  const sorted = pricesIfThousands.sort((a, b) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  const multiplier = median > 50000 ? 1 : 1000;

  // Aggregate by CUSIP (some filers like Berkshire report same stock across multiple managers)
  const cusipMap = new Map<string, { name: string; cusip: string; value: number; shares: number }>();
  for (const e of rawEntries) {
    const key = e.cusip || e.name;
    const existing = cusipMap.get(key);
    if (existing) {
      existing.value += e.rawValue * multiplier;
      existing.shares += e.shares;
    } else {
      cusipMap.set(key, {
        name: e.name,
        cusip: e.cusip,
        value: e.rawValue * multiplier,
        shares: e.shares,
      });
    }
  }

  const holdings: Holding[] = Array.from(cusipMap.values()).map((e) => ({
    name: e.name,
    cusip: e.cusip,
    value: e.value,
    shares: e.shares,
    weight: 0,
  }));

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  for (const h of holdings) {
    h.weight = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
  }

  holdings.sort((a, b) => b.value - a.value);

  return holdings;
}

function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<(?:[a-z]+:)?${tagName}[^>]*>([^<]*)<`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

export async function getInvestorPortfolio(
  investorName: string,
  investorNameKo: string,
  cik: string,
): Promise<InvestorPortfolio | null> {
  const filing = await fetchLatest13F(cik);
  if (!filing) return null;

  const holdings = await fetch13FHoldings(cik, filing.accessionNumber);

  return {
    investorName,
    investorNameKo,
    cik,
    filingDate: filing.filingDate,
    quarterEnd: filing.reportDate,
    totalValue: holdings.reduce((sum, h) => sum + h.value, 0),
    holdings,
  };
}
