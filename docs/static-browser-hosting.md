# Static browser variant

This variant runs the WoWAnalyzer shell and analysis pipeline from static files. Local combat logs are parsed in a worker, normalized, chunked, and stored in IndexedDB. Warcraft Logs reports are fetched by the browser from the official WCL v2 GraphQL user API and then adapted to the same `AnalysisDataSource` contract.

Static hosting does not mean offline use. WCL reports need a WCL connection and sign-in, Wowhead tooltips and fonts may use their own networks, and the application can contain external links. A local file is not uploaded for analysis; its normalized data remains in this origin's browser storage until it is deleted or the browser evicts site data.

## Local development

```sh
pnpm install
pnpm start
```

Local-file analysis works without additional configuration. WCL is hidden by a build-time feature
flag by default. To enable it, create `.env.local`:

```dotenv
VITE_ENABLE_WCL=true
VITE_WCL_CLIENT_ID=your_public_client_id
VITE_WCL_REDIRECT_URI=http://localhost:3000/
```

Register that exact redirect URI in the [Warcraft Logs client management page](https://www.warcraftlogs.com/api/clients/). The browser uses OAuth authorization code + PKCE. Do not put a client secret in any `VITE_` variable, repository secret used by the build, or Pages artifact.

Build and preview a root deployment with `pnpm preview`. To simulate a GitHub Pages project site:

```sh
VITE_BASE_PATH=/WoWAnalyzer/ pnpm build
VITE_BASE_PATH=/WoWAnalyzer/ pnpm exec vite preview
```

The production router is hash-based. When WCL is enabled, a copied route looks like
`/WoWAnalyzer/#/report/...` and can be loaded directly from static hosting. A local report URL works
only in the same origin and browser profile where its IndexedDB record exists.

## GitHub Pages

The `pages.yml` workflow builds with `VITE_ENABLE_WCL=false`,
`VITE_BASE_PATH=/<repository-name>/`, and deploys `dist/`. While that flag is disabled, the WCL
report entry point, report route, and OAuth callback handling are omitted from the app. To enable it
later, change the workflow flag to `true` and configure these repository **Actions variables**:

- `WCL_CLIENT_ID`: the public WCL OAuth client ID; omit it for a local-file-only deployment.
- `WCL_REDIRECT_URI`: normally `https://<owner>.github.io/<repository>/` and registered exactly at WCL.

Enable GitHub Pages with **GitHub Actions** as its source. The workflow runs formatting, linting, type checking, unit tests, the production build, a static-architecture/artifact scan, and the local import/analyze/reopen/delete journey in Chromium and Firefox before deployment. Sentry, Google Analytics, advertisements, premium/account startup, metrics upload, and source maps are disabled in the static workflow.

## Supported paths and limitations

- Local imports currently target current Retail advanced combat logs. Incompatible parser/schema versions are recoverable by deleting and re-importing the report.
- When enabled, WCL report metadata, combatant information, paginated events, filtered events, tables, and graphs use WCL v2. Access-token state is session-scoped; expiry asks the user to sign in again and does not affect local reports.
- Character, guild, premium/account, aggregate support-statistics, and remote character-profile pages are not part of the first static milestone.
- Features backed by a WCL-only aggregate are modeled as optional capabilities. A local report gets an explicit unavailable result instead of a WCL request or a fabricated zero.
- Unknown spell metadata uses the bundled catalog and a deterministic unknown-spell label/icon; there is no WoWAnalyzer server fallback.

The project remains AGPL-3.0-or-later and derives from [WoWAnalyzer](https://github.com/WoWAnalyzer/WoWAnalyzer). Fork deployments must preserve the license, upstream attribution, and a link to their corresponding modified source.
