import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS_EVOKER.REVERSION_TALENT.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.GOLDEN_HOUR_HEAL.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.REVERSION_ECHO.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.GOLDEN_HOUR_HEAL.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.DREAM_BREATH.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.DREAM_BREATH.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.DREAM_BREATH_ECHO.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.DREAM_BREATH_ECHO.id,
    afterEventType: EventType.Heal,
    bufferMs: MAX_DELAY,
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
