import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 500;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.FISTS_OF_FURY_DAMAGE.id,
    beforeEventType: EventType.Damage,
    afterEventId: SPELLS.FISTS_OF_FURY_CAST.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
    anyTarget: true,
    updateTimestamp: true,
  },
];

class FistsOfFuryNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default FistsOfFuryNormalizer;
