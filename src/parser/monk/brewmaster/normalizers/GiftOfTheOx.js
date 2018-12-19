import EventsNormalizer from 'parser/core/EventsNormalizer';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

/**
 * Gift of the Ox orbs show up as 'casts' which messes with other things
 * that expect casts to be *actual abilities.*
 */
class GiftOfTheOx extends EventsNormalizer {
  normalize(events) {
    return events.map(event => {
      if(event.type === 'cast' && GIFT_OF_THE_OX_SPELL_IDS.includes(event.ability.guid)) {
        event.type = 'tick';
        event.__modified = true;
      }
      return event;
    });
  }
}

export default GiftOfTheOx;
