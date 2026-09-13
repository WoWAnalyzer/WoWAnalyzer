import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Dire Beast has many summon spell IDs, each summoning a different beast (132764, 212382, 304051
 * and 1308188 all show up in 12.1 logs, and hunters in the same fight can use different ones).
 * Every variant is named "Dire Beast", so this rewrites the player's Dire Beast summon and cast
 * events to SPELLS.DIRE_BEAST_SUMMON, letting everything else listen for a single ID.
 *
 * SPELLS.DIRE_BEAST_CAST is left alone, since DireBeastSourceNormalizer relabels it separately.
 */
class DireBeastSummonNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    return events.map((event) => {
      if (
        (event.type !== EventType.Summon && event.type !== EventType.Cast) ||
        event.sourceID !== this.selectedCombatant.id ||
        event.ability.name !== SPELLS.DIRE_BEAST_SUMMON.name ||
        event.ability.guid === SPELLS.DIRE_BEAST_SUMMON.id ||
        event.ability.guid === SPELLS.DIRE_BEAST_CAST.id
      ) {
        return event;
      }
      return {
        ...event,
        ability: {
          ...event.ability,
          guid: SPELLS.DIRE_BEAST_SUMMON.id,
          name: SPELLS.DIRE_BEAST_SUMMON.name,
          abilityIcon: SPELLS.DIRE_BEAST_SUMMON.icon,
        },
        __modified: true,
      };
    });
  }
}

export default DireBeastSummonNormalizer;
