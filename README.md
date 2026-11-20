# Gymnastics Routine Planner

A local-first men's artistic gymnastics routine planner. The project is in
its foundation phase: the included gymnastics records are explicitly
fictional test fixtures, not FIG catalogue or scoring data.

## Stack

- React, TypeScript, Vite, and TanStack Router
- SQLite compiled to WebAssembly with `sql.js`
- SQLite database snapshots stored in the browser's IndexedDB, so the app
  can run on a static host such as GitHub Pages without a server
- Zod validation and Vitest domain tests

The database is local to the current browser profile. Clearing site data
can remove it; routine export/backup is not implemented yet.

## Development

Use Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

Run the checks:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

The current data manifest and movement fixture are intentionally small and
fictional. Do not treat them as official gymnastics information.

## GitHub Pages

The GitHub Actions workflow builds and deploys the app to the repository's
GitHub Pages site. SQLite WASM is bundled as a static asset; the database
is persisted locally in each visitor's browser and is never sent to a
server.
