import SPELLS from 'common/SPELLS/classic';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Spells this normalizer checks for. If the player has a real ApplyBuff event
 * for one of these at or before fight start, but no Cast event to go with it,
 * we can infer it must have been cast prepull - a buff can't apply itself.
 * Racials in particular are prone to this: classic logs seem to synthesize a
 * genuine ApplyBuff event for anything already active when logging starts
 * (landing right at fight start, sourced from the player), but never a
 * matching Cast event, since the actual cast happened before logging began.
 *
 * Note this checks the raw event stream, NOT combatantinfo.auras /
 * Combatant.buffs - a real Berserking prepull use showed up as a genuine
 * `applybuff` event at fight start with the player's own sourceID, while
 * `combatantinfo.auras` (and therefore Combatant.buffs, which is seeded from
 * it) had no record of it at all. The aura snapshot and the event stream
 * aren't the same data and can disagree.
 *
 * Lifeblood (Herbalism) is the same story: it's off the GCD and instant, so
 * it's routinely macroed/used a moment before pull with no real Cast event
 * surviving in the log, even though the buff itself is genuinely active.
 */
const INFERRABLE_PREPULL_CASTS = [SPELLS.BERSERKING.id, SPELLS.LIFEBLOOD.id];

export default class PrepullBuffCastInference extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fabricated: AnyEvent[] = [];
    const fightStart = this.owner.fight.start_time;
    const selfId = this.owner.selectedCombatant.id;

    for (const spellId of INFERRABLE_PREPULL_CASTS) {
      const prepullApply = events.find(
        (event) =>
          event.type === EventType.ApplyBuff &&
          HasAbility(event) &&
          event.ability.guid === spellId &&
          'sourceID' in event &&
          event.sourceID === selfId &&
          event.timestamp <= fightStart,
      );
      if (!prepullApply) {
        continue;
      }

      const hasRealPrepullCast = events.some(
        (event) =>
          event.type === EventType.Cast &&
          HasAbility(event) &&
          event.ability.guid === spellId &&
          event.timestamp <= fightStart,
      );
      if (hasRealPrepullCast) {
        continue;
      }

      // Use the real ApplyBuff event's own timestamp - in practice this
      // lands exactly at fight start, but there's no reason to assume that
      // instead of just reading it off the event we already have. Likewise,
      // reuse its ability info (name/icon/school) instead of hardcoding a
      // school here, since different inferred spells can have different ones
      // (Berserking vs. Lifeblood's Nature school, for example).
      const spell = SPELLS[spellId as keyof typeof SPELLS];
      const realAbility = HasAbility(prepullApply) ? prepullApply.ability : undefined;
      fabricated.push({
        type: EventType.Cast,
        timestamp: prepullApply.timestamp,
        ability: {
          guid: spellId,
          name: realAbility?.name ?? spell?.name ?? '',
          abilityIcon: realAbility?.abilityIcon ?? spell?.icon ?? '',
          type: realAbility?.type ?? MAGIC_SCHOOLS.ids.PHYSICAL,
        },
        sourceID: selfId,
        sourceIsFriendly: true,
        targetID: selfId,
        targetIsFriendly: true,
        prepull: true,
        __fabricated: true,
      } satisfies AnyEvent);
    }

    // Sort by timestamp instead of assuming prepending to the front is
    // chronologically correct. ArmyOfTheDead also fabricates its own prepull
    // Cast event (often several seconds earlier than these), and if each
    // normalizer just prepends independently, whichever runs later wins the
    // front slot regardless of which event actually happened first. Since
    // MoPRuneTracker's onCast walks events in array order and mutates rune
    // state incrementally, a misordered array corrupted its regen-time math
    // for the earlier event. Sorting here guarantees correct placement no
    // matter what order normalizers run in.
    return fabricated.length > 0
      ? [...fabricated, ...events].sort((a, b) => a.timestamp - b.timestamp)
      : events;
  }
}
