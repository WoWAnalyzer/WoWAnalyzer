import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

// so far I haven't seen any delay, so leaving this at zero so timestamp ordering is preserved,
// and to avoid false positives if HoT falls and then quickly refreshed
const MAX_DELAY = 50;

// Occasionally HoT heal has same timestamp but happens before the applybuff event, which causes issues when attempting to attribute the heal.
// This normalizes the heal to always be after the applybuff
class HotApplicationNormalizer extends EventsNormalizer {

  // This ordering issue only happens for the HoTs that tick instantly upon application
  instantTickHotIds = [
    SPELLS.RENEWING_MIST_HEAL.id,
    SPELLS.ESSENCE_FONT_BUFF.id,
  ];

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'applybuff' && this.instantTickHotIds.includes(event.ability.guid)) {
        const spellId = event.ability.guid;
        const castTimestamp = event.timestamp;
        if (!event.targetID) {
          return;
        }

        // Loop through the event history in reverse to detect if there was a heal from same spell on same target
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MAX_DELAY) {
            break;
          }
          if (previousEvent.type === 'heal' && previousEvent.ability.guid === spellId && previousEvent.targetID === event.targetID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break;
          }
        }
      }
    });

    return fixedEvents;
  }

}
export default HotApplicationNormalizer;
