"use client";

import Link from "next/link";
import { ProductLineCode } from "@lakbay/contracts";
import { PRODUCT_LINE_META } from "@/lib/catalog";

const NAV_ORDER = [
  ProductLineCode.Alon,
  ProductLineCode.Amihan,
  ProductLineCode.Parul,
  ProductLineCode.Pamana,
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-teal-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-teal-deep">
          Lakbay
        </Link>
        <nav className="flex gap-5 text-sm">
          {NAV_ORDER.map((code) => (
            <Link
              key={code}
              href={`/collections/${code.toLowerCase()}`}
              className="text-foreground-soft transition hover:text-teal-deep"
            >
              {PRODUCT_LINE_META[code].emoji} {code[0] + code.slice(1).toLowerCase()}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
