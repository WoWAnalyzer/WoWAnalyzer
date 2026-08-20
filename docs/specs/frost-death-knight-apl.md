# Frost Death Knight APL maintenance

Patch: 12.1.0

This document describes how the Frost analyzer turns combat-log events into rotation feedback and how to update it for a future patch. It intentionally covers the shared core of Deathbringer and Rider of the Apocalypse, single target, and conservatively detectable multi-target play. Encounter-specific holds, trinkets, racials, and niche talent combinations remain outside the strict checker.

## Trusted inputs

- [Wowhead Frost rotation](https://www.wowhead.com/guide/classes/death-knight/frost/rotation-cooldowns-pve-dps), patch 12.1.0, reviewed 2026-08-17 (page updated 2026-08-12). This is the primary player-facing priority and opener description.
- [Method Frost rotation](https://www.method.gg/guides/frost-death-knight/playstyle-and-rotation), patch 12.1, reviewed 2026-08-17 (page updated 2026-08-11). This supplies build-specific openers and resource thresholds.
- [SimulationCraft Frost APL](https://github.com/simulationcraft/simc/blob/351fcec671c8c88b9fc042244fc9e6532a3074ba/engine/class_modules/apl/apl_death_knight.cpp), `midnight` commit `351fcec671c8c88b9fc042244fc9e6532a3074ba`, reviewed 2026-08-17. This is the executable cross-check for conditions and target breakpoints.

When sources disagree, the analyzer accepts every action supported by at least one trusted source for the observed state. A cast is called wrong only when it violates all supported alternatives. `spellSpecific` expresses these alternatives without making every spell valid under every condition.

## How a decision is made

The parser normalizes Warcraft Logs events, updates condition state for buffs, debuffs, resources, charges, cooldown availability, position, and linked damage, and then evaluates rules from top to bottom for each rotational cast. The first rule with at least one known, available, in-range spell whose condition is true becomes the expected action. Matching casts are successes; other tracked rotational casts are violations and receive a timeline annotation plus an explanation in the guide.

The first 20 seconds are owned by the dedicated opener matcher. The APL continues updating all of its state during that period but does not judge those casts, preventing a valid Method opener from being compared against Wowhead's steady-state “ERW at two charges” rule.

Warcraft Logs reports Runic Power in tenths, so an in-game threshold of 75 is encoded as 750. Runes use their normal 0–6 values. Razorice is stored per target and target instance; a global stack count would produce incorrect Shattering Blade advice after a target swap.

Multi-target inference is deliberately one-way. Frostscythe is recognized as an AoE choice when its damage proves it hit at least two targets, and Glacial Advance when it proves at least three. The analyzer never claims that an uncast AoE action would have hit those targets. This prevents the log from inventing positioning information it does not contain.

## Rule-to-source map

Cooldown rules:

- `frost.cooldown.erw-cap`: all three sources; avoid capping ERW's two charges.
- `frost.cooldown.mark-pillar`: Wowhead and Method opener variants; Mark/Pillar order is accepted while both are ready.
- `frost.cooldown.pillar`: all three sources; send Pillar unless encounter timing requires a hold.
- `frost.cooldown.breath`: all three sources; Breath is paired with Pillar and requires 60 Runic Power.
- `frost.cooldown.frostwyrm`: all three sources; Frostwyrm/Recall belongs inside Pillar (or the paired Breath window).
- `frost.cooldown.reapers-mark`: all three sources; Deathbringer only, with the two-rune cost represented.
- `frost.cooldown.erw-low-resources`: Method and SimC, cross-checked against Wowhead's “generate Killing Machine” rule.

Core and target-count rules:

- `frost.common.high-proc-spend`: Wowhead, Method, and SimC; two Killing Machine stacks or Exterminate, plus Frostbane where talented.
- `frost.common.frost-fever`: SimC and the guide requirement to establish Frost Fever.
- `frost.common.proc-spend`: union of the source-supported Killing Machine, Rime, Shattering Blade, and Runic Power cap orderings. Each alternative retains its own condition.
- `frost.aoe.rp-spender`: all three sources; Glacial Advance at three or more proven targets.
- `frost.st.rp-spender`: all three sources; Frost Strike when affordable.
- `frost.aoe.rune-spender`: all three sources; Frostscythe at two or more proven targets.
- `frost.st.rune-spender`: all three sources; Obliterate when two runes are available.
- `frost.common.pillar-howling-blast`: Wowhead and SimC; non-Rime Howling Blast is accepted inside Pillar when Killing Machine is absent.
- `frost.common.fallback-howling-blast`: Wowhead's final fallback. Higher-priority available actions still make the cast a violation.

Opener variants:

- `frost.opener.rider-breath.method`: Method Rider Breath opener.
- `frost.opener.rider-breath.wowhead`: Wowhead Rider Breath opener.
- `frost.opener.deathbringer-breath.method`: Method Deathbringer Breath opener.
- `frost.opener.deathbringer-breath.wowhead`: Wowhead Deathbringer Breath opener.
- `frost.opener.rider-shattering.method`: Method Rider Shattering Blade opener.
- `frost.opener.deathbringer-shattering.method`: Method Deathbringer Shattering Blade opener.

Opener stages are ordered, while casts named in the same stage are unordered so same-timestamp off-GCD actions do not create false failures. Raise Dead and on-use trinkets are ignored by the strict matcher because their availability and event contracts are outside the Frost rotational spellbook.

## Known limitations

- Boss mechanics, downtime, add timing, movement, immunity, priority damage, and fight-end holds can justify delaying a cooldown. The APL cannot infer intent; review isolated cooldown violations in context.
- Target-count rules validate actual linked damage only. They cannot criticize a single-target cast merely because multiple enemies may have existed nearby.
- Frostwyrm Recall uses the same cast identity. The recurring window check validates Pillar alignment but does not yet model the Deathbringer “after Mark explodes and Exterminate is spent” optimization.
- Frostbane is treated as the talent/buff spell ID. Revalidate this event contract if Blizzard splits the replacement action or aura ID.
- The APL does not reproduce SimC's fight-remains, raid-event, trinket, racial, target-selection, or pooling forecasts. Those are simulation controls, not facts reliably available from a combat log.

## Patch update checklist

1. Update the patch and review dates above. Pin a new SimC `midnight` commit rather than linking only to a moving branch.
2. Regenerate talent data and verify the cast, buff/debuff, damage, resource, cooldown, charge, and linked-target IDs on representative logs for both hero trees.
3. Diff the three trusted priorities. Add a stable rule/opener ID for each new concept; do not rename existing IDs for wording-only changes.
4. Encode disagreements as spell-specific alternatives. Require target-aware state for target debuffs and positive linked-damage evidence for target counts.
5. Update `Abilities.tsx` cooldowns, charges, GCD behavior, talent gates, and every spell referenced by the APL.
6. Run `npm run validate:frost-apl`, the focused Frost/APL tests, `npm run typecheck`, and `npm run lint`.
7. Replay representative real logs for Rider and Deathbringer, Breath and non-Breath, single target and multi-target. Inspect common violation clusters before changing patch compatibility.
