import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import { AnyEvent } from 'parser/core/Events';

/**
 * All rage values are scaled by {@link RAGE_SCALE_FACTOR}, _except_
 * "resourceChange" and "waste".
 *
 * This function scales those to match all other rage values.
 */
export default function scaleRageGainEvents(events: AnyEvent[]): AnyEvent[] {
  return events.map((event) => {
    if (!('resourceChange' in event) || !('waste' in event)) {
      return event;
    }

    return {
      ...event,
      __modified: true,
      resourceChange: event.resourceChange / RAGE_SCALE_FACTOR,
      waste: event.waste / RAGE_SCALE_FACTOR,
    };
  });
}
