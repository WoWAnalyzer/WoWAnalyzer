import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.CLEARCASTING_ARCANE.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.ARCANE_BARRAGE.id,
    afterEventType: EventType.Cast,
    bufferMs: 25,
    anyTarget: true,
  },
  {
    beforeEventId: SPELLS.CLEARCASTING_ARCANE.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.PRISMATIC_BOLT.id,
    afterEventType: EventType.Cast,
    bufferMs: 25,
    anyTarget: true,
  },
];

/**
 * Ensures that the Clearcasting Apply happens before the barrage or prismatic bolt cast if they both happened at the same time.
 */
class ClearcastingNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default ClearcastingNormalizer;
