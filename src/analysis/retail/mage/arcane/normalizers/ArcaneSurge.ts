import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS.ARCANE_SURGE_TALENT.id,
    beforeEventType: EventType.Cast,
    afterEventId: TALENTS.ARCANE_SURGE_TALENT.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the apply buff event for Arcane Surge is sorted after the Arcane Surge cast.
 */
class ArcaneSurgeNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default ArcaneSurgeNormalizer;
