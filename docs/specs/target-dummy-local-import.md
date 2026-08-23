# First-class target-dummy local import

**Status:** Proposed

**Scope:** Local browser import only. No Warcraft Logs or shared analysis behavior changes.

## Summary

Keep one local-import entry point that accepts an unmodified Retail advanced combat log and routes it
automatically. A log with a usable encounter envelope and combatant info follows the current import
path. A log without that metadata enters synthetic preparation: find training attempts, ask the user
to choose an attempt, accept the matching SimulationCraft addon profile, and store the result as a
normal local report.

The first implementation should synthesize only the information that the local analysis contract
requires and that a target-dummy log does not contain:

- one local fight around the selected attempt;
- one complete normalized `CombatantInfoEvent` for the selected player, built from `/simc` data;
- report/player metadata needed to open that fight.

It should preserve combat records, player and target GUIDs, target names, flags, spell IDs, map IDs,
timestamps, amounts, and resources. In particular, it should not turn a dummy into a historical raid
boss or rewrite every target to one synthetic actor.

This is deliberately a separate adapter in the existing local-log feature. The WoWAnalyzer parser
and class analysis modules should continue to receive their existing `Report`, `PlayerDetails`, and
`AnyEvent[]` contracts without knowing that the fight came from a target dummy.

## Why this shape fits the current repository

The current local path already has most of the required downstream plumbing:

1. `LocalReportSelector` accepts a browser `File`.
2. `LocalReportImport` stages an IndexedDB report and coordinates a worker.
3. `localCombatLog.worker.ts` performs discovery and normalization passes.
4. `LocalCombatLogParser` constructs WCL-shaped report metadata and normalized events.
5. `LocalCombatLogDataSource` exposes the stored result through the same analysis data-source
   interface as a Warcraft Logs report.

The current encounter discovery deliberately rejects a raw target-dummy capture because it requires
both encounter markers and at least one `COMBATANT_INFO` record. That validation is correct and
should remain unchanged. A small discovery router should recognize that specific absence and select
the synthetic path instead of presenting it as an import failure.

There are two other important constraints in the current code:

- fight selection hides `fight.boss === 0`, although unknown non-zero encounter IDs are otherwise
  handled without requiring a registered raid boss;
- the local `COMBATANT_INFO` normalizer currently keeps the spec ID but creates empty talent, gear,
  aura, and stat data. Merely inserting a raw `COMBATANT_INFO` line would therefore not supply the
  metadata that class analyzers need.

For those reasons, target-dummy support should prepare a local fight and a normalized combatant-info
object explicitly. It should not loosen the existing encounter parser's invariants or round-trip the
whole capture through a transformed text file.

## Goals

- Treat a target-dummy capture as a supported local input, without requiring another project or an
  intermediate download/upload.
- Keep one file picker and automatically choose the encounter or synthetic path from file contents.
- Make the user choose the relevant character and attempt when discovery is ambiguous.
- Use the character's own `/simc` profile for spec, talents, and equipped items.
- Keep the raw combat-event identities and payloads intact.
- Keep all processing in the browser worker and all persisted data in the existing local IndexedDB.
- Contain almost all new code under `src/local/target-dummy/` and local-import UI files.
- Make it easy to remove or rebase the feature while pulling changes from upstream WoWAnalyzer.
- Establish evidence-based gates before adding any boss or target compatibility rewrites.

## Non-goals for the first version

- Producing a transformed combat log for Warcraft Logs, WowCoach, or any other tool.
- Supporting the full SimulationCraft language. Only the official addon `/simc` character export is
  in scope.
- Inventing a kill, target death, boss health, phase, difficulty, raid size, or zone.
- Renaming or merging target dummies.
- Replacing target GUIDs, NPC IDs, hostility flags, or map IDs.
- Perfect reconstruction of live ratings or pull-time auras that `/simc` does not contain.
- Automatically selecting a low-confidence attempt without showing it to the user.
- Moving target-dummy concepts into `src/parser/`, `src/analysis/`, or `src/game/raids` unless a later
  validation gate proves that a narrowly scoped change is unavoidable.

## User workflow

The `/local-import` page keeps its existing single file picker. There is no encounter/dummy mode
choice. After discovery, the workflow branches only when the file lacks the metadata required by the
normal encounter path:

