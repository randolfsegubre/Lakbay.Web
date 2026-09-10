// "use client" is required here specifically: Next.js App Router's
// layout.tsx is a Server Component by default, but react-redux's
// <Provider> relies on React context, which only works in a Client
// Component. Isolating that boundary to this one small wrapper (instead
// of marking the whole layout "use client") keeps everything else in
// layout.tsx server-rendered.
"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";

/** Makes the Redux store (RTK Query's availabilityApi/cmsContentApi caches) available to every page via React context. Wraps {children} in app/layout.tsx. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
