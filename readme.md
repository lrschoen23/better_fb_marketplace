# Better FB Marketplace

Firefox extension: draw a shape on a map and see only the Marketplace listings inside it.
It never makes its own requests. It reads the responses Facebook already sends while you browse.

## Setup

```bash
nvm use            # Node 22
pnpm install
cp web-ext.config.example.ts web-ext.config.ts   # set your logged-in Firefox dev profile path
pnpm dev           # opens Firefox with the extension loaded
```

Log in to Facebook once in the dev profile. Browse Marketplace, then click the toolbar icon.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run in Firefox with hot reload |
| `pnpm test` | Unit tests |
| `pnpm compile` | Typecheck |
| `pnpm build` / `pnpm build:firefox` | Production build |
| `pnpm exec wxt build -b edge` | Edge build |
| `node scripts/build-gazetteer.mjs` | Rebuild the offline city list |

## Layout

- `entrypoints/` extension entry points (interceptor, collector, background, dashboard)
- `src/lib/` UI-free logic: parsing, geo, database, outreach
- `src/map/` MapLibre and terra-draw wrappers
- `src/components/`, `src/state/`, `src/hooks/` dashboard UI

If listings stop appearing, Facebook's response shape likely changed. All field names live in
`src/lib/parse/readers.ts` and `src/lib/parse/extract.ts`.

## Attribution

City coordinates: [GeoNames](https://www.geonames.org/), CC BY 4.0. Map tiles: OpenFreeMap / OpenStreetMap contributors.
