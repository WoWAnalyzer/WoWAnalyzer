import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

const MAX_DELAY = 50;

// Occasionally when Power of the Archdruid is consumed, one of the applybuff events happens BEFORE the cast event
// this normalizes it so all the applybuff events happen after the cast event
class PotaNormalizer extends EventsNormalizer {

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && (event.ability.guid === SPELLS.REJUVENATION.id || event.ability.guid === SPELLS.REGROWTH.id)) {
        const spellIds = [event.ability.guid];
        if (event.ability.guid === SPELLS.REJUVENATION.id) {
          spellIds.push(SPELLS.REJUVENATION_GERMINATION.id); // a rejuv cast can produce a rejuv or germ buff
        }

        const castTimestamp = event.timestamp;
        if (!event.targetID) {
          return;
        }

        // Loop through the event history in reverse to detect if there was both a PotA consumption and a matching buff application within the threshold time
        let prevApplicationIndex = null;
        let prevApplication = null;
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MAX_DELAY) {
            break;
          } else if ((previousEvent.type === 'applybuff' || previousEvent.type === 'refreshbuff') && spellIds.includes(previousEvent.ability.guid)) {
            prevApplicationIndex = previousEventIndex;
            prevApplication = previousEvent;
          } else if (previousEvent.type === 'removebuff' && previousEvent.ability.guid === SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id) {
            if (prevApplicationIndex) {
              fixedEvents.splice(prevApplicationIndex, 1);
              fixedEvents.push(prevApplication);
              prevApplication.__modified = true;
              console.warn(`Reordered event @${this.owner.formatTimestamp(event.timestamp)}:`, previousEvent);
            }
            break;
          }
        }
      }
    });

    return fixedEvents;
  }

}
export default PotaNormalizer;
