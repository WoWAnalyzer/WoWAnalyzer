import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.LIFEBIND_BUFF.id,
    beforeEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    afterEventId: SPELLS.LIFEBIND_HEAL.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.VERDANT_EMBRACE_HEAL.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.LIFEBIND_BUFF.id,
    afterEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    bufferMs: MAX_DELAY,
  },
];

/**
 * Occasionally HoT heal has same timestamp but happens before the applybuff event, which causes issues when attempting to attribute the heal.
 * This normalizes the heal to always be after the applybuff
 */
class LifebindNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default LifebindNormalizer;
