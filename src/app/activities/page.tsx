"use client";

import { use, useMemo, useState } from "react";
import { useGetActivitiesQuery, useGetDestinationsQuery } from "@/lib/availabilityApi";
import { ActivityCard } from "@/components/ActivityCard";

/**
 * A fair-price local activities marketplace (ADR-0020) — the direct
 * answer to "buying from a local risks getting scammed or overpriced."
 * Every activity has a fixed price and itemized inclusions, matching the
 * real Klook/GetYourGuide anti-scam pattern confirmed via research.
 * Bookable independently of any Product package — pick a stay (Stays),
 * then add activities on your own terms, no rigid itinerary required.
 */
export default function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ destinationId?: string }>;
}) {
  const { destinationId: initialDestinationId } = use(searchParams);
  const { data: activities, isLoading, error } = useGetActivitiesQuery(undefined);
  const { data: destinations } = useGetDestinationsQuery(undefined);

  const [destinationId, setDestinationId] = useState(initialDestinationId ?? "");

  const filtered = useMemo(
    () => (activities ?? []).filter((a) => !destinationId || a.destination.id === destinationId),
    [activities, destinationId],
  );

  return (
    <main className="flex-1">
      <section className="border-b border-teal-line px-6 py-12 text-center text-white" style={{ backgroundColor: "#b9770e" }}>
        <h1 className="text-3xl font-semibold">Book activities, not a package</h1>
        <p className="mx-auto mt-1 max-w-xl text-white/85">
          Real local activities at a fixed, agreed-upfront price — every inclusion itemized, no haggling, no
          surprise mark-up. Add them to any stay, on your own schedule.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
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

        {isLoading && <p className="mt-6 text-foreground-soft">Loading activities…</p>}
        {error && <p className="mt-6 text-red-600">Couldn&apos;t load activities right now.</p>}
        {activities && filtered.length === 0 && (
          <p className="mt-6 text-foreground-soft">No activities match that destination yet.</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </main>
  );
}
