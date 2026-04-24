import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Normalises all Dire Beast summon events to a single canonical spell ID
 * (DIRE_BEAST_SUMMON, 204526) by matching on ability name.
 *
 * Dark Ranger and Pack Leader hero talents summon Dire Beasts via different
 * spell IDs. Rewriting them here means downstream modules only need to
 * filter on one ID.
 */
class DireBeastSummonNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    return events.map((event) => {
      if (
        event.type !== EventType.Summon ||
        event.ability.guid === SPELLS.DIRE_BEAST_SUMMON.id ||
        event.ability.name !== 'Dire Beast'
      ) {
        return event;
      }
      return {
        ...event,
        ability: { ...event.ability, guid: SPELLS.DIRE_BEAST_SUMMON.id },
        __modified: true,
      };
    });
  }
}

export default DireBeastSummonNormalizer;
