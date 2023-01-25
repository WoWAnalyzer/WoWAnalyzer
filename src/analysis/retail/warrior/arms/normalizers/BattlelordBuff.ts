import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.MORTAL_STRIKE.id,
    beforeEventType: EventType.Cast,
    afterEventId: TALENTS.BATTLELORD_TALENT.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the Battlelord Buff is removed after mortal strike is cast.
 */
class BattlelordNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default BattlelordNormalizer;
