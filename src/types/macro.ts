export interface TimeSeriesPoint {
  time: string;
  value: number;
}

export const MACRO_CATEGORIES = [
  "통화/유동성",
  "금리/채권",
  "환율",
  "원자재",
  "글로벌",
  "위기 신호",
] as const;

export type MacroCategory = (typeof MACRO_CATEGORIES)[number];

export interface MacroIndicator {
  id: string;
  name: string;
  nameKo: string;
  seriesId: string;
  source: "fred" | "ecos" | "yahoo";
  unit: string;
  color: string;
  description: string;
  category: MacroCategory;
  /**
   * 원본 시계열 값에 곱할 스케일. 시리즈 원본 단위가 indicator.unit과
   * 다를 때 사용. 예) WTREGEN은 millions 단위라 B USD로 표시하려면 0.001.
   * 미지정 시 1.
   */
  scale?: number;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  // ===== 통화/유동성 =====
  {
    id: "dxy",
    name: "USD Index (DXY)",
    nameKo: "달러 인덱스",
    seriesId: "DTWEXBGS",
    source: "fred",
    unit: "",
    color: "#22c55e",
    description: "Nominal Broad U.S. Dollar Index. 미국 달러가 주요 교역국 통화 바스켓 대비 어디 있는지를 보여주는 광의 달러 지수. 상승 → 달러 강세, 자산 가격 역풍(특히 신흥국·원자재·금). 하락 → 달러 약세, 위험자산·금·이머징 순풍. 재정 지배·통화 희석 테제의 핵심 검증 지표. 100 기준 위/아래로 달러 강도 판단.",
    category: "통화/유동성",
  },
  {
    id: "us-m2",
    name: "US M2 Money Supply",
    nameKo: "미국 M2 통화량",
    seriesId: "M2SL",
    source: "fred",
    unit: "B USD",
    color: "#60a5fa",
    description: "미국 광의통화 (계절조정). YoY 증가율이 자산 가격에 가장 직접적 영향. +5% 이상 → 위험자산 순풍, -2% 이하 → 위험자산 역풍.",
    category: "통화/유동성",
  },
  {
    id: "kr-m2",
    name: "Korea M2 Money Supply",
    nameKo: "한국 M2 통화량",
    seriesId: "161Y005",
    source: "ecos",
    unit: "십억원",
    color: "#f472b6",
    description: "한국 광의통화 M2 (평잔, 계절조정)",
    category: "통화/유동성",
  },
  {
    id: "tga",
    name: "Treasury General Account",
    nameKo: "재무부 TGA 잔고",
    seriesId: "WTREGEN",
    source: "fred",
    unit: "B USD",
    scale: 0.001,
    color: "#22d3ee",
    description: "미 재무부가 연준에 갖고 있는 일반 운영계좌(Treasury General Account) 잔고. 시장 유동성의 핵심 지표 — 재무부가 세금 받거나 국채 발행해서 TGA를 채우면 그만큼 시장에서 현금이 빠져나감(유동성 흡수), 반대로 재무부가 지출하면 시장에 현금이 풀림(유동성 공급). 부채한도 협상 시기엔 TGA가 바닥났다가 합의 후 급격히 채워지면서 유동성 충격을 일으킴. 일반적으로 TGA가 빠르게 늘면 위험자산에 역풍, 빠르게 줄면 순풍. FRED WTREGEN 시리즈(주간, 수요일 종가). 단위는 백만 달러를 십억 달러로 환산.",
    category: "통화/유동성",
  },
  {
    id: "gold",
    name: "Gold",
    nameKo: "금",
    seriesId: "GC=F",
    source: "yahoo",
    unit: "$/oz",
    color: "#fbbf24",
    description: "금 선물(COMEX). 통화 희석·재정 지배·지정학 위기 헤지의 대표 자산. DXY와 역상관, 실질금리(10Y TIPS)와 강한 역상관. 신흥국 중앙은행 매수세가 구조적 수요로 자리잡으면서 달러 약세 없이도 상승하는 새로운 국면. ATH 갱신은 통화가치 희석 테제 강화 신호.",
    category: "통화/유동성",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    nameKo: "비트코인",
    seriesId: "BTC-USD",
    source: "yahoo",
    unit: "$",
    color: "#f7931a",
    description: "비트코인 (Coinbase USD). 디지털 금 내러티브. 스팟 ETF 출시(2024) + 트럼프 행정부 친화 정책 이후 제도 자산화 진행 중. M2 증가율과 12~18개월 시차 상관관계.",
    category: "통화/유동성",
  },
  // ===== 금리/채권 =====
  {
    id: "us-10y-treasury",
    name: "US 10Y Treasury",
    nameKo: "미국 10년채 금리",
    seriesId: "^TNX",
    source: "yahoo",
    unit: "%",
    color: "#4ade80",
    description: "미국 10년 만기 국채 수익률. 글로벌 자산 가격 결정의 기준점. 4.5% 이상에서 위험자산 역풍, 5% 돌파 시 자산 가격 압박. 인하 사이클과 무관하게 장기금리가 끈질기게 높으면 term premium 부활·재정 지배 신호.",
    category: "금리/채권",
  },
  {
    id: "us-2y-treasury",
    name: "US 2Y Treasury",
    nameKo: "미국 2년채 금리",
    seriesId: "DGS2",
    source: "fred",
    unit: "%",
    color: "#86efac",
    description: "미국 2년 만기 국채 수익률. Fed 정책금리 기대를 가장 직접 반영. 10년물과의 차이가 장단기 스프레드. 2년물이 빠르게 떨어지면 시장이 인하 사이클 임박을 가격에 반영하는 것. 채권 사이클 인플렉션 판단의 핵심.",
    category: "금리/채권",
  },
  {
    id: "yield-spread",
    name: "10Y-2Y Spread",
    nameKo: "장단기 금리차 (10Y-2Y)",
    seriesId: "T10Y2Y",
    source: "fred",
    unit: "%",
    color: "#818cf8",
    description: "10년물-2년물 국채 금리 차이. 양수(정상): 경기 확장 기대. 축소→0 근접: 경기 둔화 신호. 음수(역전): 단기 금리가 장기보다 높은 비정상 상태. 역전 해소(음수→양수) 시점이 오히려 가장 위험 — 연준이 경기 악화를 감지해 급격히 금리를 내리면 단기 금리가 빠르게 떨어져 스프레드가 양수로 전환되는데, 이는 경기가 이미 꺾이고 있다는 의미. 역사적으로 실제 침체는 역전 중이 아니라 역전이 풀린 직후에 시작되는 경우가 많았음.",
    category: "금리/채권",
  },
  {
    id: "mortgage-30y",
    name: "30Y Fixed Mortgage Rate",
    nameKo: "미국 30년 모기지 금리",
    seriesId: "MORTGAGE30US",
    source: "fred",
    unit: "%",
    color: "#fde047",
    description: "미국 30년 고정금리 모기지 평균. 미국 가계 부담의 직접 지표이자 부동산·소비 사이클의 1차 입력값. 10년 국채 + 모기지 스프레드로 결정됨. 7% 이상 유지 시 주택 거래량 급감 → 가계 자산 효과 약화 → 소비 둔화. 5%대로 내려오는 게 경기 회복 변곡점.",
    category: "금리/채권",
  },
  {
    id: "us-high-yield",
    name: "US High Yield",
    nameKo: "미국 하이일드 금리",
    seriesId: "BAMLH0A0HYM2EY",
    source: "fred",
    unit: "%",
    color: "#fb7185",
    description: "ICE BofA US High Yield Index Effective Yield. BB+ 이하 투기등급(정크본드) 회사채의 평균 수익률. 10년 국채와의 차이가 '하이일드 스프레드'로, 신용 위험을 반영. 스프레드 확대 → 부도 우려 증가(경기 악화 신호), 스프레드 축소 → 위험선호 심리(경기 호조). 경기 선행지표로 자주 인용됨.",
    category: "금리/채권",
  },
  {
    id: "us-high-yield-spread",
    name: "US High Yield Spread (OAS)",
    nameKo: "미국 하이일드 스프레드",
    seriesId: "BAMLH0A0HYM2",
    source: "fred",
    unit: "%",
    color: "#e11d48",
    description: "ICE BofA US High Yield Index Option-Adjusted Spread (OAS). 하이일드 채권 수익률과 동일 만기 미국 국채 수익률의 차이로, 시장이 요구하는 신용 위험 프리미엄을 직접 보여줌. 절대 금리(하이일드 금리)는 국채 금리 변동에도 영향을 받기 때문에, 순수 신용 위험을 보려면 스프레드를 봐야 함. 평상시 3~5% 수준, 6%+ 경계, 8%+ 위기 신호, 10%+ 침체 진입(2008·2020). 스프레드가 빠르게 벌어지면 위험자산 회피 심리가 강해지고 있다는 뜻이라 주식·크레딧 시장 선행 신호로 사용됨.",
    category: "금리/채권",
  },
  // ===== 환율 =====
  {
    id: "usd-krw",
    name: "USD/KRW",
    nameKo: "원/달러 환율",
    seriesId: "KRW=X",
    source: "yahoo",
    unit: "₩",
    color: "#fbbf24",
    description: "1달러당 원화. 한국 산업 경쟁력 약화·인구 구조 악화의 거울. 1,400 돌파 후 안착 시 USD 자산 추가 환전 페이스 감소(고점 분할 매수 룰). KRW 약세는 한국 자산 측면에선 인풋 비용, 한국 수출 측면에선 가격 경쟁력.",
    category: "환율",
  },
  {
    id: "usd-cny",
    name: "USD/CNY",
    nameKo: "달러/위안 환율",
    seriesId: "CNY=X",
    source: "yahoo",
    unit: "¥",
    color: "#ef4444",
    description: "1달러당 위안. PBoC가 7.2~7.3 부근에서 방어하지만 디플레 수출·자본 이탈 압력으로 약세 압력 상존. CNY 약세 → 중국 수출 가격 경쟁력 강화 → 한국·독일 등 경쟁국 수출 마진 압박. 중국 디플레 수출 테제의 핵심 검증 지표.",
    category: "환율",
  },
  {
    id: "usd-jpy",
    name: "USD/JPY",
    nameKo: "달러/엔 환율",
    seriesId: "JPY=X",
    source: "yahoo",
    unit: "¥",
    color: "#a855f7",
    description: "1달러당 엔. BOJ 정책 정상화에도 미일 금리차 때문에 엔 약세 지속. 150~160 박스권. 엔 약세는 일본 수출 기업 호재 + DXJ(환헤지 일본주식) 강세 요인. 엔 캐리 트레이드 unwind 트리거(BOJ 매파 급변 시) 변동성 폭발 주의.",
    category: "환율",
  },
  // ===== 원자재 =====
  {
    id: "wti",
    name: "WTI Crude Oil",
    nameKo: "WTI 유가",
    seriesId: "CL=F",
    source: "yahoo",
    unit: "$/bbl",
    color: "#fb923c",
    description: "서부 텍사스 중질유. 미국 에너지 정책·인플레 압력의 1차 입력. $90 돌파 + 추세 상승 시 DBC(원자재 ETF) 비중 확대 시그널.",
    category: "원자재",
  },
  {
    id: "brent",
    name: "Brent Crude Oil",
    nameKo: "Brent 유가",
    seriesId: "BZ=F",
    source: "yahoo",
    unit: "$/bbl",
    color: "#a78bfa",
    description: "브렌트유. 글로벌 유가 벤치마크. WTI와의 스프레드($3~5)가 미국 셰일 공급의 글로벌 영향력 가늠자.",
    category: "원자재",
  },
  {
    id: "copper",
    name: "Copper",
    nameKo: "구리",
    seriesId: "HG=F",
    source: "yahoo",
    unit: "$/lb",
    color: "#f97316",
    description: "구리 선물(COMEX). '닥터 코퍼' — 글로벌 제조업 경기의 가장 민감한 지표이자 동시에 전기화(EV·데이터센터·송전망) 구조적 수요의 수혜자. 단기는 중국 수요, 장기는 AI 인프라·에너지 전환. 구리/금 비율은 위험선호 측정 도구.",
    category: "원자재",
  },
  {
    id: "natural-gas",
    name: "Natural Gas",
    nameKo: "천연가스",
    seriesId: "NG=F",
    source: "yahoo",
    unit: "$/MMBtu",
    color: "#06b6d4",
    description: "Henry Hub 천연가스 선물. AI 데이터센터 전력 수요의 1차 수혜 에너지원(원전 buildout 전까지의 브릿지). LNG 글로벌 수출 buildout으로 미국 가스 가격이 유럽·아시아 가스 가격과 동조화 진행 중. 동절기 수요·LNG 수출량·재고 3변수가 가격 결정.",
    category: "원자재",
  },
  // ===== 글로벌 =====
  {
    id: "nikkei-225",
    name: "Nikkei 225",
    nameKo: "닛케이 225",
    seriesId: "^N225",
    source: "yahoo",
    unit: "¥",
    color: "#e879f9",
    description: "일본 대표 주가지수. 30년 디플레 탈출·BOJ 정책 정상화·기업 거버넌스 개혁·버핏의 일본 상사주 베팅이 결합된 일본 리플레이션 테제의 검증 지표. 환헤지 안 하면 엔 약세에 수익 잠식 — DXJ로 표현하는 게 일반적.",
    category: "글로벌",
  },
  // ===== 위기 신호 =====
  {
    id: "vix",
    name: "VIX",
    nameKo: "VIX 공포지수",
    seriesId: "^VIX",
    source: "yahoo",
    unit: "",
    color: "#f87171",
    description: "S&P 500 옵션의 내재변동성 지수. 20 이하: 안정, 20~30: 경계, 30 이상: 공포 구간. 40+에서 역발상 매수 기회 자주 발생(2020-03, 2022-10).",
    category: "위기 신호",
  },
  {
    id: "cre-delinquency",
    name: "CRE Delinquency Rate",
    nameKo: "상업용 부동산 연체율",
    seriesId: "DRCRELACBS",
    source: "fred",
    unit: "%",
    color: "#dc2626",
    description: "Delinquency Rate on Commercial Real Estate Loans (Booked in Domestic Offices). 미국 상업용 부동산 대출 연체율. 오피스 공실률 사상 최고 + 5년 만기 대출 차환 시 금리 2배 = 슬로우 모션 위기. 지역은행(KRE) CRE 노출이 시스템 리스크. 2%+ 경계, 3%+ 위기. 갑작스러운 급등이 신용경색 트리거.",
    category: "위기 신호",
  },
];
