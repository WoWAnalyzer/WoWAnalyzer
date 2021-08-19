import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const BUFFER_MS = 0;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.REJUVENATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION.id,
    afterEventType: EventType.Heal,
    bufferMs: BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.REJUVENATION_GERMINATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION_GERMINATION.id,
    afterEventType: EventType.Heal,
    bufferMs: BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.WILD_GROWTH.id,
    afterEventType: EventType.Heal,
    bufferMs: BUFFER_MS,
  },
];

/**
 * When a HoT is cast on a target, sometimes the instant tick heal event comes before the applybuff,
 * which can make analysis difficult.
 *
 * This ensures the applybuff always comes first..
 */
class HotApplicationNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default HotApplicationNormalizer;
