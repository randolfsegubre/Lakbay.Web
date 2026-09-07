import Image from "next/image";
import type { RoomType } from "@lakbay/contracts";
import { boardBasisLabel, formatPhp, lowestPrice } from "@/lib/catalog";

/**
 * A real "pick your room" list (ADR-0019, the Inghams Room Types
 * pattern) — shared by the Destination page's "Where you'll stay"
 * section and the Accommodation detail page.
 */
export function RoomTypeList({ roomTypes }: { roomTypes: RoomType[] }) {
  if (roomTypes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {roomTypes.map((room) => {
        const price = lowestPrice(room.priceBands);
        return (
          <div key={room.id} className="overflow-hidden rounded-lg border border-teal-line bg-background">
            {room.heroImageUrl && (
              <div className="relative h-32 w-full">
                <Image
                  src={room.heroImageUrl}
                  alt={room.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-foreground">{room.name}</h4>
              <p className="mt-1 text-sm text-foreground-soft">{room.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-foreground-faint">
                <div>
                  <dt className="uppercase tracking-wide">Size</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{room.sizeSqm ?? "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide">Sleeps</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{room.maxOccupancy}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="uppercase tracking-wide">Bed</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{room.bedConfiguration}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide">Board</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{boardBasisLabel(room.boardBasis)}</dd>
                </div>
              </dl>
              {price !== null && (
                <p className="mt-3 text-sm font-semibold text-amber-ink">{formatPhp(price)} / night</p>
              )}
              {/* ADR-0020: a flat monthly option for travelers without a fixed return date. */}
              {room.monthlyRatePhp != null && (
                <p className="mt-1 text-xs text-teal-mid">
                  or {formatPhp(room.monthlyRatePhp)} / month for long stays
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
