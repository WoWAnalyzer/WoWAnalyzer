import EventsNormalizer from 'parser/core/EventsNormalizer';

import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

class ShadowfiendNormalizer extends EventsNormalizer {

  normalize(events) {
    events.forEach((event, eventIndex) => {
      if (event.type === EventType.Cast) {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id || spellId === SPELLS.LIGHTSPAWN.id || spellId === SPELLS.VOIDLING.id) {
          event.ability.oldGuid = event.ability.guid;
          event.ability.guid = SPELLS.SHADOWFIEND.id;
          event.__modified = true;
        }
      }
    });
    return events;
  }
}

export default ShadowfiendNormalizer;
