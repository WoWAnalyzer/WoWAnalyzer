import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, ApplyBuffEvent, CastEvent, EventType } from 'parser/core/Events';

/*
 * Some on use items (e.g. trinkets) provide a buff when used but do not trigger a cast event, making it more annoying to check for automatically using e.g. usage suggestions.
 * This normalizer adds cast events at the same timestamp as the applybuff event occured
 */
class MissingCasts extends EventsNormalizer {
  /*
   * List of buffs that do not have an associated cast event
   */
  static missingCastBuffs: number[] = [];

  normalize(events: AnyEvent[]) {
    // Just in case someone chooses to extend this module to modify missingCastBuffs instead of adding to it here...
    const ctor = this.constructor as typeof MissingCasts;
    const missingCastEvents = events
      .filter((event): event is ApplyBuffEvent => event.type === EventType.ApplyBuff && ctor.missingCastBuffs.includes(event.ability.guid))
      .map(event => ctor._fabricateCastEvent(event));
    missingCastEvents.forEach(event => {
      const index = events.findIndex(e => e.timestamp >= event.timestamp);
      events.splice(index, 0, event); //sort into event list just before cast event
    });
    return events;
  }

  static _fabricateCastEvent(event: ApplyBuffEvent): CastEvent {
    if (event.sourceID === undefined) {
      throw new Error('applybuff event defined in MissingCasts does not contain a sourceID for the fabricated event');
    }
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
