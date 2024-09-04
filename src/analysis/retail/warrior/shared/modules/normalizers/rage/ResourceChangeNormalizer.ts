import { AnyEvent, ResourceActor } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { RAGE_SCALE_FACTOR } from './constants';

/**
 * All rage values are scaled by {@link RAGE_SCALE_FACTOR}, _except_
 * "resourceChange" and "waste".
 *
 * This normalizer scales those to match all other rage values. This is
 * primarily so following normalizers can assume all rage values are scaled.
 */
export default class ResourceChangeNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    return events.map((event) => {
      if (
        'resourceChange' in event &&
        'waste' in event &&
        ((event.resourceActor === ResourceActor.Source &&
          event.sourceID === this.selectedCombatant.id) ||
          (event.resourceActor === ResourceActor.Target &&
            event.targetID === this.selectedCombatant.id))
      ) {
        return {
          ...event,
          __modified: true,
          resourceChange: event.resourceChange / RAGE_SCALE_FACTOR,
          waste: event.waste / RAGE_SCALE_FACTOR,
        };
      } else {
        return event;
      }
    });
  }
}
