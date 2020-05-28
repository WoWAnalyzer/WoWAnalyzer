import SPELLS from 'common/SPELLS/index';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

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
   * @returns {Array} Events possibly with some rake debuff events reordered and their timestamp altered.
   */
  normalize(events) {
    const fixedEvents = [];
    for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
      const castEvent = events[eventIndex];
      fixedEvents.push(castEvent);

      if (castEvent.type !== EventType.Cast || castEvent.ability.guid !== SPELLS.RAKE.id) {
        continue;
      }

      // look for matching recent applydebuff or refreshdebuff of RAKE_BLEED
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if ((castEvent.timestamp - previousEvent.timestamp) > CAST_WINDOW) {
          // looked far enough back that we're outside the cast's time window, so give up
          break;
        }
        if ((previousEvent.type === EventType.ApplyDebuff || previousEvent.type === EventType.RefreshDebuff) &&
            previousEvent.ability.guid === SPELLS.RAKE_BLEED.id &&
            previousEvent.targetID === castEvent.targetID &&
            previousEvent.targetInstance === castEvent.targetInstance &&
            previousEvent.sourceID === castEvent.sourceID) {
          // the "wrong" version of this event has already been added to fixedEvents, so remove it and place in new position
          fixedEvents.splice(previousEventIndex, 1);
          fixedEvents.push(previousEvent);

          // adjust timestamp so the altered event stream doesn't appear to go backwards
          previousEvent.timestamp = castEvent.timestamp;
          previousEvent.__modified = true;
          break;
        }
      }
    }

    /*
    events.forEach((event, eventIndex) => {
    fixedEvents.push(event);

    // find a cast event for rake
    if(event.type === EventType.Cast && event.ability.guid === SPELLS.RAKE.id) {
      const castTimestamp = event.timestamp;

      // look for matching recent applydebuff or refreshdebuff of RAKE_BLEED
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if ((castTimestamp - previousEvent.timestamp) > CAST_WINDOW) {
          break;
        }
        if ((previousEvent.type === EventType.ApplyDebuff || previousEvent.type === EventType.RefreshDebuff) &&
            previousEvent.ability.guid === SPELLS.RAKE_BLEED.id &&
            previousEvent.targetID === event.targetID &&
            previousEvent.targetInstance === event.targetInstance &&
            previousEvent.sourceID === event.sourceID) {
          fixedEvents.splice(previousEventIndex, 1);
          fixedEvents.push(previousEvent);
          // adjust timestamp so the event stream doesn't have
          previousEvent.timestamp = castTimestamp;
          previousEvent.__modified = true;
          break;
        }
      }
    }
    */

    return fixedEvents;
  }
}

export default RakeBleed;
