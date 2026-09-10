"use client";

/**
 * Next.js App Router's root-level error boundary - the one case error.tsx
 * can't cover, since error.tsx is rendered INSIDE layout.tsx and can't
 * catch an error thrown by layout.tsx itself (e.g. the Redux <Provider>
 * in providers.tsx failing to initialize). Because this replaces the
 * entire root layout when it triggers, it must render its own <html>/
 * <body> - there is no surrounding layout left to rely on. Deliberately
 * has no Tailwind class dependency on the app's own theme setup (inline
 * styles only) since the thing that broke might be exactly that setup.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", background: "#eef3f1", color: "#10262a" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6c8482" }}>
            Something went wrong
          </p>
          <h1 style={{ marginTop: 12, fontSize: 24, fontWeight: 600 }}>
            Lakbay hit a snag
          </h1>
          <p style={{ marginTop: 12, color: "#45605f" }}>
            This is on us, not you. Going back to the homepage usually clears it up.
          </p>
          <button
            type="button"
            onClick={() => {
              // Same "hard reload, restart at home" behavior as error.tsx -
              // there is no reset() here since a global-error has no
              // parent segment to re-render into; a full navigation is the
              // only option anyway.
              window.location.href = "/";
            }}
            style={{ marginTop: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#1f6f72", color: "#fff", padding: "12px 24px", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            Back to Home
          </button>
        </div>
      </body>
    </html>
  );
}
