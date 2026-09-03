import { ProductLineCode } from "@lakbay/contracts";

/**
 * Presentation-only metadata keyed by the stable ProductLineCode enum —
 * never the other way around. Name/tagline still come from the API
 * (ProductLine.name/tagline); this only supplies things the schema
 * deliberately doesn't carry (an accent color, an emoji standing in for
 * imagery until Phase 5's real photography).
 */
export const PRODUCT_LINE_META: Record<
  ProductLineCode,
  { emoji: string; accent: string }
> = {
  [ProductLineCode.Alon]: { emoji: "🌊", accent: "#1f6f72" },
  [ProductLineCode.Amihan]: { emoji: "🌲", accent: "#3a7d5c" },
  [ProductLineCode.Parul]: { emoji: "🏮", accent: "#b9770e" },
  [ProductLineCode.Pamana]: { emoji: "🏛️", accent: "#7a4e07" },
};

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPhp(amount: number): string {
  return phpFormatter.format(amount);
}

export function lowestPrice(priceBands: { pricePhp: number }[]): number | null {
  if (priceBands.length === 0) return null;
  return Math.min(...priceBands.map((b) => b.pricePhp));
}

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** Avoids "Coron, Palawan, Palawan" when a destination's name already names its region. */
export function destinationLocation(destination: { name: string; region?: string | null }): string {
  if (!destination.region || destination.name.includes(destination.region)) {
    return destination.name;
  }
  return `${destination.name}, ${destination.region}`;
}

export function boardBasisLabel(basis: string): string {
  return basis
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
