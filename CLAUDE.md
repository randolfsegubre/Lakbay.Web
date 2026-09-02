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
   `Lakbay.MockApi` — this repo's first real work, before `Lakbay.Cms`
   even exists), **Phase 3** (repoint at `Lakbay.Cms` with zero frontend
   code changes — this is the proof the shared contract held), and
   **Phase 4** (checkout UI) are this repo's phases.
3. [../Lakbay.Docs/docs/04_TASKS.md](../Lakbay.Docs/docs/04_TASKS.md) —
   current status across the whole platform.
4. [../Lakbay.Docs/docs/03_ARCHITECTURE_AND_PATTERNS_GUIDE.md](../Lakbay.Docs/docs/03_ARCHITECTURE_AND_PATTERNS_GUIDE.md)
   — this repo's split is RTK Query for server-state/GraphQL caching,
   plain Redux Toolkit slices *only* for genuinely client-side state
   (booking wizard, basket UI, filters) — not a place to reach for Redux
   by default.

See [ADR-0006](../Lakbay.Docs/docs/adr/ADR-0006-headless-cms-no-razor-ui.md)
for the full reasoning — `Lakbay.Cms` never renders a page or holds
Razor/UI code; this repo owns 100% of presentation. This is the direct
opposite of the ECMS/Prototype hybrid (Razor page shells in the CMS with
React embedded inside them) — if you're ever tempted to add a `Views/`
folder to `Lakbay.Cms` for the public site, read this ADR again first.

## What this repo is

Next.js (App Router) storefront: marketing pages, catalog browsing,
booking flow. SSR/ISR for SEO. Talks to the GraphQL layer only — first
`Lakbay.MockApi`, later `Lakbay.Cms`/`Lakbay.Booking` — never touches a
database directly.

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
