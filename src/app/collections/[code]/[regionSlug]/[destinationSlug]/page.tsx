"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductLineCode } from "@lakbay/contracts";
import { useGetActivitiesQuery, useGetDestinationsQuery, useGetProductsQuery, useGetRoomTypesQuery } from "@/lib/availabilityApi";
import { useGetDestinationPageContentQuery } from "@/lib/cmsContentApi";
import { PRODUCT_LINE_META, formatPhp, lowestPrice } from "@/lib/catalog";
import { CmsSections } from "@/components/blocks/BlockRegistry";
import { RoomTypeList } from "@/components/RoomTypeList";
import { ActivityCard } from "@/components/ActivityCard";

/** A stay's own Room Types — fetched per-Accommodation, same reasoning as AccommodationCard's own query (RoomType syncs as a separate entity, not embedded). */
function AccommodationRoomTypes({ accommodationId }: { accommodationId: string }) {
  const { data: roomTypes } = useGetRoomTypesQuery(accommodationId);
  return <RoomTypeList roomTypes={roomTypes ?? []} />;
}

function parseCode(raw: string): ProductLineCode | null {
  const upper = raw.toUpperCase();
  return (Object.values(ProductLineCode) as string[]).includes(upper)
    ? (upper as ProductLineCode)
    : null;
}

export default function DestinationPage({
  params,
}: {
  params: Promise<{ code: string; regionSlug: string; destinationSlug: string }>;
}) {
  const { code: rawCode, regionSlug, destinationSlug } = use(params);
  const code = parseCode(rawCode);

  if (!code) {
    notFound();
  }

  const { data: destinations } = useGetDestinationsQuery(code);
  const destination = destinations?.find((d) => d.slug === destinationSlug);

  const { data: landingContent } = useGetDestinationPageContentQuery(destinationSlug);
  const { data: products } = useGetProductsQuery(
    destination ? { destinationId: destination.id } : undefined,
    { skip: !destination },
  );
  // ADR-0020: real, fixed-price local activities here — the "flexibility,
  // no rigid package schedule" alternative to booking a Product.
  const { data: activities } = useGetActivitiesQuery(destination?.id, { skip: !destination });

  const meta = PRODUCT_LINE_META[code];

  if (destinations && !destination) {
    notFound();
  }

  // Every Product at this destination carries its own Accommodation
  // (ADR-0017) — usually one distinct stay per destination today, shown
  // as its own first-class section rather than a small card, matching
  // Inntravel's real dedicated "Accommodation" tab (verified live —
  // 2026-09-08 research) rather than Lakbay's earlier, easy-to-miss
  // treatment.
  const accommodations = products
    ? Array.from(new Map(products.filter((p) => p.accommodation).map((p) => [p.accommodation!.id, p.accommodation!])).values())
    : [];

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
          <h1 className="mt-2 text-3xl font-semibold">{destination?.name ?? destinationSlug}</h1>
        </section>
      )}

      {landingContent && (
        <CmsSections sections={landingContent.sections.filter((s) => s.type !== "hero")} />
      )}

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/collections/${code.toLowerCase()}/${regionSlug}`}
          className="text-sm text-teal-mid hover:underline"
        >
          ← Back to {destination?.region.name ?? "region"}
        </Link>

        {destination && <p className="mt-6 text-foreground">{destination.description}</p>}

        {/* Accommodation: a real, prominent section — a photo, a name,
            a description, and highlights — not a small text-only card.
            This is what the destination genuinely offers to stay in. */}
        {accommodations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-teal-deep">Where you&apos;ll stay</h2>
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {accommodations.map((accom) => (
                <div key={accom.id} className="overflow-hidden rounded-xl border border-teal-line bg-surface shadow-sm">
                  {accom.heroImageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={accom.heroImageUrl}
                        alt={accom.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{accom.name}</h3>
                    <p className="mt-1 text-sm text-foreground-soft">{accom.description}</p>
                    {accom.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1.5 text-sm text-foreground-soft">
                        {accom.highlights.map((h) => (
                          <li key={h} className="flex gap-2">
                            <span className="text-teal-mid">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* ADR-0019: a real "pick your room" list, not just a description — the half of the Inghams research this destination page was missing. */}
                    <div className="mt-4">
                      <AccommodationRoomTypes accommodationId={accom.id} />
                    </div>
                    <Link href={`/stays/${accom.id}`} className="mt-3 inline-block text-sm text-teal-mid hover:underline">
                      See full details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* ADR-0019: resort-wide, shared by any stay here regardless of which Accommodation — not duplicated per-hotel copy. */}
            {(destination?.includedPerks.length ?? 0) > 0 || (destination?.optionalAddOns.length ?? 0) > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {destination && destination.includedPerks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-teal-deep">Included with any stay here</h3>
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
                {destination && destination.optionalAddOns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-teal-deep">Optional add-ons</h3>
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
            ) : null}
          </div>
        )}

        {activities && activities.length > 0 && (
          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-teal-deep">Book activities here</h2>
              {destination && (
                <Link href={`/activities?destinationId=${destination.id}`} className="text-sm text-teal-mid hover:underline">
                  See all activities →
                </Link>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground-soft">
              Fixed prices, agreed upfront — add them to any stay instead of a set package schedule.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {activities.slice(0, 3).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}

        <h2 className="mt-8 text-lg font-semibold text-teal-deep">Or book as a ready-made package</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {products?.map((product) => {
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
      </section>
    </main>
  );
}
