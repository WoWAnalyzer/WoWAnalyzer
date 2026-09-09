# What to Focus On

A guide section that shows the few changes most likely to raise the throughput of a player,
ranked by weighted impact. It shows at most four items. It says so when it finds fewer than
four, and it says so when it finds none.

The Demonology and Affliction Warlock guides use it. The full examples are in
`src/analysis/retail/warlock/demonology/modules/guide/ImprovementPrioritiesSection.tsx` and
`src/analysis/retail/warlock/affliction/modules/guide/ImprovementPrioritiesSection.tsx`.

## How it ranks

Each check produces one `ImprovementPriority`:

| Field         | Meaning                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `score`       | 0 to 1. How well the player did. 1 means there is nothing left to gain.                         |
| `weight`      | How much the check matters to throughput, relative to the other checks. Only the ratio matters. |
| `performance` | The rating. Only `Ok` and `Fail` are shown. `Good` and `Perfect` count as "nothing to fix".     |
| `title`       | An imperative heading. Example: "Cast Call Dreadstalkers closer to cooldown".                   |
| `description` | What happened in this fight, with numbers, and what to do instead.                              |

Impact is `weight × (1 − score)`. The component keeps the `Ok` and `Fail` checks, sorts them
by impact, and cuts the list at four. A weight 10 check at a 50% score outranks a weight 5
check at a 0% score.

## Add it to a spec

Time: about half a day for a spec with existing analyzers. Most of that is calibration.

1. Create `modules/guide/ImprovementPrioritiesSection.tsx` in the spec folder. Export a pure
   `build<Spec>Priorities(inputs)` function, and a thin component that reads the analyzers
   with hooks and calls it:

   ```tsx
   export interface MySpecPriorityInputs {
     info: Info;
     castEfficiency?: CastEfficiency;
     alwaysBeCasting?: AlwaysBeCasting;
   }

   export function buildMySpecPriorities({
     info,
     castEfficiency,
     alwaysBeCasting,
   }: MySpecPriorityInputs): ImprovementPriority[] {
     const candidates: (ImprovementPriority | null)[] = [
       activeTimePriority({
         alwaysBeCasting,
         fightDuration: info.fightDuration,
         weight: 10,
         thresholds: { perfect: 0.02, good: 0.1, ok: 0.2 },
         worst: 0.3,
         movementTips: <>While you move, use ...</>,
       }),
       castEfficiencyPriority({ castEfficiency, spell: TALENTS.BIG_COOLDOWN_TALENT, weight: 9 }),
     ];
     return candidates.filter((p): p is ImprovementPriority => p !== null);
   }

   function ImprovementPrioritiesSection() {
     const info = useInfo();
     const castEfficiency = useAnalyzer(CastEfficiency);
     const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);
     if (!info) {
       return null;
     }
     const priorities = buildMySpecPriorities({ info, castEfficiency, alwaysBeCasting });
     return <ImprovementPriorities priorities={priorities} />;
   }

   export default ImprovementPrioritiesSection;
   ```

2. Render `<ImprovementPrioritiesSection />` as the first child of the spec `Guide`.
3. Add a test for the builder with stub analyzers. The Affliction test shows the pattern:
   `src/analysis/retail/warlock/affliction/modules/guide/ImprovementPrioritiesSection.test.ts`.

## Write a check

Use a helper when one fits. All of them are exported from
`interface/guide/components/ImprovementPriorities`.

| Helper                         | Data source           | Use for                                                                                              |
| ------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------- |
| `castEfficiencyPriority`       | `CastEfficiency`      | A cooldown the player must use close to on-cooldown. Uses the thresholds from the spec `Abilities`.  |
| `activeTimePriority`           | `AlwaysBeCasting`     | Downtime. The spec gives the thresholds and the movement advice.                                     |
| `resourceWastePriority`        | any `ResourceTracker` | A resource generated at its cap. A class can wrap it with its own wording (see the Warlock wrapper). |
| `linearScore`                  | any number            | A 0 to 1 score that is 1 at `best` and 0 at `worst`.                                                 |
| `performanceForLowerIsBetter`  | any number            | A rating for downtime, waste, or misses.                                                             |
| `performanceForHigherIsBetter` | any number            | A rating for uptime, efficiency, or coverage.                                                        |

