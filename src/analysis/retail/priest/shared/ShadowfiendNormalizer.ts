import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { TALENTS_PRIEST } from 'common/TALENTS';

class ShadowfiendNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    events.forEach((event, eventIndex) => {
      if (event.type === EventType.Cast) {
        const spellId = event.ability.guid;
        if (
          spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id ||
          spellId === SPELLS.LIGHTSPAWN.id ||
          spellId === SPELLS.VOIDLING.id
        ) {
          event.ability.guid = TALENTS_PRIEST.SHADOWFIEND_TALENT.id;
          event.__modified = true;
        }
      }
    });
    return events;
  }
}

export default ShadowfiendNormalizer;