```text
Choose raw log
  -> inspect encounter markers and combatant info
     -> usable encounter metadata: continue the current import and open the report
     -> metadata absent: discover recorder/player candidates and attempt windows
        -> choose character when it is not unambiguous
        -> choose an attempt
        -> paste matching /simc output
        -> validate identity, build, spec, talents, and equipment
        -> synthesize missing metadata, import, and open the resulting local fight
```

The file remains an opaque `File` held by the UI while discovery and import run in a worker. The UI
must not call `File.text()`. Cancelling or starting over invalidates the worker operation and discards
any staged report, matching the existing import behavior.

Attempt choices should show character name, start time, duration, target name/count, and a confidence
label. GUIDs and discovery scores belong in an optional diagnostic disclosure, not normal labels.

Before import, the UI should state the limits of the synthesized metadata: identity, spec, decoded
talents, and equipment come from `/simc`; unavailable live ratings and pull-time auras use explicit
defaults.

### Automatic routing rule

Classification must use parsed record types, never the filename, MIME type, target name, or a
“Training Dummy” substring. Treat the file as a normal encounter log when discovery finds at least
one usable envelope with this order:

1. `ENCOUNTER_START`;
2. at least one `COMBATANT_INFO` while that encounter is active;
3. its matching `ENCOUNTER_END`.

That route invokes the current encounter discovery, normalization, and persistence behavior. It must
not ask for SimC or session selection.

If no such envelope exists, evaluate the target-dummy session candidates collected during the same
streaming discovery pass. If candidates exist, enter synthetic preparation. If neither a usable
encounter nor a qualifying dummy session exists, return an actionable unsupported-input error.

Non-encounter activity must be alone in its source file. If a file contains any usable genuine
encounter, only genuine encounters count and the file follows the current encounter flow. Do not
offer unmarked dummy activity from that file. The UI should explain this requirement when synthetic
discovery finds no eligible standalone session.

## Isolation boundary

Put target-dummy domain code in a fork-owned subtree:

```text
src/local/target-dummy/
  contracts.ts
  discoveryRouter.ts
  discovery.ts
  sessionWindow.ts
  simc/
    parser.ts
    contracts.ts
  combatant-info/
    builder.ts
    talents.ts
    validator.ts
    data/
  prepareImport.ts
```

Expected integration changes outside that subtree should be limited to:

- `src/interface/LocalReportSelector.tsx`, or a small new component imported by it;
- an import controller/persistence coordinator extracted from `LocalReportImport.ts` so discovery
  can pause for synthetic inputs;
- a small routing branch in the existing `localCombatLog.worker.ts` protocol;
- optional import-origin fields in `localReportStore.ts`;
- exports of stable line/event decoding primitives from `LocalCombatLogParser.ts`, if required.

Do not add a dependency on the sibling transformer repository. Bring over only behavior that is still
needed, rewrite it against this repository's contracts, and give it local tests. Runtime and CI must
work from a standalone checkout of this repository.

The adapter boundary should produce this repository's existing shapes:

```ts
interface PreparedTargetDummyImport {
  fight: WCLFight;
  selectedPlayerGuid: string;
  targetGuids: readonly string[];
  combatantInfo: CombatantInfoEvent;
  sourceWindow: { activityStart: number; fightStart: number; end: number };
  diagnostics: LocalDiagnostic[];
}
```

The persistence layer should not know how sessions or SimC profiles are parsed. Conversely, the
target-dummy modules should not know about IndexedDB transactions.

## Discovery routing architecture

Do not preflight the whole file and then start discovery again. The first worker pass should feed
each decoded record to two isolated consumers:

- the existing encounter discovery consumer;
- the target-dummy aggregate/session consumer.

At end of file, `discoveryRouter.ts` applies the automatic routing rule. Running the lightweight
target-dummy aggregates beside encounter discovery avoids a third full-file read on synthetic logs
and does not retain source lines or normalized events. If the encounter consumer has a usable
envelope, discard the synthetic discovery result and publish the existing `discovered` message. If
not, publish a typed `target-dummy-input-required` message containing player/session choices and
diagnostics.

