"use client";

import { use } from "react";
import Link from "next/link";
import { useGetProductQuery } from "@/lib/availabilityApi";
import { PRODUCT_LINE_META, boardBasisLabel, destinationLocation, formatDate, formatPhp } from "@/lib/catalog";

export default function HolidayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, error, isLoading } = useGetProductQuery(slug);

  if (isLoading) {
    return <main className="flex-1 px-6 py-12 text-center text-foreground-soft">Loading…</main>;
  }

  if (error || product === null) {
    return (
      <main className="flex-1 px-6 py-12 text-center">
        <p className="text-foreground-soft">This holiday doesn&apos;t exist, or isn&apos;t published.</p>
        <Link href="/" className="mt-3 inline-block text-teal-mid hover:underline">
          Back to collections
        </Link>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const meta = PRODUCT_LINE_META[product.productLine];

  return (
    <main className="flex-1">
      <section
        className="border-b border-teal-line px-6 py-14 text-center text-white"
        style={{ backgroundColor: meta.accent }}
      >
        <span className="text-3xl">{meta.emoji}</span>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold text-balance">
          {product.name}
        </h1>
        <p className="mt-2 text-white/85">{destinationLocation(product.destination)}</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/collections/${product.productLine.toLowerCase()}`}
          className="text-sm text-teal-mid hover:underline"
        >
          ← Back to {product.productLine[0] + product.productLine.slice(1).toLowerCase()}
        </Link>

        <p className="mt-6 text-foreground">{product.summary}</p>
        <p className="mt-4 text-sm text-foreground-soft">{product.destination.description}</p>

        <dl className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-teal-line bg-surface p-5 sm:grid-cols-4">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-foreground-faint">
              Duration
            </dt>
            <dd className="mt-1 font-semibold text-foreground">{product.itineraryDays} days</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-foreground-faint">
              Board basis
            </dt>
            <dd className="mt-1 font-semibold text-foreground">
              {boardBasisLabel(product.boardBasis)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-foreground-faint">
              Availability
            </dt>
            <dd className="mt-1 font-semibold text-foreground">
              {product.isSoldOut ? (
                <span className="text-red-700">Sold out</span>
              ) : (
                `${product.availableCount} spots left`
              )}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-foreground-faint">
              Destination
            </dt>
            <dd className="mt-1 font-semibold text-foreground">{product.destination.country}</dd>
          </div>
        </dl>

        <h2 className="mt-10 text-lg font-semibold text-teal-deep">Price bands</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-teal-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-background font-mono text-xs uppercase tracking-wide text-foreground-faint">
              <tr>
                <th className="px-4 py-2">Season</th>
                <th className="px-4 py-2">Dates</th>
                <th className="px-4 py-2 text-right">Price per person</th>
              </tr>
            </thead>
            <tbody>
              {product.priceBands.map((band) => (
                <tr key={band.label} className="border-t border-teal-line">
                  <td className="px-4 py-2">{band.label}</td>
                  <td className="px-4 py-2 text-foreground-soft">
                    {formatDate(band.startDate)} – {formatDate(band.endDate)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-amber-ink">
                    {formatPhp(band.pricePhp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          disabled
          title="Booking opens in Phase 4 (Lakbay.Booking) — not built yet"
          className="mt-8 w-full cursor-not-allowed rounded-lg bg-teal-deep px-6 py-3 font-semibold text-white opacity-50"
        >
          Book this holiday — coming in Phase 4
        </button>
      </section>
    </main>
  );
}
