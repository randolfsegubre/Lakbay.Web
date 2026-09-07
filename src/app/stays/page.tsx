"use client";

import { useMemo, useState } from "react";
import { useGetAccommodationsQuery, useGetDestinationsQuery } from "@/lib/availabilityApi";
import { AccommodationCard } from "@/components/AccommodationCard";
import { boardBasisLabel } from "@/lib/catalog";

/**
 * Cross-destination hotel search (ADR-0019) — "search for a specific
 * hotel, let's say Boracay, a budget-friendly hotel for a family
 * holiday" is a real destination + tag filter over Accommodations, not
 * something the earlier per-destination-only browsing supported.
 * Fetches the full (small) accommodation list and filters client-side —
 * same pattern the collection pages already use for UI-driven filtering.
 */
export default function StaysPage() {
  const { data: accommodations, isLoading, error } = useGetAccommodationsQuery(undefined);
  const { data: destinations } = useGetDestinationsQuery(undefined);

  const [destinationId, setDestinationId] = useState("");
  const [tag, setTag] = useState("");
  const [type, setType] = useState("");

  const tagOptions = useMemo(
    () => Array.from(new Set(accommodations?.flatMap((a) => a.tags) ?? [])).sort(),
    [accommodations],
  );

  // ADR-0020: real Philippine accommodation categories — not every stay
  // is a Hotel, confirmed via research before adding this field.
  const typeOptions = useMemo(
    () => Array.from(new Set(accommodations?.map((a) => a.type) ?? [])).sort(),
    [accommodations],
  );

  const filtered = useMemo(
    () =>
      (accommodations ?? []).filter((a) => {
        if (destinationId && a.destination.id !== destinationId) return false;
        if (tag && !a.tags.includes(tag)) return false;
        if (type && a.type !== type) return false;
        return true;
      }),
    [accommodations, destinationId, tag, type],
  );

  return (
    <main className="flex-1">
      <section className="border-b border-teal-line px-6 py-12 text-center text-white" style={{ backgroundColor: "#1f6f72" }}>
        <h1 className="text-3xl font-semibold">Find your stay</h1>
        <p className="mx-auto mt-1 max-w-xl text-white/85">
          Browse accommodations across every Lakbay destination — pick a hotel first, then add activities and
          perks to build your own holiday around it.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap gap-3">
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="rounded-lg border border-teal-line bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="">All destinations</option>
            {destinations?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-teal-line bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="">All accommodation types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {boardBasisLabel(t)}
              </option>
            ))}
          </select>

          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-lg border border-teal-line bg-surface px-3 py-2 text-sm text-foreground"
          >
            <option value="">All tags</option>
            {tagOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="mt-6 text-foreground-soft">Loading stays…</p>}
        {error && <p className="mt-6 text-red-600">Couldn&apos;t load accommodations right now.</p>}
        {accommodations && filtered.length === 0 && (
          <p className="mt-6 text-foreground-soft">No stays match those filters yet.</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))}
        </div>
      </section>
    </main>
  );
}
