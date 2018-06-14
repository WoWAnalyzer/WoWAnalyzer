import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'Parser/Core/EventsNormalizer';

const CAST_WINDOW = 100;
class RakeBleed extends EventsNormalizer {
  /**
   * When used from stealth SPELLS.RAKE cast event often appears after the SPELLS.RAKE_BLEED
   * applydebuff event that it causes. (Possibly this misordering has something to do with Rake
   * from stealth also attempting to apply a stun debuff.)
   * This normalizes events so the applydebuff always comes after cast.
   * @param {Array} events
   * @returns {Array} Events possibly with some reordered.
   */
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
    fixedEvents.push(event);

    // find a cast event for rake
    if(event.type === 'cast' && event.ability.guid === SPELLS.RAKE.id) {
      const castTimestamp = event.timestamp;

      // look for any recent applydebuff or refreshdebuff of RAKE_BLEED
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if ((castTimestamp - previousEvent.timestamp) > CAST_WINDOW) {
          break;
        }
        if ((previousEvent.type === 'applydebuff' || previousEvent.type === 'refreshdebuff') &&
        previousEvent.ability.guid === SPELLS.RAKE_BLEED.id &&
        previousEvent.sourceID === event.sourceID) {
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

export default RakeBleed;
