import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Accommodation,
  Activity,
  Destination,
  Product,
  ProductFilter,
  ProductLine,
  ProductLineCode,
  Region,
  RoomType,
} from "@lakbay/contracts";

/**
 * RTK Query slice against Lakbay.AvailabilityApi's GraphQL endpoint — the
 * default, permanent path for all catalog/search data (ADR-0007,
 * ADR-0009), including after Lakbay.Cms exists (Lakbay.Web is never
 * repointed away from this API — see that ADR).
 *
 * Each endpoint's request/response shape is hand-typed against
 * Lakbay.Contracts' generated types rather than trusting `any` — a
 * schema field rename shows up here as a compile error, not a silent
 * runtime `undefined`.
 */

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

function graphql<TVariables extends Record<string, unknown> | void>(
  query: string,
) {
  return (variables: TVariables) => ({
    url: "/graphql",
    method: "POST" as const,
    body: { query, variables: variables ?? undefined },
  });
}

function unwrap<T>(response: GraphQLResponse<T>): T {
  if (response.errors?.length) {
    throw new Error(response.errors.map((e) => e.message).join("; "));
  }
  return response.data as T;
}

const PRODUCT_LINE_FIELDS = `code name tagline countries`;
// ADR-0017: region/country are nested objects now, not flat strings —
// each level carries its own highlights, matching the real ECMS
// Country→Region→Destination→Accommodation tree shape.
const COUNTRY_FIELDS = `id name code description highlights`;
const REGION_FIELDS = `id name slug description highlights country { ${COUNTRY_FIELDS} }`;
// ADR-0019: includedPerks/optionalAddOns are resort-wide, shared by any
// stay at this destination regardless of which Accommodation.
const DESTINATION_FIELDS = `id name slug country description latitude longitude includedPerks optionalAddOns region { ${REGION_FIELDS} }`;
// ADR-0020: real Philippine accommodation categories — not every stay is a Hotel.
const ACCOMMODATION_FIELDS = `id name description highlights heroImageUrl type tags officialRating`;
// A fuller variant used only where the owning Destination is actually
// needed (the Stays search/detail flow) — kept separate from
// ACCOMMODATION_FIELDS so the existing Product query below doesn't fetch
// a redundant nested Destination it already has directly.
const ACCOMMODATION_WITH_DESTINATION_FIELDS = `${ACCOMMODATION_FIELDS} destination { ${DESTINATION_FIELDS} }`;
const ROOM_TYPE_FIELDS = `
  id name description sizeSqm bedConfiguration maxOccupancy boardBasis accommodationId
  priceBands { label pricePhp startDate endDate }
  heroImageUrl monthlyRatePhp
`;
// ADR-0020: the fair-price local-activities marketplace — independent of any Product package.
const ACTIVITY_FIELDS = `
  id name description durationLabel pricePhp includes heroImageUrl
  destination { ${DESTINATION_FIELDS} }
`;
const PRODUCT_SUMMARY_FIELDS = `
  id slug name productLine summary itineraryDays boardBasis
  availableCount isSoldOut heroImageUrl
  priceBands { label pricePhp startDate endDate }
  accommodation { ${ACCOMMODATION_FIELDS} }
  includedActivities optionalActivities
  destination { ${DESTINATION_FIELDS} }
`;

