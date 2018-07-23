import EventsNormalizer from 'Parser/Core/EventsNormalizer';
import { GIFT_OF_THE_OX_SPELLS } from '../../Constants';

/**
 * Gift of the Ox orbs show up as 'casts' which messes with other things
 * that expect casts to be *actual abilities.*
 */
class GiftOfTheOx extends EventsNormalizer {
  normalize(events) {
    return events.map(event => {
      if(event.type === 'cast' && GIFT_OF_THE_OX_SPELLS.includes(event.ability.guid)) {
        event.type = 'tick';
        event.__modified = true;
      }
      return event;
    });
  }
}

export default GiftOfTheOx;
