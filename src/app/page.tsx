"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetProductLinesQuery } from "@/lib/availabilityApi";
import { useGetHomeContentQuery } from "@/lib/cmsContentApi";
import { PRODUCT_LINE_META } from "@/lib/catalog";
import { CmsSections } from "@/components/blocks/BlockRegistry";

/**
 * Phase 2's catalog grid (Lakbay.AvailabilityApi, ADR-0007) plus Phase 3's
 * real Cms-authored hero and page sections (Lakbay.Cms's Content
 * Delivery API, ADR-0007's "single-page content" path) — two different
 * backends, each doing the job it's actually good at: AvailabilityApi
 * for the product-line grid (search/browse), Cms for editorial copy.
 * The hero falls back to static copy if Cms isn't reachable, so the page
 * still works with only Lakbay.AvailabilityApi running.
 */
export default function Home() {
  const { data: productLines, error, isLoading } = useGetProductLinesQuery();
  const { data: homeContent } = useGetHomeContentQuery();

  return (
    <main className="flex-1">
      {homeContent ? (
        <section className="relative overflow-hidden border-b border-teal-line py-20 text-center text-white">
          <Image
            src={homeContent.heroImageUrl}
            alt={homeContent.heading}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative px-6">
            <p className="font-mono text-xs uppercase tracking-widest text-white/80">
              {homeContent.subtext}
            </p>
            <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold text-balance">
              {homeContent.heading}
            </h1>
          </div>
        </section>
      ) : (
        <section className="border-b border-teal-line bg-teal-deep px-6 py-16 text-center text-white">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">
            Philippines-first holidays
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold text-balance">
            Four ways to see the Philippines, chosen for what makes each place worth the trip
          </h1>
        </section>
      )}

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

      {/* The hero above already covers homeContent's own "hero"-type
          section (same copy, top-level fields) — only render the rest
          here, via the block registry, to avoid showing it twice. */}
      {homeContent && (
        <CmsSections sections={homeContent.sections.filter((s) => s.type !== "hero")} />
      )}
    </main>
  );
}
