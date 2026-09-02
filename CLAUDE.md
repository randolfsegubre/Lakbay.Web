# Lakbay.Web — Start Here

This file is intentionally short. It exists so any Claude Code session (or
other AI coding assistant) rooted here auto-loads it and is pointed at the
real documentation before touching anything.

**Read, in this order, before writing any code:**

1. [../Lakbay.Docs/docs/01_CLAUDE.md](../Lakbay.Docs/docs/01_CLAUDE.md) —
   the platform AI operating manual. Constitution for the whole Lakbay
   estate; if anything else conflicts with it, it wins unless the user
   explicitly overrides it in the current conversation. Section 3, item 4
   is this repo's core decision: fully headless, not Razor-hosted.
2. [../Lakbay.Docs/docs/02_BUILD_PLAN.md](../Lakbay.Docs/docs/02_BUILD_PLAN.md)
   — **Phase 0** (scaffolding), **Phase 2** (storefront built against
   `Lakbay.SearchApi` — this repo's first real work, before `Lakbay.Cms`
   even exists, and the path it keeps using afterward — see
   [ADR-0007](../Lakbay.Docs/docs/adr/ADR-0007-searchapi-is-real-not-mock.md),
   this repo is **not** repointed away from `Lakbay.SearchApi` at Phase 3),
   **Phase 3** (`Lakbay.SearchApi`'s data source switches from hand-seeded
   to synced-from-`Lakbay.Cms` — zero code changes expected here, this
   phase is verification), and **Phase 4** (checkout UI, talks to
   `Lakbay.Booking`) are this repo's phases.
3. [../Lakbay.Docs/docs/04_TASKS.md](../Lakbay.Docs/docs/04_TASKS.md) —
   current status across the whole platform.
4. [../Lakbay.Docs/docs/03_ARCHITECTURE_AND_PATTERNS_GUIDE.md](../Lakbay.Docs/docs/03_ARCHITECTURE_AND_PATTERNS_GUIDE.md)
   — this repo's split is RTK Query for server-state/GraphQL caching,
   plain Redux Toolkit slices *only* for genuinely client-side state
   (booking wizard, basket UI, filters) — not a place to reach for Redux
   by default.
5. [ADR-0008](../Lakbay.Docs/docs/adr/ADR-0008-realtime-availability-propagation.md)
   — listing pages hold a live Azure SignalR connection and invalidate
   just the affected item's RTK Query cache entry on a push notification,
   rather than polling `Lakbay.SearchApi` or reloading the page.

See [ADR-0006](../Lakbay.Docs/docs/adr/ADR-0006-headless-cms-no-razor-ui.md)
for the full reasoning — `Lakbay.Cms` never renders a page or holds
Razor/UI code; this repo owns 100% of presentation. This is the direct
opposite of the ECMS/Prototype hybrid (Razor page shells in the CMS with
React embedded inside them) — if you're ever tempted to add a `Views/`
folder to `Lakbay.Cms` for the public site, read this ADR again first.

## What this repo is

Next.js (App Router) storefront: marketing pages, catalog browsing,
booking flow. SSR/ISR for SEO. Talks to the GraphQL layer only — never
touches a database directly. In practice: `Lakbay.SearchApi` for all
catalog browsing/search (the default, and the permanent path — see
[06_SYSTEM_ARCHITECTURE.md](../Lakbay.Docs/docs/06_SYSTEM_ARCHITECTURE.md)),
`Lakbay.Booking` for checkout, and optionally `Lakbay.Cms` directly for
single-page non-search content (ADR-0007).

## Local setup

Not yet proven — Phase 0 is not complete. Once `create-next-app`'s
baseline boots locally, the exact commands go in
`Docs/DEVELOPER_HANDBOOK.md` (create that file the moment setup actually
works, not from memory afterward).

## End of session

Update `../Lakbay.Docs/docs/04_TASKS.md` and append an entry to
`../Lakbay.Docs/docs/05_DEVLOG.md` for anything that changed phase status
or made a new structural decision. A new structural decision gets its own
ADR under `../Lakbay.Docs/docs/adr/`.
