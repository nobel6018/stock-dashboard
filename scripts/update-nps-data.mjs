#!/usr/bin/env node

/**
 * 국민연금 해외주식 투자정보 업데이트 스크립트
 *
 * 사전 준비:
 * 1. https://www.data.go.kr/data/3070517/fileData.do 접속
 * 2. Open API 활용신청 → API 키 발급
 * 3. .env.local에 DATA_GO_KR_API_KEY=발급받은키(Encoding) 설정
 *
 * 실행: npm run update-nps
 */

import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

config({ path: resolve(ROOT, ".env.local") });

const API_KEY = process.env.DATA_GO_KR_API_KEY;
if (!API_KEY) {
  console.error("ERROR: DATA_GO_KR_API_KEY가 .env.local에 설정되지 않았습니다.");
  console.error("https://www.data.go.kr/data/3070517/fileData.do 에서 API 키를 발급받으세요.");
  process.exit(1);
}

// 연도별 엔드포인트 — 최신 데이터셋을 맨 위에 추가
const ENDPOINTS = [
  { year: "2024", uddi: "uddi:dce2f590-06d2-4b82-8e7c-c692cda6e9fd" },
  { year: "2023", uddi: "uddi:cbf4387f-ef66-47d5-a49d-b197ce67a88f" },
  { year: "2022", uddi: "uddi:a5b517c1-c1dc-4e55-a45e-a1d05c390b80" },
  { year: "2021", uddi: "uddi:2e06ff94-03d7-43f1-b171-d9f208c0b7ee" },
];

const BASE_URL = "https://api.odcloud.kr/api/3070517/v1";
const OUTPUT_PATH = resolve(ROOT, "src/lib/data/nps-holdings.json");

async function fetchPage(uddi, page, perPage = 500) {
  const url = new URL(`${BASE_URL}/${uddi}`);
  url.searchParams.set("serviceKey", API_KEY);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("perPage", perPage.toString());
  url.searchParams.set("returnType", "JSON");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API 호출 실패: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function main() {
  // 최신 엔드포인트부터 시도
  const endpoint = ENDPOINTS[0];
  console.log(`국민연금 해외주식 데이터 (${endpoint.year}년 말 기준) 가져오는 중...`);

  const firstPage = await fetchPage(endpoint.uddi, 1, 500);

  if (firstPage.code) {
    throw new Error(`API 오류: ${firstPage.msg}`);
  }

  const totalCount = firstPage.totalCount;
  const totalPages = Math.ceil(totalCount / 500);
  console.log(`총 ${totalCount}건, ${totalPages} 페이지`);

  let allData = [...(firstPage.data || [])];

  for (let page = 2; page <= totalPages; page++) {
    console.log(`페이지 ${page}/${totalPages} 가져오는 중...`);
    const pageData = await fetchPage(endpoint.uddi, page, 500);
    allData.push(...(pageData.data || []));
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`총 ${allData.length}건 수신 완료`);

  // API 응답 필드: 번호, 종목명, 자산군 내 비중(퍼센트), 지분율(퍼센트), 평가액(억 원)
  const holdings = allData
    .map((row) => ({
      name: row["종목명"] || "",
      valueBillion: parseFloat(row["평가액(억 원)"] || "0") / 10, // 억원 → 십억원
      weight: parseFloat(row["자산군 내 비중(퍼센트)"] || "0"),
      ownershipPct: parseFloat(row["지분율(퍼센트)"] || "0"),
    }))
    .filter((h) => h.valueBillion > 0)
    .sort((a, b) => b.valueBillion - a.valueBillion);

  const topHoldings = holdings.slice(0, 20).map((h, i) => ({
    rank: i + 1,
    name: h.name,
    valueBillion: parseFloat(h.valueBillion.toFixed(1)),
    weight: parseFloat(h.weight.toFixed(2)),
    ownershipPct: parseFloat(h.ownershipPct.toFixed(2)),
  }));

  // 기존 assetAllocation 유지
  let existingData = {};
  try {
    existingData = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    // first run
  }

  const output = {
    lastUpdated: new Date().toISOString().split("T")[0],
    source: "공공데이터포털 (data.go.kr/data/3070517)",
    referenceDate: `${endpoint.year}-12-31`,
    assetAllocation: existingData.assetAllocation || {
      기준일: `${endpoint.year}-12-31`,
      국내주식: 0,
      해외주식: 0,
      국내채권: 0,
      해외채권: 0,
      대체투자: 0,
    },
    topForeignHoldings: topHoldings,
    totalHoldings: holdings.length,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log(`\n✅ ${OUTPUT_PATH} 업데이트 완료!`);
  console.log(`   기준일: ${endpoint.year}-12-31`);
  console.log(`   Top 1: ${topHoldings[0]?.name} (${topHoldings[0]?.valueBillion}십억원)`);
  console.log(`   총 ${holdings.length}개 종목 중 상위 20개 저장`);
}

main().catch((err) => {
  console.error("오류 발생:", err.message);

  if (err.message.includes("401") || err.message.includes("403")) {
    console.error("\nAPI 키가 유효하지 않거나 활용신청이 승인되지 않았습니다.");
  }

  process.exit(1);
});
