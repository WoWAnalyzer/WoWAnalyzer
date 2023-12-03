import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: [TALENTS.COMBUSTION_TALENT.id, TALENTS.PYROBLAST_TALENT.id],
    beforeEventType: EventType.Cast,
    afterEventId: TALENTS.COMBUSTION_TALENT.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
  },
  {
    beforeEventId: TALENTS.COMBUSTION_TALENT.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.FURY_OF_THE_SUN_KING.id,
    afterEventType: EventType.RemoveBuff,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the apply buff event for Combustion is sorted after the Combustion cast.
 */
class Combustion extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default Combustion;
