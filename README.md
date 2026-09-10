# Lakbay.Web

Public storefront for the Lakbay platform — Next.js + Redux Toolkit +
RTK Query, fully headless (talks to GraphQL only, never Razor-hosted).

**Phase 2 is done**: a real catalog storefront — homepage (all four product
lines), `/collections/[code]` (products in a line), `/holidays/[slug]`
(full detail: itinerary, board basis, availability, price bands) — all
querying live, real, seeded data from `Lakbay.AvailabilityApi`
(Coron/Alon, Baguio/Amihan, San Fernando Pampanga/Parul, Vigan/Pamana).
Verified in an actual browser, not just a clean build. Booking is a
visibly disabled button ("coming in Phase 4") — honest about what's not
built yet rather than faking it.

See [Docs/DEVELOPER_HANDBOOK.md](Docs/DEVELOPER_HANDBOOK.md) for proven
setup (including a real Turbopack + local-workspace-package gotcha), and
[CLAUDE.md](CLAUDE.md) /
[../Lakbay.Docs/docs/02_BUILD_PLAN.md](../Lakbay.Docs/docs/02_BUILD_PLAN.md)
for what's next (Phase 3 verification, or Phase 4 checkout).
