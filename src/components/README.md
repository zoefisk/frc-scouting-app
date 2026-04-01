# Proposed `src/components` refactor

This is a **structure-first refactor** of your current `src/components` folder.
It keeps file contents mostly unchanged and focuses on making the folder layout more consistent.

## Main changes

- `providers` moved under `app/providers`
- `pwa` moved under `app/pwa`
- `NavBar` and `SyncModeToggleButton` moved under `navigation`
- `match-scouting` renamed to `scouting/match`
- `FieldLabelWithHelp` moved to `scouting/common`
- `analysis/TeamsTable.tsx` moved to `analysis/teams/TeamsTable.tsx`
- `settings`, `auth`, `dashboard`, `alliance`, and `layout` kept as top-level feature folders

## Target structure

```txt
components/
  alliance/
  analysis/
    team/
    teams/
  app/
    providers/
    pwa/
  auth/
  dashboard/
  layout/
  navigation/
  scouting/
    common/
    match/
      actions/
      autonomous/
      final/
      setup/
      teleop/
  settings/
```

## Migration notes

This folder is **not drop-in**. You will need to update imports throughout `src/app` and other component files.

Examples:

- `@/components/providers/AuthProvider` -> `@/components/app/providers/AuthProvider`
- `@/components/layout/NavBar` -> `@/components/navigation/NavBar`
- `@/components/match-scouting/setup/ScoutingSetupForm` -> `@/components/scouting/match/setup/ScoutingSetupForm`
- `@/components/match-scouting/FieldLabelWithHelp` -> `@/components/scouting/common/FieldLabelWithHelp`

## Why this is better

- clearer separation between app-level infrastructure and feature UI
- all scouting UI lives in one place
- easier to find navigation vs layout vs providers
- more room for future project-scoped scouting flows