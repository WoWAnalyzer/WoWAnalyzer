import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS_EVOKER.REVERSION_TALENT.id,
    beforeEventType: EventType.Heal,
    afterEventId: TALENTS_EVOKER.REVERSION_TALENT.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.REVERSION_ECHO.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.REVERSION_ECHO.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.DREAM_BREATH.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.DREAM_BREATH.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
  },
  {
    beforeEventId: SPELLS.DREAM_BREATH_ECHO.id,
    beforeEventType: EventType.Heal,
    afterEventId: SPELLS.DREAM_BREATH_ECHO.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
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
