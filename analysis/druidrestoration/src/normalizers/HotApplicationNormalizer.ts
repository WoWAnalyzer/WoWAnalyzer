import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

// so far I haven't seen any delay, so leaving this at zero so timestamp ordering is preserved,
// and to avoid false positives if HoT falls and then quickly refreshed
const MAX_DELAY = 0;

// This ordering issue only happens for the HoTs that tick instantly upon application
const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.REJUVENATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.REJUVENATION_GERMINATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION_GERMINATION.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.REGROWTH.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REGROWTH.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.WILD_GROWTH.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
];

/**
 * Occasionally HoT heal has same timestamp but happens before the applybuff event, which causes issues when attempting to attribute the heal.'
 * This normalizes the heal to always be after the applybuff
 */
class HotApplicationNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default HotApplicationNormalizer;
