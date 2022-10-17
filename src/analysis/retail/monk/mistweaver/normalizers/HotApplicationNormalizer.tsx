import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.RENEWING_MIST_HEAL.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.RENEWING_MIST_HEAL.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.ESSENCE_FONT_BUFF.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.ESSENCE_FONT_BUFF.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.ENVELOPING_BREATH_HEAL.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 100,
    anyTarget: true,
  },
];

/**
 * Occasionally HoT heal has same timestamp but happens before the applybuff event, which causes issues when attempting to attribute the heal.
 * This normalizes the heal to always be after the applybuff
 */
class HotApplicationNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default HotApplicationNormalizer;
