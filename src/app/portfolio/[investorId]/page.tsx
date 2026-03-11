"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { INVESTORS, InvestorPortfolio } from "@/types/portfolio";
import { formatLargeNumber, formatDate } from "@/lib/utils/formatters";

export default function InvestorDetailPage() {
  const params = useParams<{ investorId: string }>();
  const [portfolio, setPortfolio] = useState<InvestorPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const investor = INVESTORS.find((i) => i.id === params.investorId);

  const fetchData = useCallback(async () => {
    if (!params.investorId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio/${params.investorId}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setPortfolio(json.data);
    } catch {
      setError("포트폴리오를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [params.investorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!investor) {
    return (
      <div className="py-20 text-center text-zinc-500">
        알 수 없는 투자자입니다
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/portfolio"
        className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> 포트폴리오 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{investor.nameKo}</h1>
        <p className="mt-1 text-sm text-zinc-500">{investor.entity}</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-sm text-zinc-500">{error}</div>
      )}

      {!loading && !error && portfolio && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-zinc-500">총 포트폴리오 가치</div>
              <div className="mt-1 text-lg font-semibold">
                {formatLargeNumber(portfolio.totalValue)}
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-zinc-500">종목 수</div>
              <div className="mt-1 text-lg font-semibold">
                {portfolio.holdings.length}
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-zinc-500">기준일</div>
              <div className="mt-1 text-lg font-semibold">
                {formatDate(portfolio.quarterEnd)}
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-zinc-500">제출일</div>
              <div className="mt-1 text-lg font-semibold">
                {formatDate(portfolio.filingDate)}
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="mb-4 text-lg font-semibold">전체 보유 종목</h2>
            <HoldingsTable holdings={portfolio.holdings} />
          </section>
        </div>
      )}
    </div>
  );
}