The worker then pauses without staging normalized events while the UI collects the selected session
and SimC profile. A `prepare-target-dummy` message resumes the same import operation. The UI still has
one file picker and one import task; the protocol pause is an internal implementation detail. Native
encounter imports continue directly from discovery acknowledgement to normalization as they do now.

Use explicit message variants rather than interpreting exception text. Encounter syntax/version
errors remain errors. Only the absence of a usable encounter envelope selects synthetic preparation.

## Session discovery

The existing transformer has a sound starting point for sessionization, but the implementation here
should be smaller because it does not need to create a portable filtered-log format.

### Actor and recorder selection

- Identify actors by GUID shape, never by localized names.
- A player carrying `COMBATLOG_OBJECT_AFFILIATION_MINE` is a recorder candidate.
- Auto-propose the recorder only when exactly one player has that flag.
- If there is no unique recorder, rank observed players by direct hostile casts/damage and ask the
  user to choose.
- Names are display metadata only. They are not ownership or dummy evidence.

### Qualifying activity

A candidate attempt begins with a direct, player-initiated hostile action against a non-player actor.
It may then be extended by:

- further direct hostile actions by that player;
- periodic damage belonging to the attempt;
- actions by an entity with explicit ownership evidence for the player.

Ownership evidence should use, in descending priority:

1. advanced-log owner GUID fields;
2. `SPELL_SUMMON` or `SPELL_CREATE` edges;
3. `AFFILIATION_MINE` on a non-player actor when there is exactly one recorder candidate.

Do not infer ownership from an actor name.

Group activity per player rather than per target. This keeps one cleave attempt with a target set,
instead of producing five overlapping attempts for five dummies.

### Boundaries and confidence

Use a configurable inactivity threshold, initially 10 seconds. A gap greater than the threshold ends
the open attempt. Also close attempts on:

- a new `COMBAT_LOG_VERSION` segment;
- a backwards timestamp;
- zone/map hard boundaries;
- target death/destruction when applicable;
- a genuine `ENCOUNTER_START`.

Activity inside a genuine `ENCOUNTER_START`/`ENCOUNTER_END` envelope is not a dummy attempt. Discard
a short hostile lead-in immediately before a real encounter marker so pre-pull combat is not offered
as training.

Retain counts and timestamps during discovery, not full raw lines or normalized events. Confidence
should be deterministic and explainable. Start with the transformer's proven defaults:

- likely duration: at least 20 seconds;
- likely player-initiated actions: at least 2;
- likely qualifying actions: at least 3;
- incidental/passive-only windows hidden by default.

The detected activity window starts at the first qualifying player action and ends at the last
qualifying action. The prepared fight starts five seconds before that activity so common pre-cast
buffs, summons, and cooldowns are included in analysis. Define this as an explicit code constant, for
example `TARGET_DUMMY_PRE_ROLL_MS = 5_000`, rather than a user-facing setting in the first version.

Clamp the prepared start to the current log segment's first timestamp and never cross a hard boundary,
backwards timestamp, `COMBAT_LOG_VERSION`, or genuine encounter envelope. The UI should distinguish
the detected activity duration from the analyzed fight duration when showing diagnostics. The fight
ends at the last qualifying action; no post-roll is added initially.

## The local fight envelope

The prepared import should construct `WCLFight` directly; it does not need to insert textual
`ENCOUNTER_START` and `ENCOUNTER_END` records into a new file.

Settled first-version values:

- `id`: the next report-local sequential fight ID;
- `start_time`: five seconds before the detected activity start, subject to boundary clamping;
- `end_time`: the last qualifying action;
- `name`: `Training Dummy` for one target, or `Training Dummies (N targets)` for cleave;
- `kill`: `false`;
- `difficulty` / `size`: absent;
- `boss`: the documented negative local-only sentinel `-1`.

The sentinel is necessary because the current fight picker treats `boss === 0` as trash and hides it.
It must never be added to the raid encounter catalog or presented as a real encounter ID. Leave the
core eligibility behavior unchanged initially. Add a focused UI/analysis test covering
`normalizedEncounterId`, fight grouping, header rendering, URLs, and wipe numbering. If `-1` exposes
an assumption, stop and revisit this decision with that concrete failure; do not silently borrow a
real boss ID.

Store the origin on the local manifest, not the shared report contract:

