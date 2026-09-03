# Lakbay.Web — Developer Handbook

Written the moment local setup actually worked (2026-09-06; Phase 2
catalog pages added 2026-09-08). The test for this document: could you
follow it on a plane, no internet, no AI agent?

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

## Verified end-to-end, 2026-09-06 (Phase 0) and 2026-09-08 (Phase 2)

Phase 0: ran this app's dev server alongside `Lakbay.AvailabilityApi`'s
query API; the homepage's `useGetStatusQuery()` call round-tripped
successfully through RTK Query — confirmed the Redux Toolkit + RTK Query +
GraphQL wiring works, not just that each piece compiles in isolation.

Phase 2, in a real browser, not just `curl`: homepage renders all four
product lines from `useGetProductLinesQuery()`; `/collections/alon`
renders the real seeded Coron product with a correct `from ₱12,500`;
`/holidays/coron-island-hopping-3d2n` renders full itinerary/board-basis/
availability/price-band detail. Same check repeated for `/collections/pamana`
(Vigan) to confirm it's not one product line's data accidentally working.

**Environment variable:** `NEXT_PUBLIC_AVAILABILITY_API_URL` — defaults to
`http://localhost:5170` if unset (the actual port `Lakbay.AvailabilityApi`
binds to via its `launchSettings.json` — verify this hasn't drifted before
trusting it). Set it in `.env.local` (gitignored) to point at a different
local port or a real deployed instance.

**A real gotcha hit and fixed here: local workspace packages + Turbopack.**
`@lakbay/contracts` is a `file:` dependency shipping raw `.ts` source (no
build step — see that repo's own README). Importing from it failed with
"Module not found," even after the standard `transpilePackages` fix,
because Next 16's default bundler (Turbopack) infers this repo's own
`package-lock.json` as the workspace root and refuses to resolve files
outside it — including a sibling repo like `../Lakbay.Contracts`, even via
a correct `tsconfig.json` `paths` alias. Fixed with two things together,
in `next.config.ts` and `tsconfig.json`:

```ts
// next.config.ts
transpilePackages: ["@lakbay/contracts"],
turbopack: { root: path.join(__dirname, "..") }, // widen to Personal_Projects/Lakbay/
```

```json
// tsconfig.json compilerOptions.paths
"@lakbay/contracts": ["../Lakbay.Contracts/typescript/generated/types.ts"]
```

Neither alone was enough — `transpilePackages` without `turbopack.root`
still hits the workspace-boundary error; the `tsconfig` alias without
`transpilePackages` still fails as an untranspiled `.ts` file. If a future
Next.js version changes this behavior, re-verify by deleting `.next/` and
running a clean `npm run build` before assuming either fix still applies.

## Adding a new page/catalog view — worked walkthrough

This is the real sequence used to build the Phase 2 catalog pages
(`/`, `/collections/[code]`, `/holidays/[slug]`) — follow the same steps
for the next one:

1. Confirm the field/query already exists in `Lakbay.AvailabilityApi`
   (see that repo's own "adding a new query field" walkthrough if not).
2. Add a typed RTK Query endpoint in `src/lib/availabilityApi.ts` —
   hand-write the GraphQL query string against `Lakbay.Contracts`'
   generated types (`Product`, `ProductLine`, `Destination`, ...), not
   `any`. `transformResponse` should unwrap `{ data, errors }` and throw
   on `errors` so a broken query fails loudly in the RTK Query cache
   rather than silently returning `undefined`.
3. Build the page as a Client Component (`"use client"`) calling the new
   `useGet...Query()` hook — this repo doesn't use server-side GraphQL
   prefetching yet, matching the pattern already proven in Phase 0/2.
4. Handle all three states explicitly: loading, error (with an actionable
   message, not just "something went wrong"), and empty/not-found — see
   `/holidays/[slug]/page.tsx`'s handling of `product === null` for the
   pattern.
5. Reuse `src/lib/catalog.ts` for any formatting (currency, dates, board
   basis, avoiding "Coron, Palawan, Palawan"-style redundant location
   strings) rather than re-deriving it per page.
6. Verify in an actual browser (screenshot or manual check), not just
   `npm run build` succeeding — a clean build proves the code compiles,
   not that the live GraphQL contract still matches what the UI expects
   (see the `ProductFilterInput` naming bug in `Lakbay.AvailabilityApi`'s
   own handbook, caught exactly this way).
