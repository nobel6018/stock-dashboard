import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { SideNav, MobileNav } from "@/components/Nav";
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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

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
            <SideNav />
          </aside>

          <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-black/60 backdrop-blur-sm md:hidden">
            <div className="flex w-full items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Stock Dashboard</span>
              </Link>
              <MobileNav />
            </div>
          </header>

          <main className="flex-1 pt-14 md:ml-56 md:pt-0">
            <div className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
