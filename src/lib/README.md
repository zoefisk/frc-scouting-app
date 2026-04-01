# Refactored `/lib` proposal

This is a proposed replacement for your current `src/lib` directory.

## What changed

- Split Firebase by runtime:
  - `firebase/client/*`
  - `firebase/server/*`
  - `firebase/shared/*`
- Split analysis by feature:
  - `analysis/team/*`
  - `analysis/dashboard/*`
- Kept real React hooks only in `lib/hooks/*`
- Split IndexedDB by responsibility:
  - `db/indexDb.ts` for low-level DB setup
  - `db/events.ts`, `db/settings.ts`, `db/submissions.ts`, `db/scans.ts`
- Split TBA server helpers into individual files under `tba/server/*`

## Important

This folder is a **refactor package**, not an in-place automatic migration.
You will still need to update imports in the rest of your app.

## High-value migration steps

1. Replace old Firebase imports with:
   - `@/lib/firebase/client/app`
   - `@/lib/firebase/client/auth`
   - `@/lib/firebase/client/entries`
   - `@/lib/firebase/client/users`
   - `@/lib/firebase/server/entries`
   - `@/lib/firebase/shared/types`
2. Replace old DB imports with:
   - `@/lib/db/events`
   - `@/lib/db/settings`
   - `@/lib/db/submissions`
   - `@/lib/db/scans`
3. Replace old TBA imports with:
   - `@/lib/tba/server/teams`
   - `@/lib/tba/server/teamEventMatches`
   - `@/lib/tba/server/teamEventSummary`
   - `@/lib/tba/server/eventQualificationMatches`
4. Replace old analysis imports with:
   - `@/lib/analysis/team/*`
   - `@/lib/analysis/dashboard/buildCoverageWarnings`
