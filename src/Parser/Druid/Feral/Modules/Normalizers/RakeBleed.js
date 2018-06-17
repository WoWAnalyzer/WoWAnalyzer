import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'Parser/Core/EventsNormalizer';

const CAST_WINDOW = 100;
class RakeBleed extends EventsNormalizer {
  /**
   * When used from stealth SPELLS.RAKE cast event often appears after the SPELLS.RAKE_BLEED
   * applydebuff event that it causes. (Possibly this misordering has something to do with Rake
   * from stealth also attempting to apply a stun debuff.)
   * This normalizes events so the bleed applydebuff always comes after cast.
   * 
   * Example log: https://www.warcraftlogs.com/reports/bt2x7pkqJ6XBjPam#fight=last
   * Player Anatta at times: 0:00.900, 0:33.296, 3:35.127
   * 
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

      // look for matching recent applydebuff or refreshdebuff of RAKE_BLEED
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if ((castTimestamp - previousEvent.timestamp) > CAST_WINDOW) {
          break;
        }
        if ((previousEvent.type === 'applydebuff' || previousEvent.type === 'refreshdebuff') &&
            previousEvent.ability.guid === SPELLS.RAKE_BLEED.id &&
            previousEvent.targetID === event.targetID &&
            previousEvent.targetInstance === event.targetInstance &&
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
