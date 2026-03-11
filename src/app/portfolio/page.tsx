"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { CommonStocks } from "@/components/portfolio/CommonStocks";
import { INVESTORS, InvestorPortfolio, CommonStock } from "@/types/portfolio";
import { formatLargeNumber, formatDate } from "@/lib/utils/formatters";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<
    Record<string, InvestorPortfolio>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        INVESTORS.map(async (inv) => {
          const res = await fetch(`/api/portfolio/${inv.id}`);
          if (!res.ok) throw new Error(`Failed: ${inv.id}`);
          const json = await res.json();
          return { id: inv.id, data: json.data as InvestorPortfolio };
        }),
      );

      const map: Record<string, InvestorPortfolio> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          map[r.value.id] = r.value.data;
        }
      }
      setPortfolios(map);
    } catch {
      setError("포트폴리오 데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const commonStocks = computeCommonStocks(Object.values(portfolios));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">13F 포트폴리오</h1>
        <p className="mt-1 text-sm text-zinc-500">
          주요 투자자들의 SEC 13F 공시 기반 포트폴리오
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-sm text-zinc-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {INVESTORS.map((inv) => {
            const p = portfolios[inv.id];
            if (!p) return null;
            return (
              <section
                key={inv.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{inv.nameKo}</h2>
                    <p className="text-xs text-zinc-500">
                      {inv.entity} · 기준일{" "}
                      {formatDate(p.quarterEnd)} · 총{" "}
                      {formatLargeNumber(p.totalValue)}
                    </p>
                  </div>
                  <Link
                    href={`/portfolio/${inv.id}`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                  >
                    전체 보기 <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <HoldingsTable holdings={p.holdings} maxRows={10} />
              </section>
            );
          })}

          {commonStocks.length > 0 && (
            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">공통 보유 종목</h2>
                <p className="text-xs text-zinc-500">
                  2명 이상의 투자자가 동시에 보유한 종목
                </p>
              </div>
              <CommonStocks stocks={commonStocks} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function computeCommonStocks(portfolios: InvestorPortfolio[]): CommonStock[] {
  const stockMap = new Map<
    string,
    { name: string; holders: { investorName: string; weight: number }[] }
  >();

  for (const p of portfolios) {
    for (const h of p.holdings) {
      const key = (h.cusip || h.name).toUpperCase();
      if (!stockMap.has(key)) {
        stockMap.set(key, { name: h.name, holders: [] });
      }
      stockMap.get(key)!.holders.push({
        investorName: p.investorNameKo,
        weight: h.weight,
      });
    }
  }

  return Array.from(stockMap.values())
    .filter((s) => s.holders.length >= 2)
    .map((s) => ({
      name: s.name,
      holders: s.holders,
      holderCount: s.holders.length,
      averageWeight:
        s.holders.reduce((sum, h) => sum + h.weight, 0) / s.holders.length,
    }))
    .sort((a, b) => b.holderCount - a.holderCount || b.averageWeight - a.averageWeight);
}
