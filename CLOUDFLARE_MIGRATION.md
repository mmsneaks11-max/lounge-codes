# Lounge.Codes: Railway to Cloudflare Workers

Status: migration scaffold started on `migration/cloudflare-workers-2026-10-28`.

## Safety boundary

- Railway and production DNS remain unchanged.
- The Cloudflare Worker is named `lounge-codes-staging` to prevent accidental production replacement.
- No production database credentials are committed.
- The dirty `main` checkout at `/Users/elad/clawd/lounge-codes` is preserved; migration work is isolated in a git worktree.

## Completed

- Added vinext and Cloudflare Workers build support.
- Added `nodejs_compat` and Workers Static Assets configuration.
- Added parallel `dev:vinext`, `build:vinext`, `start:vinext`, and `deploy:vinext` scripts.
- Worker build succeeds for 19 pages and 7 API route handlers.
- TypeScript validation succeeds after adding explicit request/response body types required by the migrated runtime.

## Backend reconciliation blocker

The committed repository still directly uses Supabase in browser pages, server routes, and OAuth. Dayta's current Google Cloud production architecture is not represented in this checkout.

Required facts before staging deployment:

1. Google Cloud service type (Cloud SQL, AlloyDB, Cloud Run/PostgREST, or another API).
2. GCP project and region.
3. Supported public/private endpoint and network path.
4. Authentication method and secret names (never values in this document).
5. Production schema/API contract and OAuth replacement, if any.
6. Current canonical source/config location.
7. Cutover and rollback constraints.

## Cloudflare account blocker

Wrangler is installed but Mac1 is not authenticated. The official OAuth flow was started, but the browser profile was not signed in and Chrome cookie import required macOS Keychain consent. Do not use plaintext API tokens as a fallback.

## Verification

- `npm run build:vinext`: PASS
- `npx tsc --noEmit`: PASS
- Local preview without backend variables: expected failures on data-backed pages and APIs; `/about` renders successfully.

## Next steps

1. Reconcile Dayta's Google Cloud interface into a single backend adapter.
2. Remove Supabase dependencies and stale Railway/Supabase UI references.
3. Complete Cloudflare OAuth on Mac1.
4. Configure Worker secrets by name through Wrangler's supported secret flow.
5. Deploy `lounge-codes-staging` to `workers.dev`.
6. Run full route/API/auth smoke tests.
7. Attach the production hostname only after explicit cutover approval and verified rollback.
