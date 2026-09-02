import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * RTK Query slice against Lakbay.AvailabilityApi's GraphQL endpoint — the
 * default, permanent path for all catalog/search data (ADR-0007,
 * ADR-0009). Phase 0 only proves the wiring works end-to-end against the
 * `{ status }` placeholder field; real endpoints (productLines,
 * destinations, products, product(slug:)) arrive in Phase 2, generated
 * from Lakbay.Contracts' schema rather than hand-typed like this one.
 */
export const availabilityApi = createApi({
  reducerPath: "availabilityApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_AVAILABILITY_API_URL ?? "http://localhost:5000",
  }),
  endpoints: (builder) => ({
    getStatus: builder.query<{ status: string }, void>({
      query: () => ({
        url: "/graphql",
        method: "POST",
        body: { query: "{ status }" },
      }),
      transformResponse: (response: { data: { status: string } }) =>
        response.data,
    }),
  }),
});

export const { useGetStatusQuery } = availabilityApi;
