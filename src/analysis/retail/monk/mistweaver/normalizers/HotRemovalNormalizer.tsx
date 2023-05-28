import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.RENEWING_MIST_HEAL.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.RENEWING_MIST_HEAL.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.ESSENCE_FONT_BUFF.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.ESSENCE_FONT_BUFF.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.ESSENCE_FONT_BUFF.id,
    beforeEventType: [EventType.RefreshBuff, EventType.ApplyBuff],
    afterEventId: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
    afterEventType: EventType.EndChannel,
    bufferMs: 200,
  },
];

/**
 * Occasionally HoT heal has same timestamp but happens after the removebuff event, which causes issues when attempting to attribute the heal.
 * This normalizes the heal to always be before the removebuff
 */
class HotRemovalNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default HotRemovalNormalizer;
