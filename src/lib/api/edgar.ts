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
  const filings = await fetchRecent13Fs(cik, 1);
  return filings[0] ?? null;
}

export async function fetchRecent13Fs(
  cik: string,
  count = 2,
): Promise<EdgarFiling[]> {
  const res = await fetch(`${EDGAR_BASE}/submissions/CIK${cik}.json`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`EDGAR submissions error: ${res.status}`);
  }

  const data = await res.json();
  const recent = data.filings.recent;
  const filings: EdgarFiling[] = [];

  for (let i = 0; i < recent.form.length && filings.length < count; i++) {
    if (recent.form[i] === "13F-HR") {
      filings.push({
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
        primaryDocument: recent.primaryDocument[i],
      });
    }
  }

  return filings;
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
  const regex = new RegExp(`<(?:[a-z0-9]+:)?${tagName}[^>]*>([^<]*)<`, "i");
  const match = regex.exec(xml);
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
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

export interface PortfolioChange {
  name: string;
  cusip?: string;
  currValue: number;
  prevValue: number;
  currShares: number;
  prevShares: number;
  currWeight: number;
  prevWeight: number;
  changeType: "new" | "exited" | "increased" | "decreased" | "unchanged";
  sharesPct: number;
}

export interface PortfolioDiff {
  investorName: string;
  investorNameKo: string;
  cik: string;
  currQuarter: string;
  prevQuarter: string;
  currTotal: number;
  prevTotal: number;
  currCount: number;
  prevCount: number;
  newPositions: PortfolioChange[];
  exited: PortfolioChange[];
  increased: PortfolioChange[];
  decreased: PortfolioChange[];
  topCurr: Holding[];
}

export async function getInvestorDiff(
  investorName: string,
  investorNameKo: string,
  cik: string,
): Promise<PortfolioDiff | null> {
  const filings = await fetchRecent13Fs(cik, 2);
  if (filings.length < 2) return null;

  const [currFiling, prevFiling] = filings;
  const [curr, prev] = await Promise.all([
    fetch13FHoldings(cik, currFiling.accessionNumber),
    fetch13FHoldings(cik, prevFiling.accessionNumber),
  ]);

  const prevMap = new Map(prev.map((h) => [h.cusip || h.name, h]));
  const currMap = new Map(curr.map((h) => [h.cusip || h.name, h]));

  const newPositions: PortfolioChange[] = [];
  const exited: PortfolioChange[] = [];
  const increased: PortfolioChange[] = [];
  const decreased: PortfolioChange[] = [];

  for (const c of curr) {
    const key = c.cusip || c.name;
    const p = prevMap.get(key);
    if (!p) {
      newPositions.push({
        name: c.name,
        cusip: c.cusip,
        currValue: c.value,
        prevValue: 0,
        currShares: c.shares,
        prevShares: 0,
        currWeight: c.weight,
        prevWeight: 0,
        changeType: "new",
        sharesPct: 100,
      });
    } else {
      const sharesPct =
        p.shares > 0 ? ((c.shares - p.shares) / p.shares) * 100 : 0;
      if (Math.abs(sharesPct) < 5) continue;
      const change: PortfolioChange = {
        name: c.name,
        cusip: c.cusip,
        currValue: c.value,
        prevValue: p.value,
        currShares: c.shares,
        prevShares: p.shares,
        currWeight: c.weight,
        prevWeight: p.weight,
        changeType: sharesPct > 0 ? "increased" : "decreased",
        sharesPct,
      };
      if (sharesPct > 0) increased.push(change);
      else decreased.push(change);
    }
  }

  for (const p of prev) {
    const key = p.cusip || p.name;
    if (!currMap.has(key)) {
      exited.push({
        name: p.name,
        cusip: p.cusip,
        currValue: 0,
        prevValue: p.value,
        currShares: 0,
        prevShares: p.shares,
        currWeight: 0,
        prevWeight: p.weight,
        changeType: "exited",
        sharesPct: -100,
      });
    }
  }

  newPositions.sort((a, b) => b.currValue - a.currValue);
  exited.sort((a, b) => b.prevValue - a.prevValue);
  increased.sort((a, b) => b.currValue - b.prevValue - (a.currValue - a.prevValue));
  decreased.sort((a, b) => a.currValue - a.prevValue - (b.currValue - b.prevValue));

  return {
    investorName,
    investorNameKo,
    cik,
    currQuarter: currFiling.reportDate,
    prevQuarter: prevFiling.reportDate,
    currTotal: curr.reduce((s, h) => s + h.value, 0),
    prevTotal: prev.reduce((s, h) => s + h.value, 0),
    currCount: curr.length,
    prevCount: prev.length,
    newPositions,
    exited,
    increased,
    decreased,
    topCurr: curr.slice(0, 10),
  };
}