```ts
type LocalImportKind = 'encounter-log' | 'target-dummy';
```

This enables accurate labels and diagnostics without teaching upstream parser types about the new
source.

## SimulationCraft and combatant info

### Accepted input

Implement a bounded parser for the official SimulationCraft addon export. Require:

- addon provenance header;
- exactly one active character declaration;
- level, race, region, server, spec, and talent export;
- at least one active equipped item;
- no conflicting duplicate scalar or equipment-slot values.

Ignore commented bag, reward, linked, and saved-loadout lines. Preserve unknown item options for
diagnostics, but reject active SimulationCraft instructions outside the supported addon subset. Apply
input byte, line-count, and line-length limits before building collections.

The normalized character name from `/simc` must match the selected log player. The character's class
and textual spec must agree with the spec ID in the talent export. The first synthetic release
supports only Retail project 1, combat-log version 22, WoW `12.1.0`, and the matching SimC/talent
snapshot identified as `retail-12.1.0-project-1-log-22` by the current fixtures. Anything else fails
with an actionable unsupported-build error; do not attempt nearest-version or best-effort decoding.
This restriction applies to the new synthetic path; it does not narrow the builds accepted by the
existing encounter path.

### Talent data

Blizzard talent strings encode positions, not the complete node/entry definitions. Decode them
against a checked-in, generated tree snapshot selected by serialization version, spec ID, and WoW
patch. Keep the generator and generated artifact inside the target-dummy subtree (or its scripts
directory) so updating upstream analysis code does not touch it.

Generation may use the network only as an explicit development command. Runtime import must use the
checked-in artifact and make no request. Unsupported serialization versions or incompatible tree
data fail closed with an actionable error.

### Build a normalized event, not a fake raw line

Build a `CombatantInfoEvent` directly and insert it as the first normalized event in the selected
fight. Bind it to the selected local actor ID and session start timestamp. This avoids serializing a
V22 line only for `LocalCombatLogParser` to parse it again, and avoids the current skeleton
`combatantInfo()` behavior.

Populate:

- exact selected player identity binding;
- exact spec ID;
- talent tree entries as `{ nodeID, id: entryID, rank }`;
- equipped item IDs, item levels, enchants, bonus IDs, and gems in stable WoW equipment-slot order;
- faction when unambiguously derivable from race, otherwise require a user choice.

Preserve empty equipment slots so array index remains the equipment slot. Validate how an authentic
current WCL `CombatantInfoEvent` represents an empty slot before choosing its placeholder. Do not let
missing slots corrupt slot-index lookup or average item level. A legitimately empty slot is allowed,
but an equipped item without an item level blocks import and asks the user to regenerate `/simc`.

`/simc` does not contain all live primary/secondary ratings or pull-time auras. For version one:

- use documented zero/default values for unavailable ratings;
- use an empty aura list;
- do not infer any combatant-info field from advanced combat-event snapshots;
- do not infer buffs, food, flasks, temporary enchants, or proc state;
- emit visible diagnostics that stats and auras were defaulted.

The builder should return typed failures such as profile malformed, character mismatch, class/spec
mismatch, unsupported build, unsupported talent serialization, missing item level, or faction choice
required. Never substitute data from another character or from a checked-in example payload.

## Import and normalization

The existing local-import worker performs two bounded passes over the original `File`; the automatic
router selects which preparation logic it uses:

1. discovery returns player and session choices while retaining only aggregates;
2. import rescans the file, normalizes records from the clamped five-second pre-roll through the
   chosen inclusive end time, and emits event batches through the existing IndexedDB persistence
   protocol.

During pass two:

- use the existing local event decoders for combat records;
- use a target-dummy-owned actor/fight collector rather than weakening encounter discovery;
- attach only the selected player and explicitly owned pets to the selectable player entry;
- inject exactly one built `CombatantInfoEvent` at fight start;
- exclude any source `COMBATANT_INFO` for that player inside the window to avoid duplicates;
- assign actors and normalized events to the one prepared fight;
- preserve the order of source events with equal timestamps after the injected combatant-info event;
- stream batches with the existing acknowledgement/backpressure behavior.

