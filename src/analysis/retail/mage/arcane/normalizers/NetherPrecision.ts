import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.NETHER_PRECISION_BUFF.id,
    beforeEventType: EventType.RemoveBuff,
    afterEventId: TALENTS.ARCANE_MISSILES_TALENT.id,
    afterEventType: EventType.Cast,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
];

class NetherPrecision extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default NetherPrecision;
