import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';

/**
 * During analysis there's no way to know at a `begincast` event if it will end up being canceled. This marks all `begincast` events by the player with an `isCancelled` property whether it was cancelled.
 */
class MissingCasts extends EventsNormalizer {
  /*
   * List of buffs that do not have an associated cast event
   */
  static missingCastBuffs = [
    SPELLS.IGNITION_MAGES_FUSE_BUFF.id,
  ];

  normalize(events) {
    const missingCastEvents = events.filter(event => event.type === 'applybuff' && this.constructor.missingCastBuffs.includes(event.ability.guid));
    missingCastEvents.forEach(event => {
      const index = events.findIndex(e => e.timestamp >= event.timestamp);
      events.splice(index, 0, this.constructor._fabricateCastEvent(event)); //sort into event list just before cast event
    });
    return events;
  }

  static _fabricateCastEvent(event) {
    return {
      type: 'cast',
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
