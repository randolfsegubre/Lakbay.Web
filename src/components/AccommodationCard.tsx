"use client";

import Image from "next/image";
import Link from "next/link";
import type { Accommodation } from "@lakbay/contracts";
import { useGetRoomTypesQuery } from "@/lib/availabilityApi";
import { boardBasisLabel, formatPhp, lowestPrice } from "@/lib/catalog";

/**
 * Shared "hotel card" (ADR-0019) — the Stays search grid and the
 * Destination page's "Where you'll stay" section both render
 * Accommodations the same way. Each card resolves its own "from ₱X" via
 * its own RoomTypes query: RoomType syncs as its own top-level entity,
 * not embedded on Accommodation (see Lakbay.Contracts/csharp/RoomType.cs),
 * so there's no bulk price already on hand the way Product's own
 * priceBands are. `accommodation.destination` is only present when the
 * caller's query actually selected it (the Stays flow does; a Product's
 * embedded accommodation doesn't) — rendered only if present.
 */
export function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  const { data: roomTypes } = useGetRoomTypesQuery(accommodation.id);
  const from =
    roomTypes && roomTypes.length > 0
      ? lowestPrice(roomTypes.flatMap((r) => r.priceBands))
      : null;

  return (
    <Link
      href={`/stays/${accommodation.id}`}
      className="overflow-hidden rounded-xl border border-teal-line bg-surface shadow-sm transition hover:shadow-md"
    >
      {accommodation.heroImageUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={accommodation.heroImageUrl}
            alt={accommodation.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-teal-deep">{accommodation.name}</h3>
          {accommodation.officialRating != null && (
            <span className="shrink-0 text-sm font-medium text-amber-ink" title={`${accommodation.officialRating} stars`}>
              {"★".repeat(Math.round(accommodation.officialRating))}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-foreground-faint">
          {boardBasisLabel(accommodation.type)}
          {accommodation.destination?.name && <> · {accommodation.destination.name}</>}
        </p>
        <p className="mt-2 text-sm text-foreground-soft">{accommodation.description}</p>
        {accommodation.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {accommodation.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background px-2 py-0.5 text-xs text-foreground-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
        {from !== null && (
          <p className="mt-3 text-sm font-semibold text-amber-ink">from {formatPhp(from)} / night</p>
        )}
      </div>
    </Link>
  );
}
