import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

/*
 * Some on use items (e.g. trinkets) provide a buff when used but do not trigger a cast event, making it more annoying to check for automatically using e.g. usage suggestions.
 * This normalizer adds cast events at the same timestamp as the applybuff event occured
 */
class MissingCasts extends EventsNormalizer {
  /*
   * List of buffs that do not have an associated cast event
   */
  static missingCastBuffs = [
    SPELLS.IGNITION_MAGES_FUSE_BUFF.id,
  ];

  normalize(events) {
    const missingCastEvents = events
    .filter(event => event.type === EventType.ApplyBuff && this.constructor.missingCastBuffs.includes(event.ability.guid))
    .map(this.constructor._fabricateCastEvent);
    missingCastEvents.forEach(event => {
      const index = events.findIndex(e => e.timestamp >= event.timestamp);
      events.splice(index, 0, event); //sort into event list just before cast event
    });
    return events;
  }

  static _fabricateCastEvent(event) {
    return {
      type: EventType.Cast,
      ability: event.ability,
      sourceID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetID: event.targetID,
      targetIsFriendly: event.targetIsFriendly,
      timestamp: event.timestamp,

      // Custom properties:
      __fabricated: true,
    };
  }
}

export default MissingCasts;
