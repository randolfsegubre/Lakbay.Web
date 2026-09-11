"use client";

/**
 * Next.js App Router error boundary — automatically wraps every route
 * segment under app/ (error.tsx is a Next.js file-convention, not a
 * component we import anywhere). Must be a Client Component: error
 * boundaries only work with React error boundaries, which don't exist in
 * Server Components. Catches any error thrown while rendering a page or
 * its data-fetching hooks (e.g. availabilityApi/cmsContentApi network
 * failures) and replaces just that segment - the site header from
 * layout.tsx still renders above it, since layout.tsx is a sibling this
 * boundary doesn't touch. See global-error.tsx for the one case this
 * doesn't cover (an error in the root layout itself).
 */

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Real errors always go to the console for debugging - never swallowed silently.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground-faint">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          We hit a snag loading this page
        </h1>
        <p className="mt-3 text-foreground-soft">
          This is on us, not you. Going back to the homepage usually clears it up.
        </p>
        <button
          type="button"
          onClick={() => {
            // A full navigation (not reset() + router.push) is deliberate:
            // reset() only re-renders this segment, which would just hit
            // the same error again if the underlying data/state is bad.
            // window.location.href forces a real reload, clearing every
            // in-memory RTK Query cache entry and component state, then
            // starts the app fresh at "/" - the "restart the session"
            // behavior this button is specifically for.
            window.location.href = "/";
          }}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-mid px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-deep"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}
