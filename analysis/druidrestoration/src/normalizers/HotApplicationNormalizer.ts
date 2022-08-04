import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const BUFFER_MS = 20;

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
    anyTarget: true,
    bufferMs: BUFFER_MS,
  },
  {
    beforeEventId: [SPELLS.WILD_GROWTH.id, SPELLS.REGROWTH.id],
    beforeEventType: EventType.ApplyBuff,
    afterEventId: [SPELLS.CONVOKE_SPIRITS.id, SPELLS.FLOURISH_TALENT.id],
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff], // Convoke and Flourish are handled on buff application
    anyTarget: true,
    bufferMs: BUFFER_MS,
  },
  {
    beforeEventId: [SPELLS.WILD_GROWTH.id, SPELLS.REGROWTH.id],
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.TRANQUILITY_CAST.id,
    afterEventType: EventType.Cast,
    anyTarget: true,
    bufferMs: BUFFER_MS,
  },
  {
    beforeEventId: SPELLS.TRANQUILITY_CAST.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.TRANQUILITY_HEAL.id,
    afterEventType: EventType.Heal,
    anyTarget: true,
    bufferMs: BUFFER_MS,
  },
];

/**
 * When a HoT is cast on a target, sometimes the instant tick heal event comes before the applybuff,
 * even though the tick benefits from mastery as though the buff is there.
 *
 * In addition, when hot applicators with cast times are chained with an instant modifier
 * (most notably Flourish, but we'll also do Convoke and Tranq to catch other cases),
 * the applybuff can come after the Flourish even though it is actually getting extended by the
 * Flourish. We fix this also.
 *
 * This ensures the applybuff always comes first in order to simplify analysis.
 */
class HotApplicationNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default HotApplicationNormalizer;
