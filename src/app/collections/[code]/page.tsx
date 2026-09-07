"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductLineCode } from "@lakbay/contracts";
import { useGetProductLinesQuery, useGetProductsQuery, useGetRegionsQuery } from "@/lib/availabilityApi";
import { useGetLandingPageContentQuery } from "@/lib/cmsContentApi";
import { PRODUCT_LINE_META, destinationLocation, formatPhp, lowestPrice } from "@/lib/catalog";
import { CmsSections } from "@/components/blocks/BlockRegistry";

function parseCode(raw: string): ProductLineCode | null {
  const upper = raw.toUpperCase();
  return (Object.values(ProductLineCode) as string[]).includes(upper)
    ? (upper as ProductLineCode)
    : null;
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = use(params);
  const code = parseCode(rawCode);

  if (!code) {
    notFound();
  }

  const { data: productLines } = useGetProductLinesQuery();
  const { data: products, error, isLoading } = useGetProductsQuery({ productLine: code });
  const { data: regions } = useGetRegionsQuery(code ?? undefined);
  const { data: landingContent } = useGetLandingPageContentQuery(code ?? "", { skip: !code });

  const line = productLines?.find((l) => l.code === code);
  const meta = PRODUCT_LINE_META[code];

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
          <h1 className="mt-2 text-3xl font-semibold">
            {line?.name ?? meta.label}
          </h1>
          {line && <p className="mt-1 text-white/85">{line.tagline}</p>}
        </section>
      )}

      {landingContent && (
        <CmsSections sections={landingContent.sections.filter((s) => s.type !== "hero")} />
      )}

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="text-sm text-teal-mid hover:underline">
          ← All collections
        </Link>

        {regions && regions.length > 0 && (
          <>
            <h2 className="mt-8 text-lg font-semibold text-teal-deep">Explore by region</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/collections/${code?.toLowerCase()}/${region.slug}`}
                  className="rounded-xl border border-teal-line bg-surface p-5 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="font-semibold text-teal-deep">{region.name}</h3>
                  {region.highlights[0] && (
                    <p className="mt-1 text-sm text-foreground-soft">{region.highlights[0]}</p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-8 text-lg font-semibold text-teal-deep">All holidays</h2>
        {isLoading && <p className="mt-6 text-foreground-soft">Loading holidays…</p>}
        {error && (
          <p className="mt-6 text-red-600">
            Couldn&apos;t load {meta.label} holidays right now.
          </p>
        )}

        {products && products.length === 0 && (
          <p className="mt-6 text-foreground-soft">
            No holidays published in this collection yet.
          </p>
        )}

        {products && products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {products.map((product) => {
              const from = lowestPrice(product.priceBands);
              return (
                <Link
                  key={product.id}
                  href={`/holidays/${product.slug}`}
                  className="overflow-hidden rounded-xl border border-teal-line bg-surface shadow-sm transition hover:shadow-md"
                >
                  {product.heroImageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={product.heroImageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-teal-deep">{product.name}</h2>
                    <p className="mt-1 text-sm text-foreground-faint">
                      {destinationLocation(product.destination)}
                    </p>
                    <p className="mt-2 text-sm text-foreground-soft">{product.summary}</p>
                    {product.accommodation && (
                      <p className="mt-2 text-xs text-foreground-faint">
                        <span className="text-teal-mid">Stay:</span> {product.accommodation.name}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-mono text-foreground-faint">
                        {product.itineraryDays}D
                      </span>
                      {from !== null && (
                        <span className="font-semibold text-amber-ink">
                          from {formatPhp(from)}
                        </span>
                      )}
                    </div>
                    {product.isSoldOut && (
                      <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Sold out
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
