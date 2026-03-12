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
  {
    id: "ackman",
    name: "Bill Ackman",
    nameKo: "빌 애크먼",
    entity: "Pershing Square Capital Management",
    cik: "0001336528",
  },
  {
    id: "soros",
    name: "George Soros",
    nameKo: "조지 소로스",
    entity: "Soros Fund Management",
    cik: "0001029160",
  },
  {
    id: "burry",
    name: "Michael Burry",
    nameKo: "마이클 버리",
    entity: "Scion Asset Management",
    cik: "0001649339",
  },
  {
    id: "tepper",
    name: "David Tepper",
    nameKo: "데이비드 테퍼",
    entity: "Appaloosa Management",
    cik: "0001006438",
  },
  {
    id: "einhorn",
    name: "David Einhorn",
    nameKo: "데이비드 아인혼",
    entity: "Greenlight Capital",
    cik: "0001079114",
  },
  {
    id: "loeb",
    name: "Dan Loeb",
    nameKo: "댄 로엡",
    entity: "Third Point",
    cik: "0001040273",
  },
  {
    id: "klarman",
    name: "Seth Klarman",
    nameKo: "세스 클라만",
    entity: "Baupost Group",
    cik: "0001061768",
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    nameKo: "레이 달리오",
    entity: "Bridgewater Associates",
    cik: "0001350694",
  },
  {
    id: "cathie-wood",
    name: "Cathie Wood",
    nameKo: "캐시 우드",
    entity: "ARK Investment Management",
    cik: "0001697748",
  },
] as const;
