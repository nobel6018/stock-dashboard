"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, Building2, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "매크로 지표", icon: BarChart3 },
  { href: "/market", label: "증시 흐름", icon: TrendingUp },
  { href: "/portfolio", label: "13F 포트폴리오", icon: Briefcase },
  { href: "/nps", label: "국민연금", icon: Building2 },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <item.icon className={`h-4 w-4 ${active ? "text-emerald-400" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs ${active ? "text-white font-medium" : "text-zinc-400 hover:text-white"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
