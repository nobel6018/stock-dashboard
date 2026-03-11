import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BarChart3, Briefcase, Building2 } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Personal stock market indicators dashboard",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/", label: "매크로 지표", icon: BarChart3 },
  { href: "/portfolio", label: "13F 포트폴리오", icon: Briefcase },
  { href: "/nps", label: "국민연금", icon: Building2 },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 border-r border-white/[0.06] bg-black/40 backdrop-blur-sm md:block">
            <div className="flex h-14 items-center border-b border-white/[0.06] px-5">
              <Link href="/" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Stock Dashboard</span>
              </Link>
            </div>
            <nav className="mt-4 space-y-1 px-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-black/60 backdrop-blur-sm md:hidden">
            <div className="flex w-full items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Stock Dashboard</span>
              </Link>
              <nav className="flex gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1 pt-14 md:ml-56 md:pt-0">
            <div className="mx-auto max-w-7xl p-4 md:p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
