"use client";

import Link from "next/link";
import { useGetProductLinesQuery } from "@/lib/availabilityApi";
import { PRODUCT_LINE_META } from "@/lib/catalog";

/**
 * Phase 2: the real catalog homepage, querying Lakbay.AvailabilityApi
 * directly (ADR-0007) — no placeholder content. Four product lines,
 * driven entirely by what the API actually returns, not a hard-coded
 * list — if a fifth line is ever added to the schema, this page picks it
 * up with no code change.
 */
export default function Home() {
  const { data: productLines, error, isLoading } = useGetProductLinesQuery();

  return (
    <main className="flex-1">
      <section className="border-b border-teal-line bg-teal-deep px-6 py-16 text-center text-white">
        <p className="font-mono text-xs uppercase tracking-widest text-white/70">
          Philippines-first holidays
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold text-balance">
          Four ways to see the Philippines, chosen for what makes each place worth the trip
        </h1>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {isLoading && (
          <p className="text-center text-foreground-soft">Loading collections…</p>
        )}
        {error && (
          <p className="text-center text-red-600">
            Lakbay.AvailabilityApi isn&apos;t reachable at{" "}
            {process.env.NEXT_PUBLIC_AVAILABILITY_API_URL ?? "http://localhost:5170"}
            . Run it locally (see Lakbay.AvailabilityApi&apos;s Developer Handbook), then reload.
          </p>
        )}

        {productLines && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {productLines.map((line) => (
              <Link
                key={line.code}
                href={`/collections/${line.code.toLowerCase()}`}
                className="group rounded-xl border border-teal-line bg-surface p-6 shadow-sm transition hover:shadow-md"
              >
                <span className="text-3xl">{PRODUCT_LINE_META[line.code].emoji}</span>
                <h2 className="mt-3 text-xl font-semibold text-teal-deep group-hover:underline">
                  {line.name}
                </h2>
                <p className="mt-1 text-sm text-foreground-soft">{line.tagline}</p>
                <p className="mt-3 font-mono text-xs text-foreground-faint">
                  {line.countries.join(", ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
