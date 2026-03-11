"use client";

import { CommonStock } from "@/types/portfolio";

interface CommonStocksProps {
  stocks: CommonStock[];
}

export function CommonStocks({ stocks }: CommonStocksProps) {
  if (stocks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        공통 보유 종목이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">종목</th>
            <th className="py-2 pr-4 text-right">보유 투자자 수</th>
            <th className="py-2 pr-4 text-right">평균 비중</th>
            <th className="py-2">보유자</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, i) => (
            <tr
              key={stock.name}
              className="border-b border-white/[0.03] hover:bg-white/[0.02]"
            >
              <td className="py-2.5 pr-4 text-zinc-600">{i + 1}</td>
              <td className="py-2.5 pr-4 font-medium text-white">
                {stock.ticker || stock.name}
              </td>
              <td className="py-2.5 pr-4 text-right">
                <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
                  {stock.holderCount}명
                </span>
              </td>
              <td className="py-2.5 pr-4 text-right font-mono text-zinc-300">
                {stock.averageWeight.toFixed(1)}%
              </td>
              <td className="py-2.5">
                <div className="flex flex-wrap gap-1">
                  {stock.holders.map((h) => (
                    <span
                      key={h.investorName}
                      className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-400"
                    >
                      {h.investorName} ({h.weight.toFixed(1)}%)
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
