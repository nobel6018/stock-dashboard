export interface Holding {
  name: string;
  ticker?: string;
  cusip?: string;
  value: number;
  shares: number;
  weight: number;
  change?: "new" | "add" | "reduce" | "sold" | "unchanged";
}

export interface InvestorPortfolio {
  investorName: string;
  investorNameKo: string;
  cik?: string;
  dataromaCode?: string;
  filingDate: string;
  quarterEnd: string;
  totalValue: number;
  holdings: Holding[];
}

export interface CommonStock {
  name: string;
  ticker?: string;
  holders: { investorName: string; weight: number }[];
  holderCount: number;
  averageWeight: number;
}

export const INVESTORS = [
  {
    id: "druckenmiller",
    name: "Stanley Druckenmiller",
    nameKo: "스탠리 드러켄밀러",
    entity: "Duquesne Family Office",
    cik: "0001536411",
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    nameKo: "워렌 버핏",
    entity: "Berkshire Hathaway",
    cik: "0001067983",
  },
] as const;
