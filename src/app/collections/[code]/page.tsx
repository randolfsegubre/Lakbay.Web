"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductLineCode } from "@lakbay/contracts";
import { useGetProductLinesQuery, useGetProductsQuery } from "@/lib/availabilityApi";
import { PRODUCT_LINE_META, destinationLocation, formatPhp, lowestPrice } from "@/lib/catalog";

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

  const line = productLines?.find((l) => l.code === code);
  const meta = PRODUCT_LINE_META[code];

  return (
    <main className="flex-1">
      <section
        className="border-b border-teal-line px-6 py-12 text-center text-white"
        style={{ backgroundColor: meta.accent }}
      >
        <span className="text-3xl">{meta.emoji}</span>
        <h1 className="mt-2 text-3xl font-semibold">
          {line?.name ?? code[0] + code.slice(1).toLowerCase()}
        </h1>
        {line && <p className="mt-1 text-white/85">{line.tagline}</p>}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="text-sm text-teal-mid hover:underline">
          ← All collections
        </Link>

        {isLoading && <p className="mt-6 text-foreground-soft">Loading holidays…</p>}
        {error && (
          <p className="mt-6 text-red-600">
            Couldn&apos;t load {code[0] + code.slice(1).toLowerCase()} holidays right now.
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
                  className="rounded-xl border border-teal-line bg-surface p-5 shadow-sm transition hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-teal-deep">{product.name}</h2>
                  <p className="mt-1 text-sm text-foreground-faint">
                    {destinationLocation(product.destination)}
                  </p>
                  <p className="mt-2 text-sm text-foreground-soft">{product.summary}</p>
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
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
