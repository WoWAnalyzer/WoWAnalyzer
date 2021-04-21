import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.ARCANE_POWER.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.ARCANE_POWER.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the apply buff event for Arcane Power is sorted after the Arcane Power cast.
 */
class ArcanePowerNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default ArcanePowerNormalizer;
