"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductLineCode } from "@lakbay/contracts";
import { useGetRegionsQuery, useGetDestinationsQuery } from "@/lib/availabilityApi";
import { useGetRegionPageContentQuery } from "@/lib/cmsContentApi";
import { PRODUCT_LINE_META } from "@/lib/catalog";
import { CmsSections } from "@/components/blocks/BlockRegistry";

function parseCode(raw: string): ProductLineCode | null {
  const upper = raw.toUpperCase();
  return (Object.values(ProductLineCode) as string[]).includes(upper)
    ? (upper as ProductLineCode)
    : null;
}

export default function RegionPage({
  params,
}: {
  params: Promise<{ code: string; regionSlug: string }>;
}) {
  const { code: rawCode, regionSlug } = use(params);
  const code = parseCode(rawCode);

  if (!code) {
    notFound();
  }

  const { data: regions } = useGetRegionsQuery(code);
  const { data: destinations } = useGetDestinationsQuery(code);
  const { data: landingContent } = useGetRegionPageContentQuery(regionSlug);

  const meta = PRODUCT_LINE_META[code];
  const region = regions?.find((r) => r.slug === regionSlug);
  const regionDestinations = destinations?.filter((d) => d.region.slug === regionSlug) ?? [];

  if (regions && !region) {
    notFound();
  }

  return (
    <main className="flex-1">
      {landingContent ? (
        <section className="relative overflow-hidden border-b border-teal-line py-14 text-center text-white">
          <Image
            src={landingContent.heroImageUrl}
            alt={landingContent.heading}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative px-6">
            <span className="text-3xl">{meta.emoji}</span>
            <h1 className="mt-2 text-3xl font-semibold">{landingContent.heading}</h1>
          </div>
        </section>
      ) : (
        <section
          className="border-b border-teal-line px-6 py-12 text-center text-white"
          style={{ backgroundColor: meta.accent }}
        >
          <span className="text-3xl">{meta.emoji}</span>
          <h1 className="mt-2 text-3xl font-semibold">{region?.name ?? regionSlug}</h1>
        </section>
      )}

      {landingContent && (
        <CmsSections sections={landingContent.sections.filter((s) => s.type !== "hero")} />
      )}

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link href={`/collections/${code.toLowerCase()}`} className="text-sm text-teal-mid hover:underline">
          ← Back to {meta.label}
        </Link>

        {region && (
          <>
            <p className="mt-6 text-foreground">{region.description}</p>
            {region.highlights.length > 0 && (
              <div className="mt-4 rounded-xl border border-teal-line bg-surface p-5">
                <h2 className="text-sm font-semibold text-teal-deep">About {region.name}</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {region.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-teal-mid">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <h2 className="mt-8 text-lg font-semibold text-teal-deep">Destinations in {region?.name ?? "this region"}</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {regionDestinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/collections/${code.toLowerCase()}/${regionSlug}/${dest.slug}`}
              className="overflow-hidden rounded-xl border border-teal-line bg-surface p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-teal-deep">{dest.name}</h3>
              <p className="mt-1 text-sm text-foreground-soft">{dest.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
