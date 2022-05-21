import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.MANIFESTED_TWILIGHT_BUFF_2P.id,
    beforeEventType: [
      EventType.ApplyBuff,
      EventType.ApplyBuffStack,
      EventType.RemoveBuff,
      EventType.RemoveBuffStack,
      EventType.RefreshBuff,
    ],
    afterEventId: SPELLS.SHADOW_MEND.id,
    afterEventType: EventType.Cast,
    bufferMs: 50,
    anyTarget: true,
  },
];

class ManifestedTwilightNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default ManifestedTwilightNormalizer;
