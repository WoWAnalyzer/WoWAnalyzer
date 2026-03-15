import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.HOT_STREAK.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.HEATING_UP.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * In order to easily track whether Heating Up was converted into Hot Streak, this ensures Hot Streak is applied just before Heating Up is removed
 */
class HeatingUp extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default HeatingUp;
