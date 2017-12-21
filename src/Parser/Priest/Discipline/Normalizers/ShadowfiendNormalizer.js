import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

class ShadowfiendNormalizer extends EventsNormalizer {

  normalize(events) {
    events.forEach((event, eventIndex) => {
      if (event.type === "cast") {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id || spellId === SPELLS.LIGHTSPAWN.id) {
          event.ability.guid = SPELLS.SHADOWFIEND.id;
        }
      }
    });
    return events;
  }
}

export default ShadowfiendNormalizer;