Do not pre-filter all normalized records solely to the selected player. The existing local data source
already actor-filters analysis event queries and includes owned pets. Keeping the in-window source
records also preserves incoming effects and makes later decoder improvements possible without
re-importing a transformed file. If storage measurement shows nearby noise is material, add a
separate, audited filter later; it is not required to prove target-dummy analysis.

Increment `LOCAL_PARSER_VERSION` when persisted shapes or target-dummy normalization semantics become
incompatible. An incomplete or cancelled preparation/import must be removed by the same recovery
path as an incomplete encounter import.

## What must remain untouched

Add integration assertions that every selected target retains its original:

- GUID and derived NPC ID;
- name;
- friendly/hostile classification from the source flags;
- event source/target role;
- map ID in advanced actor snapshots;
- timestamps and damage/resource values.

Also assert that the output contains none of the transformer's compatibility artifacts: no Razorgore
ID/name/GUID, Blackwing Lair map or zone, forced hostile-flag rewrite, or merged cleave target.

## Delivery plan

### Phase 0 — prove the minimal hypothesis

Build a test-only prepared target-dummy fight from a compact real-derived fixture and a known SimC
profile. Feed its normalized events to one currently supported specialization parser.

The spike passes only if:

- the fight is visible and navigable with a local sentinel ID;
- the fight includes events from the configured five-second pre-roll without crossing a segment or
  hard boundary;
- player selection resolves the intended spec;
- the analyzer reaches results with the full combatant-info object;
- casts, damage, resources, and target actors work without any target or map rewrite.

This is the decision gate for the entire approach. Do not start compatibility transformation work if
the spike passes.

### Phase 1 — automatic discovery router and session discovery

- Add the single-pass discovery router and typed encounter/synthetic outcomes.
- Add contracts, actor aggregation, ownership evidence, session grouping, confidence reasons, and
  cancellation/progress.
- Prove that a normal encounter fixture takes the existing route without requesting SimC, while the
  raw dummy fixtures take the synthetic route.
- Unit-test compact single-target, cleave, gap splitting, genuine-encounter exclusion, nearby-player
  noise, pets, Unicode, backwards timestamps, and missing recorder flags.
- Keep full-capture tests out of the default unit-test command.

### Phase 2 — SimC and combatant-info builder

- Port the small addon grammar, talent decoder, generated talent snapshot, and structural validation
  needed by this repository.
- Produce `CombatantInfoEvent`, not an export string.
- Compare the normalized output with an authentic same-character combatant-info sample where fields
  overlap.
- Lock the accepted log build, SimC format, talent serialization, and generated snapshot to the exact
  verified fixture versions.
- Add negative tests for identity, build, spec, talent, equipment, faction, and bounded-input errors.

### Phase 3 — prepared import worker and persistence

- Add pass-two preparation and reuse existing local event decoders and event-batch persistence.
- Extend the existing worker/controller protocol so a synthetic import can pause for session/SimC
  input and resume without presenting a second upload entry point.
- Add `LocalImportKind` and target-dummy diagnostics to the manifest.
- Preserve the existing encounter-log worker behavior and tests unchanged.
- Bump the local parser version if required by persisted schema changes.

### Phase 4 — single-entry guided UI

- Keep the existing file picker and add the target-dummy states reached only after automatic
  discovery selects the synthetic route.
- Support character choice, attempt choice, SimC validation, progress, cancellation, retry, and start
  over.
- Navigate directly to the selected local fight/player after a successful import when unambiguous.
- Keep technical details and defaulted-field warnings available without crowding the main path.

### Phase 5 — integration, performance, and release confidence

- Add end-to-end tests proving the same file picker routes an encounter fixture directly and a dummy
  fixture through preparation, rendered analysis, reopen, and deletion.
- Measure discovery memory on the 28.9 MB noisy capture and import/storage size on the selected
  window.
- Verify cancellation and stale-worker responses on both passes.
- Run format, lint, typecheck, focused unit tests, static architecture checks, production build, and
  the local-import browser suite.
- Document the feature and its SimC/defaulted-metadata limitations in the static-hosting guide.

## Fixture strategy

The sibling transformer's `data/` directory provides useful source evidence:

