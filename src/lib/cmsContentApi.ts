import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * RTK Query slice against Lakbay.Cms's Umbraco Content Delivery API —
 * the "optional: single-page content" path ADR-0007 describes, used here
 * for the Content tree (Home + product-line landing pages, Phase 3).
 * Never used for catalog/search data — that stays on availabilityApi
 * (ADR-0007, ADR-0009), unchanged.
 *
 * `sections` comes back from Cms as a JSON *string*, not a nested object —
 * ADR-0015 explains why (a real Umbraco Block List was attempted first;
 * its own Content Delivery API converter didn't round-trip the stored
 * value, so Lakbay.Cms stores/serves this field as plain JSON text
 * instead, parsed here on this side).
 */

export type CmsSection =
  | { type: "hero"; heading: string; subtext: string; imageUrl: string }
  | { type: "imageText"; heading: string; text: string; imageUrl: string; imagePosition: "left" | "right" };

export interface CmsPageContent {
  heading: string;
  subtext?: string;
  heroImageUrl: string;
  sections: CmsSection[];
}

interface DeliveryApiItem {
  properties: Record<string, string | undefined>;
}

function parseSections(raw: string | undefined): CmsSection[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CmsSection[]) : [];
  } catch {
    // A section list mid-edit in the backoffice (invalid JSON) should
    // never break the page — render with no sections rather than error.
    return [];
  }
}

export const cmsContentApi = createApi({
  reducerPath: "cmsContentApi",
  baseQuery: fetchBaseQuery({
    // http, not https — Lakbay.Cms's local dev cert isn't trusted by the
    // browser by default (dotnet dev-certs https --trust is a separate,
    // per-machine step); the plain-http Kestrel endpoint sidesteps that
    // entirely for local dev.
    baseUrl:
      process.env.NEXT_PUBLIC_CMS_DELIVERY_API_URL ??
      "http://localhost:26124/umbraco/delivery/api/v2",
  }),
  endpoints: (builder) => ({
    getHomeContent: builder.query<CmsPageContent, void>({
      query: () => "/content/item/home",
      transformResponse: (item: DeliveryApiItem): CmsPageContent => ({
        heading: item.properties.heroHeading ?? "",
        subtext: item.properties.heroSubtext,
        heroImageUrl: item.properties.heroImageUrl ?? "",
        sections: parseSections(item.properties.sections),
      }),
    }),

    // Deliberately not a direct "/content/item/{urlSegment}" route lookup:
    // a landing page's Umbraco url segment collides with the Products
    // tree's ProductLine node of the same name (both named "Alon", etc.,
    // both root-reachable) — Umbraco resolves that collision to whichever
    // one it likes, which in practice was the *wrong* tree. Fetching
    // Home's children and matching by productLineCode client-side
    // sidesteps the collision entirely rather than renaming either tree's
    // nodes (a bigger restructure — real container nodes per tree — left
    // for whenever the Content tree's own IA gets revisited).
    getLandingPageContent: builder.query<CmsPageContent | null, string>({
      query: () => "/content?fetch=children:home&take=20",
      transformResponse: (response: { items: DeliveryApiItem[] }, _meta, code: string): CmsPageContent | null => {
        const item = response.items.find(
          (i) => i.properties.productLineCode?.toUpperCase() === code.toUpperCase(),
        );

        if (!item) {
          return null;
        }

        return {
          heading: item.properties.heading ?? "",
          heroImageUrl: item.properties.heroImageUrl ?? "",
          sections: parseSections(item.properties.sections),
        };
      },
    }),

    // ADR-0018: Region/Destination landing pages nest under varying
    // parents (a different ProductLine/Region page per line) — unlike
    // Home, there's no single well-known parent ID a client can hardcode.
    // Filtering by content type across the whole tree and matching by
    // `slug` client-side sidesteps that entirely, same "don't rely on
    // Umbraco's own route resolution" spirit as getLandingPageContent
    // above, generalized to not need a parent reference at all.
    getRegionPageContent: builder.query<CmsPageContent | null, string>({
      query: () => "/content?filter=contentType:regionLandingPage&take=100",
      transformResponse: (response: { items: DeliveryApiItem[] }, _meta, slug: string): CmsPageContent | null => {
        const item = response.items.find((i) => i.properties.slug === slug);
        if (!item) return null;

        return {
          heading: item.properties.heading ?? "",
          heroImageUrl: item.properties.heroImageUrl ?? "",
          sections: parseSections(item.properties.sections),
        };
      },
    }),

    getDestinationPageContent: builder.query<CmsPageContent | null, string>({
      query: () => "/content?filter=contentType:destinationLandingPage&take=100",
      transformResponse: (response: { items: DeliveryApiItem[] }, _meta, slug: string): CmsPageContent | null => {
        const item = response.items.find((i) => i.properties.slug === slug);
        if (!item) return null;

        return {
          heading: item.properties.heading ?? "",
          heroImageUrl: item.properties.heroImageUrl ?? "",
          sections: parseSections(item.properties.sections),
        };
      },
    }),
  }),
});

export const {
  useGetHomeContentQuery,
  useGetLandingPageContentQuery,
  useGetRegionPageContentQuery,
  useGetDestinationPageContentQuery,
} = cmsContentApi;
