"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetAccommodationsQuery, useGetActivitiesQuery, useGetProductsQuery, useGetRoomTypesQuery } from "@/lib/availabilityApi";
import { RoomTypeList } from "@/components/RoomTypeList";
import { ActivityCard } from "@/components/ActivityCard";
import { formatPhp, lowestPrice } from "@/lib/catalog";

export default function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ accommodationId: string }>;
}) {
  const { accommodationId } = use(params);

  const { data: accommodations, isLoading } = useGetAccommodationsQuery(undefined);
  const accommodation = accommodations?.find((a) => a.id === accommodationId);

  const { data: roomTypes } = useGetRoomTypesQuery(accommodationId);

  // ADR-0019: Product is not replaced by Stays — a curated holiday that
  // already bundles this Accommodation is offered here as a secondary
  // "ready-made package" path, found via the same client-side filter
  // pattern already used elsewhere in this codebase (destinationId, etc.)
  const { data: products } = useGetProductsQuery(undefined);
  const relatedProducts = products?.filter((p) => p.accommodation?.id === accommodationId) ?? [];

  // ADR-0020: real, fixed-price local activities near this stay — the
  // "flexibility, no rigid package schedule" alternative to a Product.
  const { data: activities } = useGetActivitiesQuery(accommodation?.destination.id);
  const nearbyActivities = activities?.slice(0, 3) ?? [];

  if (isLoading) {
    return <main className="flex-1 px-6 py-12 text-center text-foreground-soft">Loading…</main>;
  }

  if (accommodations && !accommodation) {
    return (
      <main className="flex-1 px-6 py-12 text-center">
        <p className="text-foreground-soft">This stay doesn&apos;t exist, or isn&apos;t published.</p>
        <Link href="/stays" className="mt-3 inline-block text-teal-mid hover:underline">
          Back to Stays
        </Link>
      </main>
    );
  }

  if (!accommodation) {
    return null;
  }

  const destination = accommodation.destination;

  return (
    <main className="flex-1">
      <section
        className="relative overflow-hidden border-b border-teal-line px-6 py-14 text-center text-white"
        style={{ backgroundColor: "#1f6f72" }}
      >
        {accommodation.heroImageUrl && (
          <>
            <Image
              src={accommodation.heroImageUrl}
              alt={accommodation.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative">
          <h1 className="mx-auto max-w-2xl text-3xl font-semibold text-balance">{accommodation.name}</h1>
          {destination?.name && <p className="mt-2 text-white/85">{destination.name}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/stays" className="text-sm text-teal-mid hover:underline">
          ← Back to Stays
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {accommodation.officialRating != null && (
            <span className="text-amber-ink" title={`${accommodation.officialRating} stars`}>
              {"★".repeat(Math.round(accommodation.officialRating))}
            </span>
          )}
          {accommodation.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-background px-2 py-0.5 text-xs text-foreground-soft">
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-4 text-foreground">{accommodation.description}</p>

        {accommodation.highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-foreground-soft">
            {accommodation.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-teal-mid">•</span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-8 text-lg font-semibold text-teal-deep">Choose your room</h2>
        <div className="mt-3">
          <RoomTypeList roomTypes={roomTypes ?? []} />
        </div>

        {destination && (destination.includedPerks.length > 0 || destination.optionalAddOns.length > 0) && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {destination.includedPerks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-teal-deep">Included with your stay</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {destination.includedPerks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <span className="text-teal-mid">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {destination.optionalAddOns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-teal-deep">Optional add-ons</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                  {destination.optionalAddOns.map((addon) => (
                    <li key={addon} className="flex gap-2">
                      <span className="text-foreground-faint">+</span>
                      {addon}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {nearbyActivities.length > 0 && (
          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-teal-deep">Activities near your stay</h2>
              <Link
                href={destination ? `/activities?destinationId=${destination.id}` : "/activities"}
                className="text-sm text-teal-mid hover:underline"
              >
                See all activities →
              </Link>
            </div>
            <p className="mt-1 text-sm text-foreground-soft">
              Fixed prices, agreed upfront — pick and choose instead of a set package schedule.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {nearbyActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-teal-deep">Or book as a ready-made package</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {relatedProducts.map((product) => {
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
                      <h3 className="text-lg font-semibold text-teal-deep">{product.name}</h3>
                      <p className="mt-2 text-sm text-foreground-soft">{product.summary}</p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-mono text-foreground-faint">{product.itineraryDays}D</span>
                        {from !== null && (
                          <span className="font-semibold text-amber-ink">from {formatPhp(from)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