export const availabilityApi = createApi({
  reducerPath: "availabilityApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_AVAILABILITY_API_URL ?? "http://localhost:5170",
  }),
  endpoints: (builder) => ({
    getStatus: builder.query<{ status: string }, void>({
      query: () => ({
        url: "/graphql",
        method: "POST",
        body: { query: "{ status }" },
      }),
      transformResponse: (response: GraphQLResponse<{ status: string }>) =>
        unwrap(response),
    }),

    getProductLines: builder.query<ProductLine[], void>({
      query: graphql(`{ productLines { ${PRODUCT_LINE_FIELDS} } }`),
      transformResponse: (response: GraphQLResponse<{ productLines: ProductLine[] }>) =>
        unwrap(response).productLines,
    }),

    getRegions: builder.query<Region[], ProductLineCode | undefined>({
      query: (productLine) =>
        graphql<{ productLine?: ProductLineCode }>(
          `query($productLine: ProductLineCode) { regions(productLine: $productLine) { ${REGION_FIELDS} } }`,
        )({ productLine }),
      transformResponse: (response: GraphQLResponse<{ regions: Region[] }>) =>
        unwrap(response).regions,
    }),

    getDestinations: builder.query<Destination[], ProductLineCode | undefined>({
      query: (productLine) =>
        graphql<{ productLine?: ProductLineCode }>(
          `query($productLine: ProductLineCode) { destinations(productLine: $productLine) { ${DESTINATION_FIELDS} } }`,
        )({ productLine }),
      transformResponse: (response: GraphQLResponse<{ destinations: Destination[] }>) =>
        unwrap(response).destinations,
    }),

    getProducts: builder.query<Product[], ProductFilter | undefined>({
      query: (filter) =>
        graphql<{ filter?: ProductFilter }>(
          `query($filter: ProductFilter) { products(filter: $filter) { ${PRODUCT_SUMMARY_FIELDS} } }`,
        )({ filter }),
      transformResponse: (response: GraphQLResponse<{ products: Product[] }>) =>
        unwrap(response).products,
    }),

    getProduct: builder.query<Product | null, string>({
      query: (slug) =>
        graphql<{ slug: string }>(
          `query($slug: String!) { product(slug: $slug) { ${PRODUCT_SUMMARY_FIELDS} } }`,
        )({ slug }),
      transformResponse: (response: GraphQLResponse<{ product: Product | null }>) =>
        unwrap(response).product,
    }),

    // ADR-0019: the Stays page's main query. Called with no arguments to
    // fetch the full (small) list and filter destination/tag client-side —
    // same pattern the collection pages already use for UI-driven
    // filtering — even though the resolver also accepts server-side
    // destinationId/tag filters.
    getAccommodations: builder.query<Accommodation[], { destinationId?: string; tag?: string } | void>({
      query: (filter) =>
        graphql<{ destinationId?: string; tag?: string }>(
          `query($destinationId: String, $tag: String) { accommodations(destinationId: $destinationId, tag: $tag) { ${ACCOMMODATION_WITH_DESTINATION_FIELDS} } }`,
        )({ destinationId: filter?.destinationId, tag: filter?.tag }),
      transformResponse: (response: GraphQLResponse<{ accommodations: Accommodation[] }>) =>
        unwrap(response).accommodations,
    }),

    getRoomTypes: builder.query<RoomType[], string>({
      query: (accommodationId) =>
        graphql<{ accommodationId: string }>(
          `query($accommodationId: String!) { roomTypes(accommodationId: $accommodationId) { ${ROOM_TYPE_FIELDS} } }`,
        )({ accommodationId }),
      transformResponse: (response: GraphQLResponse<{ roomTypes: RoomType[] }>) =>
        unwrap(response).roomTypes,
    }),

    // ADR-0020: fair-price local activities, independent of any Product
    // package — called with no arguments to fetch the full (small) list
    // and filter destination client-side, same pattern as getAccommodations.
    getActivities: builder.query<Activity[], string | void>({
      query: (destinationId) =>
        graphql<{ destinationId?: string }>(
          `query($destinationId: String) { activities(destinationId: $destinationId) { ${ACTIVITY_FIELDS} } }`,
        )({ destinationId: destinationId ?? undefined }),
      transformResponse: (response: GraphQLResponse<{ activities: Activity[] }>) =>
        unwrap(response).activities,
    }),
  }),
});

export const {
  useGetStatusQuery,
  useGetProductLinesQuery,
  useGetRegionsQuery,
  useGetDestinationsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetAccommodationsQuery,
  useGetRoomTypesQuery,
  useGetActivitiesQuery,
} = availabilityApi;
