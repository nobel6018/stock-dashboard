"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "매크로 지표", icon: BarChart3 },
  { href: "/market", label: "증시 흐름", icon: TrendingUp },
  { href: "/crisis", label: "위기 신호", icon: ShieldAlert },
  { href: "/portfolio", label: "13F 포트폴리오", icon: Briefcase },
  { href: "/nps", label: "국민연금", icon: Building2 },
  { href: "/summary", label: "박종훈 요약본", icon: BookOpen },
  { href: "/study", label: "사전학습자료", icon: FileText },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  const sidebarWidth = collapsed ? "w-14" : "w-56";
  const mainMargin = collapsed ? "md:ml-14" : "md:ml-56";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden ${sidebarWidth} border-r border-white/[0.06] bg-black/40 backdrop-blur-sm transition-all duration-200 md:block`}
      >
        <div
          className={`flex h-14 items-center border-b border-white/[0.06] ${collapsed ? "justify-center px-2" : "px-5"}`}
        >
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 shrink-0 text-emerald-400" />
            {!collapsed && (
              <span className="text-sm font-semibold">Stock Dashboard</span>
            )}
          </Link>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-lg ${collapsed ? "px-0 py-2" : "px-3 py-2"} text-sm transition-colors ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : ""}`}
                />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <button
          onClick={toggle}
          className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-center gap-2 border-t border-white/[0.06] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="text-xs">접기</span>
            </>
          )}
        </button>
      </aside>

      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-black/60 backdrop-blur-sm md:hidden">
        <div className="flex w-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold">Stock Dashboard</span>
          </Link>
          <MobileNav pathname={pathname} />
        </div>
      </header>

      {/* Main content */}
      <main
        className={`flex-1 pt-14 ${mainMargin} md:pt-0 transition-all duration-200`}
      >
        <div className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</div>
      </main>
    </>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs ${active ? "font-medium text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
