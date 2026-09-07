import { ProductLineCode } from "@lakbay/contracts";

/**
 * Presentation-only metadata keyed by the stable ProductLineCode enum —
 * never the other way around. Tagline still comes from the API
 * (ProductLine.tagline); `label` is the English display name (nav bar,
 * fallback headings) — codes (ALON/AMIHAN/PARUL/PAMANA) stay the stable
 * identifier throughout the schema, this is presentation-only.
 */
export const PRODUCT_LINE_META: Record<
  ProductLineCode,
  { emoji: string; accent: string; label: string }
> = {
  [ProductLineCode.Alon]: { emoji: "🌊", accent: "#1f6f72", label: "Islands" },
  [ProductLineCode.Amihan]: { emoji: "🌲", accent: "#3a7d5c", label: "Highlands" },
  [ProductLineCode.Parul]: { emoji: "🏮", accent: "#b9770e", label: "Festivals" },
  [ProductLineCode.Pamana]: { emoji: "🏛️", accent: "#7a4e07", label: "Heritage" },
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

/**
 * Avoids "Coron, Palawan, Palawan" when a destination's name already
 * names its region. `region` is a full Region object since ADR-0017
 * (Country/Region/Accommodation are real content nodes, not flat
 * strings), so this reads `.name` off it rather than a bare string.
 */
export function destinationLocation(destination: { name: string; region?: { name: string } | null }): string {
  if (!destination.region || destination.name.includes(destination.region.name)) {
    return destination.name;
  }
  return `${destination.name}, ${destination.region.name}`;
}

export function boardBasisLabel(basis: string): string {
  return basis
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
