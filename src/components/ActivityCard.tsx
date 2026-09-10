import Image from "next/image";
import type { Activity } from "@lakbay/contracts";
import { formatPhp } from "@/lib/catalog";

/**
 * A real, independently bookable local activity at a fixed price
 * (ADR-0020) — the direct answer to "buying from a local risks getting
 * scammed or overpriced." Every inclusion itemized, matching the real
 * Klook/GetYourGuide pattern confirmed via research.
 */
export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="overflow-hidden rounded-xl border border-teal-line bg-surface shadow-sm">
      {activity.heroImageUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={activity.heroImageUrl}
            alt={activity.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-teal-deep">{activity.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-amber-ink">{formatPhp(activity.pricePhp)}</span>
        </div>
        <p className="mt-1 text-xs text-foreground-faint">
          {activity.durationLabel}
          {activity.destination?.name && <> · {activity.destination.name}</>}
        </p>
        <p className="mt-2 text-sm text-foreground-soft">{activity.description}</p>
        {activity.includes.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-foreground-soft">
            {activity.includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-teal-mid">✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-foreground-faint">Fixed price, agreed upfront — no haggling.</p>
      </div>
    </div>
  );
}
