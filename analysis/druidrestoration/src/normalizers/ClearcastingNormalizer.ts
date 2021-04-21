import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.REGROWTH.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.CLEARCASTING_BUFF,
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

// Clearcasting buff fades before the regrowth cast event that consumed it shows up.
// This swaps the order so the buff always fades AFTER the regrowth cast event.
class ClearcastingNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default ClearcastingNormalizer;