- `dummy-encounter.txt`: large noisy single-target capture with nearby players and owned ghouls;
- `cleave-logs.txt`: one continuous five-target attempt;
- `session-splitting.txt`: four windows separated by gaps over 10 seconds;
- `boss-encounter.txt`: genuine encounter negative case and authentic combatant-info reference;
- `example-simc.txt`: matching addon profile;
- its compact derived/synthetic fixtures: parser, encounter, external-effect, and ownership cases.

Tests in this repository must not rely on `/Users/ntop/git/WoW-Target-Dummy-Log-Transformer` existing.
Copy only reviewed, minimized, and appropriately sanitized fixtures needed for default tests into a
new local fixture directory, with provenance notes. Keep the 28.9 MB real capture in an explicit
opt-in integration/performance suite or add it here only after a deliberate repository-size and
privacy decision.

For golden session tests, write expectations from the transformer's approved fixture manifest rather
than regenerating expected values from the new discovery algorithm. This prevents a bug from blessing
its own output.

## Fallback gates

Only introduce additional compatibility behavior after the preceding phase has a failing fixture or
end-to-end analysis test that identifies the exact missing invariant.

1. **Unknown encounter behavior:** if a local sentinel breaks a specific UI or analyzer, first make
   that code local-source-aware. Do not borrow an unrelated real encounter ID.
2. **Target identity:** if an analyzer requires a boss actor rather than any enemy actor, add the
   smallest local adapter metadata needed by that analyzer. Do not globally replace target GUIDs or
   names.
3. **Hostility flags:** if classification is wrong, fix the local flag decoder against the source
   schema. Do not rewrite correct source flags.
4. **Map/zone context:** add it only if a named analysis feature genuinely consumes it. Do not copy
   Blackwing Lair context used to satisfy a different external tool.
5. **Multiple targets:** preserve separate actors. If one focus target is required for a statistic,
   derive a focus target for that statistic and retain the complete target set.

Each fallback needs a regression test, a diagnostic explaining synthesized behavior, and a short ADR
entry in this document.

## Acceptance criteria

- The local-import page has one combat-log file picker and no manual encounter/dummy mode switch.
- A log with a usable encounter envelope and combatant info automatically completes through the
  existing path without requesting SimC or session selection.
- A log without usable encounter metadata automatically enters synthetic session preparation.
- A user can import a raw current-Retail target-dummy log and matching `/simc` output entirely in the
  browser.
- The user can select the correct player and one of multiple discovered sessions.
- The selected fight is visible, opens, reopens after refresh, and can be deleted.
- Analysis receives exactly one complete combatant-info event for the selected player.
- Spec, talent ranks, equipped item IDs/levels, enchants, bonuses, and gems match the accepted SimC
  profile.
- Unavailable live stats and auras are explicitly reported as defaulted.
- No unavailable combatant-info value is inferred from advanced event snapshots.
- Equipped items missing item level block import; legitimate empty equipment slots retain their
  indices.
- The analyzed fight begins five seconds before the first qualifying action, clamped to its log
  segment/hard boundary, and ends at the last qualifying action.
- The five-second pre-roll is a named code constant covered by boundary tests.
- Single-target, cleave, gap-splitting, genuine-encounter exclusion, nearby-noise, and owned-pet cases
  are covered.
- Original target identities and combat payload values are unchanged.
- Existing encounter-log imports remain behaviorally and test-wise unchanged.
- No runtime or test dependency on the sibling transformer checkout exists.
- No target-dummy concepts are added to shared class analyzers or the raid encounter catalog.

## Settled product decisions

- Try `boss: -1` first and leave core fight eligibility unchanged.
- Require target-dummy/non-encounter activity to be in a file without usable genuine encounters. If
  genuine encounters exist, only they count.
- Do not infer unavailable combatant-info values. Leave them at documented defaults and investigate
  better sources separately in the future.
- Preserve authentic empty equipment slots, but block import when an equipped item has no item level.
- Support only the exact current build/schema/talent snapshot verified by fixtures.
- Begin the analyzed fight five seconds before detected activity, controlled by a code constant and
  clamped at segment/hard boundaries.

Phase 0 still needs to verify the exact authentic WCL empty-slot representation and that `boss: -1`
passes the current UI/parser assumptions. Those are implementation evidence checks, not invitations
to choose a different behavior silently. Any failure comes back for an explicit product decision.

The default remains: keep the source combat events intact and synthesize only the local report
metadata that is demonstrably missing.
