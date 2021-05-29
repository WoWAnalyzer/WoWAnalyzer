import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

// max buffer that cast can be before apply to connect them
const CAST_TO_APPLY_BUFFER_MS = 100;
// max buffer that apply can be before heal to connect them
const APPLY_TO_HEAL_BUFFER_MS = 0;

const EVENT_ORDERS: EventOrder[] = [
  // Cast -> Apply reorders
  {
    beforeEventId: SPELLS.REJUVENATION.id,
    beforeEventType: EventType.Cast,
    afterEventId: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.REGROWTH.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.REGROWTH.id,
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.WILD_GROWTH.id,
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: CAST_TO_APPLY_BUFFER_MS,
    anyTarget: true,
  },
  {
    beforeEventId: SPELLS.LIFEBLOOM_HOT_HEAL.id,
    beforeEventType: EventType.Cast,
    afterEventId: [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id],
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: CAST_TO_APPLY_BUFFER_MS,
  },
  // Apply -> Heal reorders - only occur for instant ticking hots
  {
    beforeEventId: SPELLS.REJUVENATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION.id,
    afterEventType: EventType.Heal,
    bufferMs: APPLY_TO_HEAL_BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.REJUVENATION_GERMINATION.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.REJUVENATION_GERMINATION.id,
    afterEventType: EventType.Heal,
    bufferMs: APPLY_TO_HEAL_BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.WILD_GROWTH.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.WILD_GROWTH.id,
    afterEventType: EventType.Heal,
    bufferMs: APPLY_TO_HEAL_BUFFER_MS,
  },
];

/**
 * When a HoT is cast on a target, the ordering of the ensuing Cast, ApplyBuff, and Heal events
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer enforces the order Cast -> Apply -> Heal
 * for Rejuvenation, Regrowth, Wild Growth, and Lifebloom.
 */
class HotApplicationNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default HotApplicationNormalizer;
