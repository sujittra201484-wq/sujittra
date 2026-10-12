"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/orders", label: "รายการคำสั่งซื้อ" },
  { href: "/orders/new", label: "เพิ่มคำสั่งซื้อ" },
  { href: "/summary", label: "สรุปยอด" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-t-4 border-b border-t-brand border-b-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="leading-tight">
          <div className="text-lg font-semibold text-brand">ระบบติดตามคำสั่งซื้ออมตะ</div>
          <div className="text-sm text-slate-500">สำนักพิมพ์อมตะ</div>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
