import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.COMBUSTION.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.COMBUSTION.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the apply buff event for Combustion is sorted after the Combustion cast.
 */
class Combustion extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default Combustion;
