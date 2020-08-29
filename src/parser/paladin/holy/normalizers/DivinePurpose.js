import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

// the max delay between the heal and cast events never looks to be more than this.
const MAX_DELAY = 100;

/**
 * Fixes buff application and removal ordering of Divine Purpose.
 */
class DivinePurpose extends EventsNormalizer {
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type !== EventType.Cast) {
        return;
      }
      const spellId = event.ability.guid;
      if (spellId !== SPELLS.HOLY_SHOCK_CAST.id && spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
        return;
      }

      const castTimestamp = event.timestamp;

      const buffId =
        spellId === SPELLS.HOLY_SHOCK_CAST.id
          ? SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id
          : SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id;

      /**
       * Fix 1: Divine Purpose procs sometimes are logged before the cast that trigger it. This makes dealing with it harder, so reorder it.
       *
       * Loop through the event history in reverse to detect if there was a `applybuff` event on the same player that was the result of this cast and thus misordered
       */
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if (castTimestamp - previousEvent.timestamp > MAX_DELAY) {
          break;
        }
        if (
          previousEvent.type === EventType.ApplyBuff &&
          previousEvent.ability.guid === buffId &&
          previousEvent.sourceID === event.sourceID
        ) {
          // Remove the applybuff
          fixedEvents.splice(previousEventIndex, 1);
          // Insert it after the cast
          fixedEvents.splice(eventIndex, 0, previousEvent);
          // By moving the applybuff after the cast, we shifted the current event one index up. We need to update `eventIndex` in case the second fix also finds something to fix. Doing this ensures the `removebuff` event occurs before the next proc's `applybuff` event, as desired.
          eventIndex -= 1;
          previousEvent.__modified = true;
          break;
        }
      }

      /**
       * Fix 2: Divine Purpose procs are sometimes removed before the cast that consumes it. This makes dealing with it harder, so reorder it.
       *
       * Loop through the event history in reverse to detect if there was a `removebuff` event on the same player that was the result of this cast and thus misordered
       */
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if (castTimestamp - previousEvent.timestamp > MAX_DELAY) {
          break;
        }
        if (
          previousEvent.type === EventType.RemoveBuff &&
          previousEvent.ability.guid === buffId &&
          previousEvent.sourceID === event.sourceID
        ) {
          fixedEvents.splice(previousEventIndex, 1);
          fixedEvents.splice(eventIndex, 0, previousEvent);
          previousEvent.__modified = true;
          break;
        }
      }
    });

    return fixedEvents;
  }
}

export default DivinePurpose;
