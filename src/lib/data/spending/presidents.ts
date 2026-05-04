/**
 * 미국 대통령 임기 정보. 회계연도(10/1~9/30)별 대통령 매핑에 사용.
 * 회계연도 종료일(9/30) 시점의 재임 대통령을 그 회계연도의 대통령으로 본다.
 */
export interface PresidentTerm {
  name: string;
  party: "민주" | "공화" | "기타";
  /** 취임일 */
  start: string;
  /** 퇴임일 (현직이면 null) */
  end: string | null;
}

export const PRESIDENTS: PresidentTerm[] = [
  { name: "루스벨트", party: "민주", start: "1933-03-04", end: "1945-04-12" },
  { name: "트루먼", party: "민주", start: "1945-04-12", end: "1953-01-20" },
  { name: "아이젠하워", party: "공화", start: "1953-01-20", end: "1961-01-20" },
  { name: "케네디", party: "민주", start: "1961-01-20", end: "1963-11-22" },
  { name: "존슨", party: "민주", start: "1963-11-22", end: "1969-01-20" },
  { name: "닉슨", party: "공화", start: "1969-01-20", end: "1974-08-09" },
  { name: "포드", party: "공화", start: "1974-08-09", end: "1977-01-20" },
  { name: "카터", party: "민주", start: "1977-01-20", end: "1981-01-20" },
  { name: "레이건", party: "공화", start: "1981-01-20", end: "1989-01-20" },
  { name: "부시(고)", party: "공화", start: "1989-01-20", end: "1993-01-20" },
  { name: "클린턴", party: "민주", start: "1993-01-20", end: "2001-01-20" },
  { name: "부시(자)", party: "공화", start: "2001-01-20", end: "2009-01-20" },
  { name: "오바마", party: "민주", start: "2009-01-20", end: "2017-01-20" },
  { name: "트럼프 1기", party: "공화", start: "2017-01-20", end: "2021-01-20" },
  { name: "바이든", party: "민주", start: "2021-01-20", end: "2025-01-20" },
  { name: "트럼프 2기", party: "공화", start: "2025-01-20", end: null },
];

/**
 * 미국 회계연도(FY)는 전년도 10/1 ~ 당해 9/30.
 * 종료일(9/30) 시점의 대통령을 반환.
 */
export function getPresidentByFiscalYear(fy: number): PresidentTerm | null {
  const fyEnd = new Date(`${fy}-09-30`);
  return (
    PRESIDENTS.find((p) => {
      const start = new Date(p.start);
      const end = p.end ? new Date(p.end) : new Date("9999-12-31");
      return fyEnd >= start && fyEnd < end;
    }) ?? null
  );
}

export const PARTY_COLORS: Record<PresidentTerm["party"], string> = {
  민주: "text-blue-300 border-blue-400/30 bg-blue-400/[0.06]",
  공화: "text-rose-300 border-rose-400/30 bg-rose-400/[0.06]",
  기타: "text-zinc-400 border-zinc-400/30 bg-zinc-400/[0.06]",
};
