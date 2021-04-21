import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.OVERPOWER.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.OVERPOWER.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
  },
  {
    beforeEventId: SPELLS.OVERPOWER.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.OVERPOWER.id,
    afterEventType: EventType.ApplyBuffStack,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the apply buff event for Overpower is sorted after the Overpower.
 */
class OverpowerNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default OverpowerNormalizer;
