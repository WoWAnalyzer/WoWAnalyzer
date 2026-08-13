# Patches and raids

## Adding a new patch

When a new patch drops there are a few places that track "what the current game version is". Start in `src/parser/Config.ts`, which defines the valid patch strings per expansion (e.g. `MidnightPatchVersion`).
Add your patch to the matching cycle, or, for a new expansion, add a new `*PatchVersion` type and include it in `AnyPatchVersion`.
These types are what a spec's `patchCompatibility` is checked against, which drives `isLatestPatch`, so specs updated for the patch will bump their own config's `patchCompatibility` to match.

Then bump the version for the relevant game branch in `src/game/VERSIONS.ts`.

Finally, add the patch to `src/interface/report/PATCHES.ts`. Remember to move `isCurrent: true` off the previous patch and onto the new one.

## Adding a new raid or zone

Each raid or M+ zone is a folder under `src/game/raids/`. The rough process:

**1. Set up the raid** in the folder's `index.ts`.

Bosses are created with `buildBoss` where `id` is the WarcraftLogs encounter id. You can inline them, or for a raid pull each boss out into its own file (e.g. `TheCoiledAltar.ts`) and import them.

```ts
export default {
  name: 'Venomous Abyss',
  background,
  bosses: {
    TheCoiledAltar: buildBoss({ id: 3429, name: 'The Coiled Altar' }),
    // ...
  },
} satisfies Raid;
```

**2. Add it** to `src/game/raids/index.ts`, under either `raids` (raid instances) or `dungeons` (M+ seasons).

**3. Set up the zone** in `src/game/ZONES.ts`.

```ts
export const VENOMOUS_ABYSS_ZONE: Zone = {
  id: 53, // WCL zone id
  name: 'Venomous Abyss',
  encounters: Object.values(VenomousAbyss.bosses),
};
```

**4. Make it the default (optional)**. If it should be the default selection on the character parses page, point the relevant `DEFAULT_*_ZONE` in `src/interface/CharacterParses.tsx` at its `id`.

## Getting the pictures

The tooling for generating background and boss images is documented in `scripts/background-images/README.md`.

A note on sourcing: Never use screenshots from Google/Wowhead as their copyright is unknown and likely incompatible. Make your own, or from Blizzard. It's ok if other people provide screenshots, but make sure they're actually theirs and they allow you to relicense them as AGPL.

### Dungeons

#### Backgrounds

An easy way if the dungeons are released is to get them from the dungeon leaderboards:
https://worldofwarcraft.com/en-gb/game/pve/leaderboards/aegwynn/ataldazar

But I assume they won't be available for PTR dungeons and they're not the prettiest. Alternatively try to find a WoW news article as they generally tend to have good screenshots. These usually don't have good ones for all dungeons, so then you'll just have to enter the dungeons and make your own screenshots. Rogues can often make the best screenshots as they can get close to (final) bosses. Zoom in and disable nameplates, turn settings to max and make your screenshots.

#### Headshots

For headshots in dungeons just use the dungeon achievement icon. The easiest way is via this list:
https://www.wowhead.com/battle-dungeon-guild-achievements
