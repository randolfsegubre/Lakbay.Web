import { configureStore } from "@reduxjs/toolkit";
import { availabilityApi } from "./availabilityApi";
import { cmsContentApi } from "./cmsContentApi";

/**
 * RTK Query owns server-state/GraphQL caching (availabilityApi below,
 * bookingApi from Phase 4 onward). Plain Redux Toolkit slices are
 * reserved for state with no server source of truth — the booking
 * wizard step, basket UI, active filters — never as a cache for data
 * RTK Query already owns. See ADR-0006 and
 * Lakbay.Docs/docs/03_ARCHITECTURE_AND_PATTERNS_GUIDE.md.
 */
export const store = configureStore({
  reducer: {
    [availabilityApi.reducerPath]: availabilityApi.reducer,
    [cmsContentApi.reducerPath]: cmsContentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(availabilityApi.middleware, cmsContentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
