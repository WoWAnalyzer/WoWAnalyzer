import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const MAX_DELAY = 50;

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: null,
    beforeEventType: EventType.Damage,
    afterEventId: [
      SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id,
      SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id,
    ],
    afterEventType: EventType.RemoveBuff,
    bufferMs: MAX_DELAY,
    updateTimestamp: true,
    anyTarget: true,
  },
  {
    beforeEventId: null,
    beforeEventType: EventType.Cast,
    afterEventId: [
      SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id,
      SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id,
    ],
    afterEventType: EventType.ApplyBuff,
    bufferMs: MAX_DELAY,
    updateTimestamp: true,
    anyTarget: true,
  },
];

class TwilightEquilibriumNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
export default TwilightEquilibriumNormalizer;
