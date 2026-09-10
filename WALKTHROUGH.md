# Code Walkthrough — Lakbay.Web

Next.js 16 (App Router), the platform's only presentation layer (ADR-0006 -
`Lakbay.Cms` never renders a page). This walks through the routing
structure and the app's central architectural fact: **it talks to two
independent backends for two different jobs.** See the platform-level
`Lakbay.Docs/WALKTHROUGH.md` for how this fits with the other repos.

## Two backends, two different jobs (ADR-0007)

```
src/lib/availabilityApi.ts   GraphQL client -> Lakbay.AvailabilityApi (catalog/search - the default, permanent path)
src/lib/cmsContentApi.ts     REST client -> Lakbay.Cms's Content Delivery API (editorial copy - Home/landing pages only)
```

Both are RTK Query `createApi` slices, both registered in `src/lib/store.ts`.
**Never confuse which one a page should call**: catalog browsing/search
(products, destinations, accommodations, activities) always goes through
`availabilityApi` - `Lakbay.Cms` is never queried directly for that, even
though it's the original source. `cmsContentApi` is only for the Content
tree's hero/section copy on Home and landing pages.

## Routing structure (`src/app/`, App Router)

```
app/page.tsx                                          Home - product-line grid + Cms hero
app/collections/[code]/page.tsx                        One ProductLine's products + regions
app/collections/[code]/[regionSlug]/page.tsx           One Region's destinations
app/collections/[code]/[regionSlug]/[destinationSlug]/page.tsx   One Destination's detail page
app/holidays/[slug]/page.tsx                           One Product's full detail page
app/stays/page.tsx                                     Cross-destination accommodation search (ADR-0019)
app/stays/[accommodationId]/page.tsx                   One Accommodation's detail (Room Types, perks)
app/activities/page.tsx                                Fair-price activities marketplace (ADR-0020)
```

`app/layout.tsx` (Server Component) wraps every page in `<Providers>`
(`app/providers.tsx`, a small "use client" boundary just for Redux's
`<Provider>`) and a persistent `<SiteHeader>`.

## Following one page: the Home page's two-backend render

`app/page.tsx` calls both APIs independently:
```tsx
const { data: productLines } = useGetProductLinesQuery();   // availabilityApi
const { data: homeContent } = useGetHomeContentQuery();      // cmsContentApi
```
The product-line grid renders from `productLines` unconditionally; the
hero section renders from `homeContent` **only if it loaded** - the file's
own comment explains why: "the page still works with only
Lakbay.AvailabilityApi running" even if `Lakbay.Cms` is down or hasn't
published anything yet. This same fallback pattern repeats on every
collection page.

## Rendering `Lakbay.Cms`-authored content (ADR-0012)

`Lakbay.Cms`'s Content tree stores page sections as JSON (see that repo's
own `WALKTHROUGH.md`), parsed here by `src/lib/cmsContentApi.ts` into a
typed `CmsSection` union, then rendered by
`src/components/blocks/BlockRegistry.tsx`'s `CmsSections` component - a
`section.type` string (`"hero"`, `"imageText"`) looks up a React component
in a plain object registry. **Adding a new section type is a two-repo
change**: a new case in `Lakbay.Cms`'s `ContentTreeSeeder` and a matching
entry in this file's `REGISTRY` - miss the second half and editors can
author a block that silently renders as nothing (logged in dev only).

## The two real bugs found while building the collections pages

- **A URL-routing collision** between the Products tree's `ProductLine`
  nodes and the Content tree's landing pages (both named "Islands," etc.,
  both root-reachable in Umbraco) - `src/lib/cmsContentApi.ts`'s
  `getLandingPageContent` sidesteps it by fetching Home's children and
  matching by `productLineCode` client-side, never a direct
  `/content/item/{code}` route lookup.
- **A Turbopack + local-workspace-package gotcha**: `@lakbay/contracts`
  (a `file:` dependency shipping raw `.ts`, no build step) wouldn't
  resolve under Next 16's Turbopack even with the standard
  `transpilePackages` fix, because Turbopack infers this repo's own
  `package-lock.json` as the workspace root and refuses files outside it.
  Fixed in `next.config.ts` with a `tsconfig.json` `paths` alias *plus* a
  widened `turbopack.root` pointing at the shared parent directory -
  neither alone was enough.
