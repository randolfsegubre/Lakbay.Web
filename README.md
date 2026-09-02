# Lakbay.Web

Public storefront for the Lakbay platform — Next.js + Redux Toolkit +
RTK Query, fully headless (talks to GraphQL only, never Razor-hosted).

Not yet scaffolded — see [CLAUDE.md](CLAUDE.md) and
[../Lakbay.Docs/docs/02_BUILD_PLAN.md](../Lakbay.Docs/docs/02_BUILD_PLAN.md)
(Phase 0) for what happens next. First real work is Phase 2 — built
against `Lakbay.AvailabilityApi`, before `Lakbay.Cms` exists, and the same
service it queries in production afterward (see
[ADR-0007](../Lakbay.Docs/docs/adr/ADR-0007-searchapi-is-real-not-mock.md)).
