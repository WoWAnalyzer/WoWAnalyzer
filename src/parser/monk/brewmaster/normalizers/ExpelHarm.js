import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { GIFT_OF_THE_OX_SPELL_IDS } from '../constants';

function isGotOxHeal(event) {
  return event.type === 'heal' && GIFT_OF_THE_OX_SPELL_IDS.includes(event.ability.guid);
}

function isCFHeal(event) {
  return event.type === 'heal' && event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id;
}

const BUFFER_WINDOW = 50; // don't allow any larger gaps than this

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
      //
      // Celestial Fortune heals can occur between orb heals.
      let i = idx;
      while(events[i-1].timestamp > event.timestamp - BUFFER_WINDOW && (isGotOxHeal(events[i-1]) || isCFHeal(events[i-1]))) {
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
