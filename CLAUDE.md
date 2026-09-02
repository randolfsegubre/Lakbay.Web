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

No formal ADR exists yet for the headless-vs-hybrid decision (it's
recorded in `01_CLAUDE.md` §3.4 and the published Lakbay Blueprint
artifact's "Frontend: React, Redux, and why not Razor-hosted" section) —
worth promoting to a proper `ADR-0004` in `Lakbay.Docs` the next time
someone touches this decision, rather than leaving it only in prose.

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
