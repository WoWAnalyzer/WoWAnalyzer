# Fork maintenance contract

This document records the behavior that distinguishes `Topping/WoWAnalyzer` from the official
[`WoWAnalyzer/WoWAnalyzer`](https://github.com/WoWAnalyzer/WoWAnalyzer) repository. It is the
minimum preservation contract for upstream syncs, not a substitute for inspecting the live Git
history and diff.

## Manual invocation

Start Codex from the repository, use a permission mode that allows workspace writes and approved
network/GitHub operations, and ask:

> Use the project-scoped `upstream_sync` agent to synchronize the official upstream into this fork's
> default branch and open a PR. Do not merge it.

The agent expects Git authentication for `origin` and an authenticated GitHub CLI (`gh`) session. It
will request approval when the active Codex permission policy requires one.

## Git topology

- `origin` is the writable `Topping/WoWAnalyzer` fork.
- `upstream` is the read-only official repository at
  `https://github.com/WoWAnalyzer/WoWAnalyzer.git`.
- Both repositories currently use `midnight` as their default integration branch.
- Syncs merge `upstream/midnight` into a branch based on `origin/midnight`, then open a PR back to
  the fork. Retaining upstream ancestry is intentional: do not squash or rebase-merge sync PRs.
- Only behavior reachable from the selected fork base is protected by a sync. Work on sibling
  feature branches is out of scope until it is merged into that base.

Before resolving a sync, derive the current delta from Git. Commit hashes can help with archaeology,
but they are not a list to replay. In particular, fork-only analyzer or rotation work is ordinary
project code unless this contract explicitly identifies it as part of the fork product.

## Behavior to preserve

### Local combat-log analysis

- A user can import a current Retail advanced combat log from a local file, select a supported
  fight/player, analyze it, reopen it later, and delete it.
- Parsing and normalization run in a browser worker. Normalized report data is chunked and persisted
  in IndexedDB; the source file is not uploaded for analysis.
- Local and Warcraft Logs reports meet behind the `AnalysisDataSource` boundary. Parser and UI code
  should consume source capabilities instead of constructing Warcraft Logs or WoWAnalyzer backend
  requests directly.
- Missing source capabilities are explicit and recoverable. Local analysis must not make a network
  request for a WCL-only table/graph or silently replace unavailable data with a fabricated zero.
- Imports are staged and cleaned up on cancellation/failure so partial reports are not presented as
  ready.

Primary seams include `src/local/`, `src/report-data/`, the local routes/selectors, and report-loading
hooks under `src/interface/report/`. Upstream refactors may move these seams; preserve the behavior,
not the paths.

### Static browser deployment

- The app can be built and deployed as static files, including to a GitHub Pages project subpath.
  Static production routing remains reload-safe and respects `VITE_BASE_PATH`.
- The default Pages deployment is local-file-only. It does not require the WoWAnalyzer application
  server and does not expose remote report, account, premium, metrics-upload, advertising, analytics,
  or Sentry startup paths in the static composition.
- Optional Warcraft Logs support uses the official v2 user GraphQL API from the browser with OAuth
  authorization code plus PKCE. Only a public client ID and exact redirect URI may enter the client
  bundle. Client secrets must never be stored in `VITE_*`, repository variables used in the build,
  or the Pages artifact.
- OAuth access state is session-scoped. Local report data stays origin-scoped in IndexedDB and is not
  sent through the optional WCL path.
- Unknown spell metadata and unsupported remote-only features degrade explicitly without calling a
  WoWAnalyzer backend fallback.
- `.github/workflows/pages.yml` remains the fork deployment workflow. Upstream CI improvements should
  be retained, while upstream-owned publishing jobs must not publish official artifacts from this
  fork.
- The static artifact continues to preserve the AGPL license, upstream attribution, and a link to the
  corresponding modified source.

See `docs/static-browser-hosting.md`, `docs/static-endpoint-ledger.md`,
`src/config/staticHosting.ts`, and `scripts/check-static-architecture.mjs` for the current design and
guardrails.

## Ordinary fork-only changes

Not every commit that exists only in the fork defines its product identity. Analyzer work, spec
updates, rotation guidance, experiments, and test-enabling changes should normally follow current
upstream facts and architecture. Preserve them when they still add value, but allow an upstream
equivalent or rewrite to replace them without treating that as a fork regression.

For example, the Frost Death Knight APL work was added while developing and testing that class. It is
not a protected fork invariant. If upstream changes or supersedes it, prefer the current upstream
behavior and keep only compatible additions that remain useful.

## Reconciliation principles

1. Prefer current upstream architecture and port protected fork behavior into it.
2. Prefer upstream game/spec facts; the fork does not intentionally pin stale rotations or tuning.
3. Treat whole-file `ours`/`theirs` conflict resolutions as suspect. A clean textual merge can still
   be a behavioral regression, so review adjacent changed code and call sites.
4. Do not resurrect a file deleted upstream merely because the fork once touched it. Locate its
   replacement and decide whether any non-formatting fork behavior still applies.
5. Prefer an upstream implementation when it demonstrably supersedes a protected fork feature.
   Remove the duplicate deliberately, preserve migrations or stored-data compatibility where needed,
   and update this contract with the evidence.
6. Preserve upstream attribution, license notices, and relevant project guidance. A sync PR is made
   only to this fork, never to the official upstream repository.

## Verification baseline

Use the scripts present after the merge. The expected baseline is:

```sh
pnpm install --frozen-lockfile
pnpm run format:check
pnpm run lint
pnpm run typecheck
CI=true pnpm run test
pnpm run build
pnpm run static:check
```

Run focused analyzer/spec validation when affected and when the relevant script exists. When static
routing, local import/persistence, report loading, data-source code, or build configuration changes,
also run the static local Playwright journey if its script and required browsers are available:

```sh
pnpm run e2e:static
```

Record skipped checks and their reason in the sync PR. Update this section when upstream renames or
replaces the canonical scripts.

## Keeping this contract current

When a protected fork feature is added, removed, or superseded, update this file in the same PR.
Describe observable behavior, privacy/security boundaries, current architectural seams, and the
focused checks that prove it. Avoid turning the document into a file manifest: paths move more often
than product intent.
