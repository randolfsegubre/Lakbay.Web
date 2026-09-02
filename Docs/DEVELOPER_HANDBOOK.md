# Lakbay.Web — Developer Handbook

Written the moment local setup actually worked (2026-09-06). The test for
this document: could you follow it on a plane, no internet, no AI agent?

## Layout

Standard Next.js App Router layout (`create-next-app`, TypeScript,
Tailwind, ESLint — the current defaults as of 2026-09-06):

```
src/app/          pages, layout.tsx, providers.tsx (Redux Provider, 'use client')
src/lib/          store.ts (Redux store), hooks.ts (typed useAppDispatch/useAppSelector),
                  availabilityApi.ts (RTK Query slice — Phase 0 has one placeholder endpoint)
AGENTS.md         auto-generated/re-added by `next dev` itself — READ IT before
                  writing App Router code; Next.js 16 has real breaking changes
                  from older training data. Don't delete it — commit it.
```

References `../Lakbay.Contracts/typescript` as a local `file:` dependency
(`@lakbay/contracts` in `package.json`) — not a published package yet.

## Local setup — proven working, 2026-09-06

Requires: Node.js 20+ (built against 24.18.0), npm.

```bash
npm install
npm run build    # compiles clean, 2 static routes generated
npm run lint     # zero errors
npm run dev      # http://localhost:3000
```

Preview via Claude Code: `.claude/launch.json` has a `lakbay-web-dev`
config — but note it's registered at the **workspace root**
(`D:\_DEV\Personal_Projects\.claude\launch.json`), not read from this
repo's own `.claude/launch.json`, because the preview tool resolves
configs from the primary working directory, not wherever a Bash shell
happens to `cd` into. The workspace-root entry uses
`npm --prefix <path-to-this-repo> run dev` for that reason — plain `npm
run dev` only works if the tool's cwd is already this repo.

## Verified end-to-end, 2026-09-06

Ran this app's dev server (`:3000`) alongside `Lakbay.AvailabilityApi`'s
query API (`:5000`, `ASPNETCORE_ENVIRONMENT=Development` for its CORS
config). The homepage's `useGetStatusQuery()` call round-tripped
successfully through RTK Query and rendered the live response — confirms
the Redux Toolkit + RTK Query + GraphQL wiring works, not just that each
piece compiles in isolation.

**Environment variable:** `NEXT_PUBLIC_AVAILABILITY_API_URL` — defaults to
`http://localhost:5000` if unset. Set it in `.env.local` (gitignored) to
point at a different local port or a real deployed instance.

## Adding a new page/catalog view — worked walkthrough (once Phase 2 starts)

Not applicable yet — this repo has one placeholder page as of Phase 0.
This section gets filled in with a real, proven walkthrough (add the
query/resolver in `Lakbay.AvailabilityApi`, regenerate
`@lakbay/contracts`' TS types, add the RTK Query endpoint, build the
page) the moment Phase 2 actually does this once — not written
speculatively now.
