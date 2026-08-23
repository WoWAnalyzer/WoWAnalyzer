# Static endpoint ledger

| Previous frontend dependency                   | Static disposition                   | Notes                                                                            |
| ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `i/v1/report/fights/:code`                     | Direct WCL v2 GraphQL                | Browser PKCE session; adapted at `WclReportClient`.                              |
| `i/v1/report/events/:code`                     | Direct WCL v2 GraphQL                | Browser pagination, progress, abort signals, bounded rate-limit retries.         |
| `/api/v2/report/:code/fight/:id/players`       | Browser computation                  | Combatant-info events plus bundled specialization metadata.                      |
| `i/v1/report/tables/*` and `report/graph/*`    | Typed optional WCL source capability | Parser modules no longer construct transport URLs. Local reports never call WCL. |
| `i/character/*` character profile              | Deferred/optional                    | Analysis proceeds without a remote profile.                                      |
| `i/spell/:id`                                  | Bundled/static metadata              | Unknown spells have deterministic UI fallback.                                   |
| `user`, `logout`, `login/*`, premium providers | Removed from static composition      | WCL authentication uses the dedicated browser PKCE session.                      |
| `i/v1/metrics`                                 | Removed from static analysis         | Both static sources expose `canUploadMetrics = false`.                           |
| support statistics                             | Deferred page                        | Not linked from the static primary journey.                                      |
| Sentry, GA, advertising                        | Disabled by default                  | Independent upstream code remains isolated from the static deployment workflow.  |

## Authentication decision

Browser PKCE is the primary WCL mode. WCL documents PKCE for applications that cannot keep a client secret and permits the v2 user API to be used by that flow. Tokens and the one-time verifier/state live in `sessionStorage`; the verifier/state are cleared after every callback attempt. The artifact contains only a public client ID and redirect URI.

An external broker is not currently required. If future WCL CORS or product requirements make it necessary, it should implement only token/API forwarding, remain separately configured, and never receive local combat-log data.