For anything else, build the object by hand. Example, a DoT uptime check:

```tsx
function agonyPriority(agony: Agony | undefined): ImprovementPriority | null {
  if (!agony?.active) {
    return null;
  }
  return {
    id: 'agony-uptime',
    title: (
      <>
        Keep <SpellLink spell={SPELLS.AGONY} /> active
      </>
    ),
    description: (
      <>
        <SpellLink spell={SPELLS.AGONY} /> was active for {formatPercentage(agony.uptime, 1)}% of
        the fight. Refresh it in its last 5 seconds, before it expires.
      </>
    ),
    score: linearScore(agony.uptime, 1, 0.6),
    weight: 9,
    performance: agony.DowntimePerformance,
  };
}
```

Return `null` when the check does not apply: the talent is missing, the analyzer is inactive,
or there were no casts. An absent check does not count against the player.

## Pick weights and thresholds

- Weight 10 to 12: the biggest lever of the spec. Downtime, or the main burst window.
- Weight 6 to 9: a core cooldown, or a primary DoT.
- Weight 3 to 5: resource waste, a secondary cooldown, or proc usage.
- Weight 2: a minor habit.
- Reuse the thresholds an analyzer already has (`suggestionThresholds`, `DowntimePerformance`),
  so this section agrees with the rest of the guide.
- Only `Ok` and `Fail` show. Set the `good` threshold where a top player lands.

## Calibrate with two logs

Get a top parse and an average parse of the same boss. Replay each through the spec parser and
print the ranked list. Then apply three rules:

1. The top parse must show "Nothing major to fix", or at most one item.
2. The average parse must show three or four items.
3. Remove a check that rates the top parse worse than the average parse. It does not measure
   skill.

Replay recipe. This is temporary work. Do not commit the harness or the logs.

1. Fetch `https://wowanalyzer.com/i/v1/report/fights/<code>?translate=true`. Note the
   `start_time` and `end_time` of the fight and the `id` of the player.
2. Fetch `https://wowanalyzer.com/i/v1/report/events/<code>?start=<start>&end=<end>&actorid=<player>&translate=true`.
   Page with `nextPageTimestamp` until it is absent. Fetch the same URL with
   `filter=type="combatantinfo"` instead of `actorid` for the combatant info.
3. In a temporary vitest file under `src/`, construct the spec `CombatLogParser` with the
   report (add `code` and `isAnonymous`), the player, the fight (add `offset_time: 0` and
   `filtered: false`), the combatant info event of the player, and `DEFAULT_CHARACTER_PROFILE`
   from `parser/core/tests/constants`.
4. Call `parser.normalize(events)`, sort by timestamp, set `parser.normalizedEvents`, trigger
   each event through `parser.getModule(EventEmitter).triggerEvent`, then call `parser.finish()`.
5. Read the analyzers with `parser.getModule(...)`, call your builder, then
   `rankImprovementPriorities`. Print the ids, scores, and ratings.
6. Delete the file before you commit.

## Write the copy

The section is advice. Keep it plain, in the style of ASD-STE100 Simplified Technical English:

- One instruction per sentence. Max 20 words for an instruction, 25 for a description.
- Active voice and simple tenses. No contractions. No semicolons.
- Numbers first: what happened in this fight. Then what to do instead.
- Say what to press. "Use Shadow Bolt as the filler" beats "improve your rotation".
- Nothing the player cannot change during the fight: no gear, no fight length, no group.

## Checklist before a PR

- The section is the first child of the guide.
- Every check returns `null` when it does not apply.
- Top parse: nothing to fix. Average parse: three or four items.
- The builder test with stub analyzers passes.
- The spec changelog has an entry.
