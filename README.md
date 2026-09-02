# Lakbay.Web

Public storefront for the Lakbay platform — Next.js + Redux Toolkit +
RTK Query, fully headless (talks to GraphQL only, never Razor-hosted).

Phase 0 scaffolding is done — see [Docs/DEVELOPER_HANDBOOK.md](Docs/DEVELOPER_HANDBOOK.md)
for proven local setup, and [CLAUDE.md](CLAUDE.md) /
[../Lakbay.Docs/docs/02_BUILD_PLAN.md](../Lakbay.Docs/docs/02_BUILD_PLAN.md)
for what's next. First real work is Phase 2 — built against
`Lakbay.AvailabilityApi`, before `Lakbay.Cms` exists, and the same
service it queries in production afterward (see
[ADR-0007](../Lakbay.Docs/docs/adr/ADR-0007-searchapi-is-real-not-mock.md)).
