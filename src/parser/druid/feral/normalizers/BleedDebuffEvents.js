import SPELLS from 'common/SPELLS/index';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

const CAST_WINDOW = 300;
const CAST_DEBUFF_PAIRS = [
  {
    cast: SPELLS.RIP,
    debuff: SPELLS.RIP,
  },
  {
    cast: SPELLS.RAKE,
    debuff: SPELLS.RAKE_BLEED,
  },
  {
    cast: SPELLS.MOONFIRE_FERAL,
    debuff: SPELLS.MOONFIRE_BEAR,
  },
  {
    cast: SPELLS.THRASH_FERAL,
    debuff: SPELLS.THRASH_FERAL,
    multipleDebuffs: true,
  },
  {
    cast: SPELLS.PRIMAL_WRATH_TALENT,
    debuff: SPELLS.RIP,
    multipleDebuffs: true,
  },
];

class BleedDebuffEvents extends EventsNormalizer {
  /**
   * When analyzing the effect of a cast event it's often necessary to know about what debuff application that cast
   * caused. Typically this is handled by listening for both the cast and applydebuff or refreshdebuff
   * events, and combining the information from them to form an analysis. That delays full analysis of a cast event
   * until after the associated debuff event has been processed.
   * Normally this isn't a problem but if another module relies on the result of that cast event analysis it will
   * also have to wait for future events before it can trust the result from the module it relies on. This can lead
   * to some messy coupling between modules.
   *
   * This normalizer attempts to link specified cast events with appropriate debuff apply/refresh events. This way
   * a module that needs to know about the debuff event caused by a cast event can directly access that event through
   * the cast event. It's important that the module design is aware that when doing so the debuff event will have not
   * yet been processed by anything else. e.g. an entity.hasDebuff query will not yet see the debuff.
   *
   * @param {Array} events
   * @returns {Array} Events with some cast events having gained a .debuffEvents property, which is an array of applydebuff and/or refreshdebuff events.
   */
  normalize(events) {
    const fixedEvents = [];
    for (let castEventIndex = 0; castEventIndex < events.length; castEventIndex += 1) {
      const castEvent = events[castEventIndex];
      fixedEvents.push(castEvent);
      if (castEvent.type !== EventType.Cast) {
        continue;
      }
      const pair = CAST_DEBUFF_PAIRS.find(item => item.cast.id === castEvent.ability.guid);
      if (!pair) {
        continue;
      }
      castEvent.__modified = true;
      castEvent.debuffEvents = [];
      // found a suitable cast event so now look forward for debuff events
      // note: debuff events usually appear after associated cast events - make sure this normalizer runs after any that enforce that.
      for (let debuffEventIndex = castEventIndex; debuffEventIndex < events.length; debuffEventIndex += 1) {
        const debuffEvent = events[debuffEventIndex];
        if (debuffEvent.timestamp > castEvent.timestamp + CAST_WINDOW) {
          // if this event is past the time limit then can assume any future events will also be past the time limit, so stop looking.
          break;
        }
        if (debuffEvent.type !== EventType.ApplyDebuff && debuffEvent.type !== EventType.RefreshDebuff) {
          continue;
        }
        if (debuffEvent.ability.guid !== pair.debuff.id) {
          continue;
        }
        castEvent.debuffEvents.push(debuffEvent);
        if (!pair.multipleDebuffs) {
          // the cast is only expected to produce one debuff event, so stop searching for more
          break;
        }
      }
    }
    return fixedEvents;
  }
}

export default BleedDebuffEvents;
