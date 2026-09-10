"use client";

import { use } from "react";
import Image from "next/image";
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
        className="relative overflow-hidden border-b border-teal-line px-6 py-14 text-center text-white"
        style={{ backgroundColor: meta.accent }}
      >
        {product.heroImageUrl && (
          <>
            <Image
              src={product.heroImageUrl}
              alt={product.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative">
          <span className="text-3xl">{meta.emoji}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold text-balance">
            {product.name}
          </h1>
          <p className="mt-2 text-white/85">{destinationLocation(product.destination)}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/collections/${product.productLine.toLowerCase()}`}
          className="text-sm text-teal-mid hover:underline"
        >
          ← Back to {meta.label}
        </Link>

        <p className="mt-6 text-foreground">{product.summary}</p>

        {/* ADR-0017: Country > Region > Destination, each level carrying
            its own highlights — the "details of places can be
            highlighted" the geography restructure exists for. */}
        <p className="mt-4 text-xs font-mono uppercase tracking-wide text-foreground-faint">
          {product.destination.region.country.name} → {product.destination.region.name} → {product.destination.name}
        </p>
        <p className="mt-2 text-sm text-foreground-soft">{product.destination.description}</p>

        {(product.destination.region.highlights.length > 0 || product.destination.region.country.highlights.length > 0) && (
          <div className="mt-4 rounded-xl border border-teal-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-teal-deep">About {product.destination.region.name}</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
              {product.destination.region.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-teal-mid">•</span>
                  {h}
                </li>
              ))}
              {product.destination.region.country.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-foreground-faint">
                  <span className="text-foreground-faint">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* A real, prominent section — not a small text card — matching
            Inntravel's own dedicated Accommodation treatment (verified
            live, 2026-09-08). Photo reuses the destination's own real
            image; see ADR-0018 for why no photo claims to depict the
            specific (invented) property. */}
        {product.accommodation && (
          <div className="mt-6 overflow-hidden rounded-xl border border-teal-line bg-surface shadow-sm sm:grid sm:grid-cols-2">
            {product.accommodation.heroImageUrl && (
              <div className="relative h-56 w-full sm:h-full">
                <Image
                  src={product.accommodation.heroImageUrl}
                  alt={product.accommodation.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <h2 className="text-lg font-semibold text-teal-deep">Where you&apos;ll stay</h2>
              <p className="mt-1 font-medium text-foreground">{product.accommodation.name}</p>
              <p className="mt-1 text-sm text-foreground-soft">{product.accommodation.description}</p>
              {product.accommodation.highlights.length > 0 && (
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {product.accommodation.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-teal-mid">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {(product.includedActivities.length > 0 || product.optionalActivities.length > 0) && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {product.includedActivities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-teal-deep">What&apos;s included</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {product.includedActivities.map((activity) => (
                    <li key={activity} className="flex gap-2">
                      <span className="text-teal-mid">✓</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.optionalActivities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-teal-deep">Optional extras</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {product.optionalActivities.map((activity) => (
                    <li key={activity} className="flex gap-2">
                      <span className="text-foreground-faint">+</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
