import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: TALENTS.PYROBLAST_TALENT.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.PYROCLASM_BUFF.id,
    afterEventType: [
      EventType.ApplyBuff,
      EventType.ApplyBuffStack,
      EventType.RemoveBuff,
      EventType.RemoveBuffStack,
      EventType.RefreshBuff,
    ],
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * Ensures that the  ApplyBuff, RefreshBuff, and RemoveBuff events are not occuring before the pyroblast events... so the buff doesnt get applied, removed, or refreshed before the pyroblast actually casts
 */
class PyroclasmBuff extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default PyroclasmBuff;
