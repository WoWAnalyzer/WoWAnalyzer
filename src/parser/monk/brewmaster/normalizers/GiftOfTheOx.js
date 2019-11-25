import EventsNormalizer from 'parser/core/EventsNormalizer';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

export const GOTOX_GENERATED_EVENT = 'orb-generated';

/**
 * Gift of the Ox orbs show up as 'casts' which messes with other things
 * that expect casts to be *actual abilities.*
 *
 * because we only have events related to one player, we don't need to
 * filter by SELECTED_PLAYER in other modules
 */
class GiftOfTheOx extends EventsNormalizer {
  normalize(events) {
    return events.map(event => {
      if(event.type === 'cast' && GIFT_OF_THE_OX_SPELL_IDS.includes(event.ability.guid)) {
        event.type = GOTOX_GENERATED_EVENT;
        event.__modified = true;
      }
      return event;
    });
  }
}

export default GiftOfTheOx;
