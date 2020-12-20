import EventsNormalizer from 'parser/core/EventsNormalizer';

import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';

const BUFFS_TO_MOVE: number[] = [
  SPELLS.ATONEMENT_BUFF.id,
];
const MAX_TIME_SINCE_CAST = 250; // ms

/**
 Because of latency, after casting Power Word: Radiance, the atonement applications
 don't always register right away and an instant cast spell can be recorded before
 the atonements. Example: Evangelism casted right after a Power Word Radiance will
 be before the applications of the atonements. For this reason we reorder the
 events so that the applications are always right after the cast.
 */
class PowerWordRadianceNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    let lastRadianceTimestamp = 0;
    let lastRadianceIndex = 0;

    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast) {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.POWER_WORD_RADIANCE.id) {
          lastRadianceTimestamp = event.timestamp;
          lastRadianceIndex = eventIndex;
        }
      }

      if (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff || event.type === EventType.ApplyBuffStack) {
        const spellId = event.ability.guid;
        if ((event.timestamp - lastRadianceTimestamp) < MAX_TIME_SINCE_CAST && BUFFS_TO_MOVE.includes(spellId)) {
          event.timestamp = lastRadianceTimestamp;
          event.__modified = true;
          fixedEvents.splice(lastRadianceIndex + 1, 0, event);
          fixedEvents.splice(-1, 1);
        }
      }
    });

    return fixedEvents;
  }
}

export default PowerWordRadianceNormalizer;
