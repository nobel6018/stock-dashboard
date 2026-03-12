#!/usr/bin/env node

/**
 * 국민연금 투자정보 업데이트 스크립트
 *
 * 3개 API 데이터를 가져와 nps-holdings.json에 저장:
 * 1. 기금 포트폴리오 현황 (자산배분 + 연도별 추이)
 * 2. 해외주식 투자정보 (종목별 Top 20)
 * 3. 국내주식 투자정보 (종목별 Top 20)
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
  { date: "2025-03", uddi: "uddi:afde37f7-7d92-46d4-8448-901d5299de28", ns: "15106894" },
  { date: "2024-12", uddi: "uddi:bc5d04c0-0b01-47be-a59c-dacda4b5eefc", ns: "15106894" },
];

// 해외주식 투자정보 (연말 기준, 최신순)
const FOREIGN_STOCK_ENDPOINTS = [
  { year: "2024", uddi: "uddi:dce2f590-06d2-4b82-8e7c-c692cda6e9fd", ns: "3070517" },
  { year: "2023", uddi: "uddi:cbf4387f-ef66-47d5-a49d-b197ce67a88f", ns: "3070517" },
];

// 국내주식 투자정보 (연말 기준, 최신순)
const DOMESTIC_STOCK_ENDPOINTS = [
  { year: "2024", uddi: "uddi:cc757223-fdc0-45b2-a617-dcbecec3fe1f", ns: "3070507" },
  { year: "2023", uddi: "uddi:b2092461-47fb-4571-b3b0-86c96df25dfa", ns: "3070507" },
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
  // 현황 컬럼명은 엔드포인트마다 다름 — "현황(말잔_십억원)" 또는 "현황(말잔_십억 원)" 등
  const currentKey = Object.keys(totalRow).find((k) => k.startsWith("현황"));
  const total = totalRow[currentKey];

  const assets = {};
  for (const row of data) {
    const name = ASSET_MAP[row["구분"]];
    if (!name) continue;
    assets[name] = row[currentKey];
  }

  // 연도별 추이 추출
  const yearKeys = Object.keys(totalRow)
    .filter((k) => /^\d{4}년/.test(k))
    .sort();

  const history = yearKeys.map((key) => {
    // "2020년(십억 원)" → "2020-12", "2025년 5월(십억 원)" → "2025-05"
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

// --- 주식 종목 파싱 ---
function parseStockHoldings(data, top = 20) {
  return data
    .map((row) => ({
      name: row["종목명"] || "",
      valueBillion: parseFloat(row["평가액(억 원)"] || "0") / 10,
      weight: parseFloat(row["자산군 내 비중(퍼센트)"] || "0"),
      ownershipPct: parseFloat(row["지분율(퍼센트)"] || "0"),
    }))
    .filter((h) => h.valueBillion > 0)
    .sort((a, b) => b.valueBillion - a.valueBillion)
    .slice(0, top)
    .map((h, i) => ({
      rank: i + 1,
      name: h.name,
      valueBillion: parseFloat(h.valueBillion.toFixed(1)),
      weight: parseFloat(h.weight.toFixed(2)),
      ownershipPct: parseFloat(h.ownershipPct.toFixed(2)),
    }));
}

async function main() {
  console.log("=== 국민연금 투자정보 업데이트 ===\n");

  // 1. 포트폴리오 현황
  const pEndpoint = PORTFOLIO_ENDPOINTS[0];
  console.log(`[1/3] 기금 포트폴리오 현황 (${pEndpoint.date}) 가져오는 중...`);
  const portfolioData = await fetchPage(pEndpoint.ns, pEndpoint.uddi, 1, 100);
  const portfolio = parsePortfolio(portfolioData.data, pEndpoint.date);
  console.log(`  총 자산: ${(portfolio.total / 10000).toFixed(1)}조원`);

  // 2. 해외주식
  const fEndpoint = FOREIGN_STOCK_ENDPOINTS[0];
  console.log(`\n[2/3] 해외주식 투자정보 (${fEndpoint.year}년 말) 가져오는 중...`);
  const foreignAll = await fetchAllPages(fEndpoint.ns, fEndpoint.uddi);
  const foreignTop = parseStockHoldings(foreignAll);
  console.log(`  총 ${foreignAll.length}개 종목, Top 1: ${foreignTop[0]?.name}`);

  // 3. 국내주식
  const dEndpoint = DOMESTIC_STOCK_ENDPOINTS[0];
  console.log(`\n[3/3] 국내주식 투자정보 (${dEndpoint.year}년 말) 가져오는 중...`);
  const domesticAll = await fetchAllPages(dEndpoint.ns, dEndpoint.uddi);
  const domesticTop = parseStockHoldings(domesticAll);
  console.log(`  총 ${domesticAll.length}개 종목, Top 1: ${domesticTop[0]?.name}`);

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
    },
    domesticStocks: {
      referenceDate: `${dEndpoint.year}-12-31`,
      totalCount: domesticAll.length,
      top20: domesticTop,
    },
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");

  console.log(`\n✅ ${OUTPUT_PATH} 업데이트 완료!`);
  console.log(`   포트폴리오: ${portfolio.date} 기준, ${(portfolio.total / 10000).toFixed(1)}조원`);
  console.log(`   해외주식: ${foreignAll.length}개 → Top 20`);
  console.log(`   국내주식: ${domesticAll.length}개 → Top 20`);
  console.log(`   자산배분: 국내주식 ${allocationPct["국내주식"]}% | 해외주식 ${allocationPct["해외주식"]}% | 국내채권 ${allocationPct["국내채권"]}% | 해외채권 ${allocationPct["해외채권"]}% | 대체투자 ${allocationPct["대체투자"]}%`);
}

main().catch((err) => {
  console.error("오류 발생:", err.message);
  process.exit(1);
});
