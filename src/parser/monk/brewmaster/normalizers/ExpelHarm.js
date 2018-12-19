import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

function isGotOxHeal(event) {
  return event.type === 'heal' && GIFT_OF_THE_OX_SPELL_IDS.includes(event.ability.guid);
}

/**
 * Expel Harm comes after all the orbs are consumed, and honestly its a
 * huge pain in the ass. This normalizer puts it first instead.
 */
export default class ExpelHarm extends EventsNormalizer {
  normalize(events) {
    // forEach is supposed to be safe for mutation
    //
    // inb4 this introduces tons of bugs
    events.forEach((event, idx) => {
      if(event.type !== 'cast' || event.ability.guid !== SPELLS.EXPEL_HARM.id) {
        return;
      }

      // quick check that EH is after ALL orbs
      if(events[idx+1].timestamp === event.timestamp && isGotOxHeal(events[idx+1])) {
        console.error('gotox orb after eh');
      }
      // find the start of run of orbs consumed
      // safe --- game won't let you cast EH with 0 orbs
      let i = idx;
      while(events[i-1].timestamp === event.timestamp) {
        i -= 1;
      }
      const target = i;
      // move everything down
      for(i = idx; i > target; i--) {
        events[i] = events[i-1];
      }
      // put EH at the start
      events[target] = event;
    });
    return events;
  }
}
