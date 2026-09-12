# Lakbay.Web

Public storefront for the Lakbay platform — Next.js + Redux Toolkit +
RTK Query, fully headless (talks to GraphQL only, never Razor-hosted).

A full real catalog storefront — homepage (all four product lines),
collection pages, product detail pages, plus `/stays` (an accommodation
marketplace across all 14 real destinations, filterable by type/tag) and
`/activities` (fixed-price local activities, itemized inclusions) — all
querying live, real, synced-from-`Lakbay.Cms` data via
`Lakbay.AvailabilityApi`. Custom 404/500 error pages (`error.tsx`,
`global-error.tsx`, `not-found.tsx`) with a real "Back to Home" reset.
Booking is a visibly disabled button ("coming in Phase 4") — honest about
what's not built yet rather than faking it.

See [Docs/DEVELOPER_HANDBOOK.md](Docs/DEVELOPER_HANDBOOK.md) for proven
setup (including a real Turbopack + local-workspace-package gotcha), and
[CLAUDE.md](CLAUDE.md) /
[../Lakbay.Docs/docs/02_BUILD_PLAN.md](../Lakbay.Docs/docs/02_BUILD_PLAN.md)
for full phase status.

## E2E testing

Verified live 2026-09-12 in a real browser session against the full
platform (Cms → Service Bus → Sync → Mongo → GraphQL → this app): homepage
(four collections), the Islands collection page (5 real products with
prices/accommodation), a product detail page (Coron Island Hopping — price
bands, included/optional activities, the honest "coming in Phase 4"
booking state), `/stays` (14 real accommodations), and `/activities` (real
fixed-price activities) all render correctly with real synced data, not
placeholders. Full trail:
[`../Lakbay.Docs/docs/05_DEVLOG.md`](../Lakbay.Docs/docs/05_DEVLOG.md)'s
2026-09-12 entry.
