import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Destination,
  Product,
  ProductFilter,
  ProductLine,
  ProductLineCode,
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
const DESTINATION_FIELDS = `id name country region description latitude longitude`;
const PRODUCT_SUMMARY_FIELDS = `
  id slug name productLine summary itineraryDays boardBasis
  availableCount isSoldOut heroImageUrl
  priceBands { label pricePhp startDate endDate }
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
  }),
});

export const {
  useGetStatusQuery,
  useGetProductLinesQuery,
  useGetDestinationsQuery,
  useGetProductsQuery,
  useGetProductQuery,
} = availabilityApi;
