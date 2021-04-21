import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.HOT_STREAK.id,
    beforeEventType: EventType.RemoveBuff,
    afterEventId: SPELLS.SCORCH.id,
    afterEventType: EventType.Damage,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Because Scorch has no travel time, ensures that the Scorch Damage event happens after Hot Streak is removed so the Scorch doesnt count as a direct damage crit during Hot Streak
 */
class Scorch extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default Scorch;
