import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.FLAMESTRIKE.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.HOT_STREAK.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures the hot-streak flamestrike cast comes before the hot-streak removal
 */
class Flamestrike extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default Flamestrike;
