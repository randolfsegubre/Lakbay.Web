"use client";

import { useGetStatusQuery } from "@/lib/availabilityApi";

/**
 * Phase 0 placeholder — proves the Next.js + Redux Toolkit + RTK Query
 * wiring works end-to-end against a running Lakbay.AvailabilityApi. Real
 * catalog/product-line pages (Alon, Amihan, Parul, Pamana) arrive in
 * Phase 2 — see Lakbay.Docs/docs/02_BUILD_PLAN.md.
 */
export default function Home() {
  const { data, error, isLoading } = useGetStatusQuery();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">Lakbay</h1>
      <p className="text-sm text-neutral-500">
        Phase 0 — proving the frontend talks to Lakbay.AvailabilityApi.
      </p>
      {isLoading && <p>Checking Lakbay.AvailabilityApi…</p>}
      {error && (
        <p className="text-red-600">
          Lakbay.AvailabilityApi isn&apos;t reachable at{" "}
          {process.env.NEXT_PUBLIC_AVAILABILITY_API_URL ??
            "http://localhost:5000"}
          . Run it locally, then reload.
        </p>
      )}
      {data && (
        <p className="text-green-700">
          Lakbay.AvailabilityApi says: {data.status}
        </p>
      )}
    </main>
  );
}
