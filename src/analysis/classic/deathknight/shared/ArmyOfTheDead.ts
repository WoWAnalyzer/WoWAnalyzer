import SPELLS from 'common/SPELLS/classic';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// Exported so other modules (e.g. RaiseDeadTracker) can distinguish Army of
// the Dead's temporary ghouls from the permanent Raise Dead ghoul, since both
// are SELECTED_PLAYER_PET sources.
export const ARMY_GHOUL_ID = 24207;

/** Army of the Dead's ghouls despawn exactly 45s after they're summoned. */
const ARMY_OF_THE_DEAD_DURATION_MS = 45_000;

/** Fallback used only when we can't find any ghoul death event to derive the real cast time from. */
const FALLBACK_PREPULL_OFFSET_MS = 1500;

export default class ArmyOfTheDead extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const ghouls = new Set(
      this.owner.playerPets.filter((pet) => pet.guid === ARMY_GHOUL_ID).map((pet) => pet.id),
    );
    const sawArmyGhoul = events.some(
      (event) =>
        (HasSource(event) && ghouls.has(event.sourceID)) ||
        (HasTarget(event) && ghouls.has(event.targetID)),
    );

    if (sawArmyGhoul) {
      // Classic logs don't reliably capture Army of the Dead's actual cast
      // event (it's commonly prepulled several seconds before the pull, and
      // the real cast timestamp isn't preserved). The ghouls despawn on a
      // fixed 45s timer though, and death events *are* reliably logged, so
      // we work backward from the last ghoul's death to recover the true
      // cast time instead of guessing a fixed prepull offset.
      //
      // This assumes the ghouls survive their full 45s duration. If they're
      // AoE'd down early, the derived timestamp will be off. That's an
      // accepted tradeoff: ghouls dying early is the uncommon case, and being
      // right most of the time (real cast time, when they live out the
      // duration) beats being wrong every time (the old hardcoded -1.5s
      // guess, which never matched reality for anyone who prepulls earlier
      // or later than that).
      const ghoulDeathTimes = events
        .filter((event) => event.type === EventType.Death && ghouls.has(event.targetID))
        .map((event) => event.timestamp);

      const timestamp =
        ghoulDeathTimes.length > 0
          ? Math.max(...ghoulDeathTimes) - ARMY_OF_THE_DEAD_DURATION_MS
          : this.owner.fight.start_time - FALLBACK_PREPULL_OFFSET_MS;

      // Some logs DO already contain a real Cast event for Army of the Dead
      // (just with an unreliable/clamped timestamp, e.g. WCL clamping
      // prepull actions to a fixed offset). If we blindly prepended our
      // corrected event on top of that, both would get processed - double
      // charging its rune cost and RP gain (this is what caused Death runes
      // to appear on a ~14s delay: the second, phantom cast queued its rune
      // spend behind the first). Strip any existing Cast event for this
      // spell first so there's always exactly one, with our corrected
      // timestamp.
      const eventsWithoutRealCast = events.filter(
        (event) =>
          !(
            event.type === EventType.Cast &&
            HasAbility(event) &&
            event.ability.guid === SPELLS.ARMY_OF_THE_DEAD.id
          ),
      );

      // Sort by timestamp rather than assuming index 0 is chronologically
      // correct. Other DK normalizers (e.g. PrepullBuffCastInference) also
      // fabricate their own prepull Cast events and splice them in - if two
      // normalizers each just prepend to the front independently, whichever
      // one happens to run later "wins" the front slot regardless of which
      // fabricated event actually happened earlier. That corrupted ordering
      // fed straight into MoPRuneTracker's onCast, which walks events in
      // array order and mutates rune regenTime incrementally: processing
      // AoD's (earlier) rune spend AFTER a later-but-array-first prepull
      // cast made the rune tracker think AoD's consumed rune started
      // regenerating later than it really did, causing false "0 runes
      // available" resyncs early in the pull. Sorting here guarantees this
      // event lands at its true chronological position no matter what order
      // normalizers run in or what else they've already spliced in.
      // `: AnyEvent[]` here (not `satisfies` after `.sort()`) so the fabricated
      // object literal is contextually checked against the AnyEvent
      // discriminated union directly - applying `satisfies` only to the
      // `.sort()` result lets TS infer this array in isolation first, which
      // widens `type: EventType.Cast` to the base `EventType` enum and no
      // longer matches any union member.
      const combined: AnyEvent[] = [
        {
          type: EventType.Cast,
          timestamp,
          ability: {
            guid: SPELLS.ARMY_OF_THE_DEAD.id,
            name: SPELLS.ARMY_OF_THE_DEAD.name,
            abilityIcon: SPELLS.ARMY_OF_THE_DEAD.icon,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
          },
          sourceID: this.owner.selectedCombatant.id,
          sourceIsFriendly: true,
          targetID: -1,
          targetIsFriendly: false,
          prepull: true,
          __fabricated: true,
        },
        ...eventsWithoutRealCast,
      ];
      return combined.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      return events;
    }
  }
}
