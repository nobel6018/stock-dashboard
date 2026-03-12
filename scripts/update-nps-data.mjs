#!/usr/bin/env node

/**
 * 국민연금 투자정보 업데이트 스크립트
 *
 * 5개 API 데이터를 가져와 nps-holdings.json에 저장:
 * 1. 기금 포트폴리오 현황 (자산배분 + 연도별 추이)
 * 2. 해외주식 투자정보 (종목별 Top 20)
 * 3. 국내주식 투자정보 (종목별 Top 20)
 * 4. 해외채권 투자정보 (종목별 Top 20)
 * 5. 국내채권 투자정보 (발행기관별 Top 20)
 *
 * 실행: npm run update-nps
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

config({ path: resolve(ROOT, ".env.local") });

const API_KEY = process.env.DATA_GO_KR_API_KEY;
if (!API_KEY) {
  console.error("ERROR: DATA_GO_KR_API_KEY가 .env.local에 설정되지 않았습니다.");
  process.exit(1);
}

const OUTPUT_PATH = resolve(ROOT, "src/lib/data/nps-holdings.json");

// --- 엔드포인트 정의 ---

// 기금 포트폴리오 현황 (월별, 최신순)
const PORTFOLIO_ENDPOINTS = [
  { date: "2025-05", uddi: "uddi:c4d6ba7c-c8d8-457c-9084-b2a6eb3c68ec", ns: "15106894" },
  { date: "2025-04", uddi: "uddi:635a5f3a-507c-4faf-8408-a04b61123a06", ns: "15106894" },
  { date: "2024-12", uddi: "uddi:bc5d04c0-0b01-47be-a59c-dacda4b5eefc", ns: "15106894" },
];

// 해외주식 투자정보 (연말 기준, 최신순)
const FOREIGN_STOCK_ENDPOINTS = [
  { year: "2024", uddi: "uddi:dce2f590-06d2-4b82-8e7c-c692cda6e9fd", ns: "3070517" },
];

// 국내주식 투자정보 (연말 기준, 최신순)
const DOMESTIC_STOCK_ENDPOINTS = [
  { year: "2024", uddi: "uddi:cc757223-fdc0-45b2-a617-dcbecec3fe1f", ns: "3070507" },
];

// 해외채권 투자정보 (연말 기준, 최신순)
const FOREIGN_BOND_ENDPOINTS = [
  { year: "2024", uddi: "uddi:dd9efc4c-3f99-4d19-afa7-b63e3cc4d70d", ns: "15044505" },
];

// 국내채권 투자정보 (연말 기준, 최신순)
const DOMESTIC_BOND_ENDPOINTS = [
  { year: "2024", uddi: "uddi:3d46cd64-8ac3-475f-b851-e36f7511165d", ns: "15071589" },
];

async function fetchPage(ns, uddi, page, perPage = 500) {
  const url = new URL(`https://api.odcloud.kr/api/${ns}/v1/${uddi}`);
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("perPage", perPage.toString());
  url.searchParams.set("returnType", "JSON");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API 호출 실패: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.code) throw new Error(`API 오류: ${json.msg}`);
  return json;
}

async function fetchAllPages(ns, uddi) {
  const first = await fetchPage(ns, uddi, 1, 500);
  const totalPages = Math.ceil(first.totalCount / 500);
  let allData = [...(first.data || [])];

  for (let page = 2; page <= totalPages; page++) {
    const pageData = await fetchPage(ns, uddi, page, 500);
    allData.push(...(pageData.data || []));
    await new Promise((r) => setTimeout(r, 200));
  }
  return allData;
}

// --- 포트폴리오 현황 파싱 ---
function parsePortfolio(data, date) {
  const ASSET_MAP = {
    "금융부문(국내주식)": "국내주식",
    "금융부문(해외주식)": "해외주식",
    "금융부문(국내채권)": "국내채권",
    "금융부문(해외채권)": "해외채권",
    "금융부문(대체투자)": "대체투자",
    "금융부문(단기자금)": "단기자금",
  };

  const totalRow = data.find((r) => r["구분"] === "전체 자산(시장가)");
  const currentKey = Object.keys(totalRow).find((k) => k.startsWith("현황"));
  const total = totalRow[currentKey];

  const assets = {};
  for (const row of data) {
    const name = ASSET_MAP[row["구분"]];
    if (!name) continue;
    assets[name] = row[currentKey];
  }

  const yearKeys = Object.keys(totalRow)
    .filter((k) => /^\d{4}년/.test(k))
    .sort();

  const history = yearKeys.map((key) => {
    const match = key.match(/^(\d{4})년\s*(\d{1,2})?월?/);
    const year = match[1];
    const month = match[2] ? match[2].padStart(2, "0") : "12";
    const label = `${year}-${month}`;
    const entry = { label };
    entry.total = totalRow[key];
    for (const row of data) {
      const name = ASSET_MAP[row["구분"]];
      if (name) entry[name] = row[key];
    }
    return entry;
  });

  return { date, total, assets, history };
}

// --- 섹터 매핑 ---
const FOREIGN_STOCK_SECTOR = {
  "APPLE INC": "IT",
  "NVIDIA CORP": "IT",
  "MICROSOFT CORP": "IT",
  "AMAZON.COM INC": "Consumer",
  "META PLATFORMS INC CLASS A": "Communication",
  "INVESCO MSCI USA ETF": "ETF",
  "ALPHABET INC CL A": "Communication",
  "ALPHABET INC CL C": "Communication",
  "BROADCOM INC": "IT",
  "TESLA INC": "Consumer",
  "TAIWAN SEMICONDUCTOR SP ADR": "IT",
  "TAIWAN SEMICONDUCTOR MANUFAC": "IT",
  "ISHARES CORE S+P 500 ETF": "ETF",
  "JPMORGAN CHASE + CO": "Finance",
  "UNITEDHEALTH GROUP INC": "Healthcare",
  "VISA INC CLASS A SHARES": "Finance",
  "MASTERCARD INC   A": "Finance",
  "NETFLIX INC": "Communication",
  "EXXON MOBIL CORP": "Energy",
  "ELI LILLY + CO": "Healthcare",
};

const DOMESTIC_STOCK_SECTOR = {
  삼성전자: "IT",
  SK하이닉스: "IT",
  LG에너지솔루션: "2차전지",
  삼성바이오로직스: "바이오",
  현대차: "자동차",
  기아: "자동차",
  NAVER: "IT",
  셀트리온: "바이오",
  KB금융: "금융",
  신한지주: "금융",
  현대모비스: "자동차",
  HD현대중공업: "조선",
  POSCO홀딩스: "소재",
  하나금융지주: "금융",
  삼성물산: "건설",
  LG화학: "화학",
  삼성생명: "금융",
  메리츠금융지주: "금융",
  삼성SDI: "2차전지",
  삼성화재: "금융",
};

function calcSectorBreakdown(holdings, sectorMap) {
  const sectorTotals = {};
  for (const h of holdings) {
    const sector = sectorMap[h.name] || "기타";
    sectorTotals[sector] = (sectorTotals[sector] || 0) + h.valueBillion;
  }
  const total = Object.values(sectorTotals).reduce((a, b) => a + b, 0);
  return Object.entries(sectorTotals)
    .map(([sector, valueBillion]) => ({
      sector,
      valueBillion: parseFloat(valueBillion.toFixed(1)),
      pct: parseFloat(((valueBillion / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.valueBillion - a.valueBillion);
}

// --- 주식 종목 파싱 ---
function parseStockHoldings(data, sectorMap, top = 20) {
  const all = data
    .map((row) => ({
      name: row["종목명"] || "",
      valueBillion: parseFloat(row["평가액(억 원)"] || "0") / 10,
      weight: parseFloat(row["자산군 내 비중(퍼센트)"] || "0"),
      ownershipPct: parseFloat(row["지분율(퍼센트)"] || "0"),
    }))
    .filter((h) => h.valueBillion > 0)
    .sort((a, b) => b.valueBillion - a.valueBillion);

  const sectorBreakdown = calcSectorBreakdown(all, sectorMap);

  const top20 = all.slice(0, top).map((h, i) => ({
    rank: i + 1,
    name: h.name,
    sector: sectorMap[h.name] || "기타",
    valueBillion: parseFloat(h.valueBillion.toFixed(1)),
    weight: parseFloat(h.weight.toFixed(2)),
    ownershipPct: parseFloat(h.ownershipPct.toFixed(2)),
  }));

  return { top20, sectorBreakdown };
}

// --- 해외채권 이름 파싱 ---
const BOND_COUNTRY_PATTERNS = [
  { pattern: /^U\s*S\s+TREASURY/i, country: "미국" },
  { pattern: /^JAPAN\s+GOVERNMENT/i, country: "일본" },
  { pattern: /^CHINA\s+GOVERNMENT/i, country: "중국" },
  { pattern: /^UNITED\s+KINGDOM\s+GILT/i, country: "영국" },
  { pattern: /^FRENCH\s+REPUBLIC/i, country: "프랑스" },
  { pattern: /^SPAIN\s+GOVERNMENT/i, country: "스페인" },
  { pattern: /^ITALY\s+BUONI/i, country: "이탈리아" },
  { pattern: /^GERMANY/i, country: "독일" },
  { pattern: /^BUNDESREPUBLIK/i, country: "독일" },
  { pattern: /^CANADA/i, country: "캐나다" },
  { pattern: /^AUSTRALIA/i, country: "호주" },
  { pattern: /^NETHERLANDS/i, country: "네덜란드" },
  { pattern: /^BELGIUM/i, country: "벨기에" },
  { pattern: /^AUSTRIA/i, country: "오스트리아" },
  { pattern: /^SWEDEN/i, country: "스웨덴" },
  { pattern: /^DENMARK/i, country: "덴마크" },
  { pattern: /^NORWAY/i, country: "노르웨이" },
  { pattern: /^SINGAPORE/i, country: "싱가포르" },
  { pattern: /^KOREA/i, country: "한국" },
];

function parseForeignBondEnriched(name) {
  let country = "기타";
  for (const { pattern, country: c } of BOND_COUNTRY_PATTERNS) {
    if (pattern.test(name)) {
      country = c;
      break;
    }
  }

  // Extract rate: number like 3.875% or 0.400%
  const rateMatch = name.match(/(\d+\.\d+)%/);
  const rate = rateMatch ? `${rateMatch[1]}%` : null;

  // Extract maturity date: MM/DD/YYYY
  const dateMatch = name.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  let maturityClass = null;
  if (dateMatch) {
    const maturityYear = parseInt(dateMatch[3], 10);
    const maturityMonth = parseInt(dateMatch[1], 10);
    const refYear = 2024;
    const refMonth = 12;
    const yearsToMaturity =
      maturityYear - refYear + (maturityMonth - refMonth) / 12;
    if (yearsToMaturity < 3) {
      maturityClass = "단기";
    } else if (yearsToMaturity <= 10) {
      maturityClass = "중기";
    } else {
      maturityClass = "장기";
    }
  }

  return { country, rate, maturityClass };
}

// --- 해외채권 파싱 ---
function parseForeignBonds(data, top = 20) {
  return data
    .map((row) => ({
      name: row["종목명"] || "",
      type: row["종류"] || "",
      valueBillion: parseFloat(row["금액(억 원)"] || "0") / 10,
      weight: parseFloat(row["비중(퍼센트)"] || "0"),
    }))
    .filter((h) => h.valueBillion > 0)
    .sort((a, b) => b.valueBillion - a.valueBillion)
    .slice(0, top)
    .map((h, i) => {
      const enriched = parseForeignBondEnriched(h.name);
      return {
        rank: i + 1,
        name: h.name,
        type: h.type,
        country: enriched.country,
        maturityClass: enriched.maturityClass,
        rate: enriched.rate,
        valueBillion: parseFloat(h.valueBillion.toFixed(1)),
        weight: parseFloat(h.weight.toFixed(2)),
      };
    });
}

// --- 국내채권 파싱 ---
function parseDomesticBonds(data, top = 20) {
  return data
    .map((row) => ({
      name: row["발행기관명"] || "",
      valueBillion: parseFloat(row["평가액(억 원)"] || "0") / 10,
      weight: parseFloat(row["비중(퍼센트)"] || "0"),
    }))
    .filter((h) => h.valueBillion > 0)
    .sort((a, b) => b.valueBillion - a.valueBillion)
    .slice(0, top)
    .map((h, i) => ({
      rank: i + 1,
      name: h.name,
      valueBillion: parseFloat(h.valueBillion.toFixed(1)),
      weight: parseFloat(h.weight.toFixed(2)),
    }));
}

async function main() {
  console.log("=== 국민연금 투자정보 업데이트 ===\n");

  // 1. 포트폴리오 현황
  const pEndpoint = PORTFOLIO_ENDPOINTS[0];
  console.log(`[1/5] 기금 포트폴리오 현황 (${pEndpoint.date}) 가져오는 중...`);
  const portfolioData = await fetchPage(pEndpoint.ns, pEndpoint.uddi, 1, 100);
  const portfolio = parsePortfolio(portfolioData.data, pEndpoint.date);
  console.log(`  총 자산: ${(portfolio.total / 10000).toFixed(1)}조원`);

  // 2. 해외주식
  const fEndpoint = FOREIGN_STOCK_ENDPOINTS[0];
  console.log(`\n[2/5] 해외주식 투자정보 (${fEndpoint.year}년 말) 가져오는 중...`);
  const foreignAll = await fetchAllPages(fEndpoint.ns, fEndpoint.uddi);
  const { top20: foreignTop, sectorBreakdown: foreignSectorBreakdown } = parseStockHoldings(foreignAll, FOREIGN_STOCK_SECTOR);
  console.log(`  총 ${foreignAll.length}개 종목, Top 1: ${foreignTop[0]?.name}`);

  // 3. 국내주식
  const dEndpoint = DOMESTIC_STOCK_ENDPOINTS[0];
  console.log(`\n[3/5] 국내주식 투자정보 (${dEndpoint.year}년 말) 가져오는 중...`);
  const domesticAll = await fetchAllPages(dEndpoint.ns, dEndpoint.uddi);
  const { top20: domesticTop, sectorBreakdown: domesticSectorBreakdown } = parseStockHoldings(domesticAll, DOMESTIC_STOCK_SECTOR);
  console.log(`  총 ${domesticAll.length}개 종목, Top 1: ${domesticTop[0]?.name}`);

  // 4. 해외채권
  const fbEndpoint = FOREIGN_BOND_ENDPOINTS[0];
  console.log(`\n[4/5] 해외채권 투자정보 (${fbEndpoint.year}년 말) 가져오는 중...`);
  const foreignBondAll = await fetchAllPages(fbEndpoint.ns, fbEndpoint.uddi);
  const foreignBondTop = parseForeignBonds(foreignBondAll);
  console.log(`  총 ${foreignBondAll.length}개 종목, Top 1: ${foreignBondTop[0]?.name}`);

  // 5. 국내채권
  const dbEndpoint = DOMESTIC_BOND_ENDPOINTS[0];
  console.log(`\n[5/5] 국내채권 투자정보 (${dbEndpoint.year}년 말) 가져오는 중...`);
  const domesticBondAll = await fetchAllPages(dbEndpoint.ns, dbEndpoint.uddi);
  const domesticBondTop = parseDomesticBonds(domesticBondAll);
  console.log(`  총 ${domesticBondAll.length}개 발행기관, Top 1: ${domesticBondTop[0]?.name}`);

  // 자산배분 비중 계산
  const allocationPct = {};
  for (const [name, value] of Object.entries(portfolio.assets)) {
    allocationPct[name] = parseFloat(((value / portfolio.total) * 100).toFixed(1));
  }

  const output = {
    lastUpdated: new Date().toISOString().split("T")[0],
    source: "공공데이터포털 (data.go.kr)",
    portfolio: {
      referenceDate: portfolio.date,
      totalBillion: portfolio.total,
      allocation: allocationPct,
      assets: portfolio.assets,
      history: portfolio.history,
    },
    foreignStocks: {
      referenceDate: `${fEndpoint.year}-12-31`,
      totalCount: foreignAll.length,
      top20: foreignTop,
      sectorBreakdown: foreignSectorBreakdown,
    },
    domesticStocks: {
      referenceDate: `${dEndpoint.year}-12-31`,
      totalCount: domesticAll.length,
      top20: domesticTop,
      sectorBreakdown: domesticSectorBreakdown,
    },
    foreignBonds: {
      referenceDate: `${fbEndpoint.year}-12-31`,
      totalCount: foreignBondAll.length,
      top20: foreignBondTop,
    },
    domesticBonds: {
      referenceDate: `${dbEndpoint.year}-12-31`,
      totalCount: domesticBondAll.length,
      top20: domesticBondTop,
    },
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");

  console.log(`\n✅ ${OUTPUT_PATH} 업데이트 완료!`);
  console.log(`   포트폴리오: ${portfolio.date} 기준, ${(portfolio.total / 10000).toFixed(1)}조원`);
  console.log(`   해외주식: ${foreignAll.length}개 → Top 20`);
  console.log(`   국내주식: ${domesticAll.length}개 → Top 20`);
  console.log(`   해외채권: ${foreignBondAll.length}개 → Top 20`);
  console.log(`   국내채권: ${domesticBondAll.length}개 → Top 20`);
}

main().catch((err) => {
  console.error("오류 발생:", err.message);
  process.exit(1);
});
