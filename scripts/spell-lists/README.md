# DBC Spell List Generator

This uses dbc data from https://wago.tools (via https://github.com/RPGLogs/wow-dbc) to generate spell lists.

Currently only supports classic, but it _should_ work for retail if you set the game version in `internal.ts`.

## Usage

### Generating a New Spell List

```bash
pnpm run spell-lists:create <branch> <class-name> <spec-name>
```

for example:

```bash
pnpm run spell-lists-create classic DeathKnight Unholy
```

For multi-word class names (Death Knight, Demon Hunter), make sure to use the CamelCase name!

### Updating All Spell Lists

```bash
pnpm run spell-lists:update
```

This will regenerate all spell lists (with prettier formatting applied).
