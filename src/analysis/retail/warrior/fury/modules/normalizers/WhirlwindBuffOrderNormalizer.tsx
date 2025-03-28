import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: [SPELLS.WHIRLWIND_FURY_CAST.id, SPELLS.THUNDER_BLAST.id, SPELLS.THUNDER_CLAP.id],
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.WHIRLWIND_BUFF.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    beforeEventId: [SPELLS.WHIRLWIND_FURY_CAST.id, SPELLS.THUNDER_BLAST.id, SPELLS.THUNDER_CLAP.id],
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.WHIRLWIND_BUFF.id,
    afterEventType: EventType.ApplyBuffStack,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
];

class WhirlwindBuffOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default WhirlwindBuffOrderNormalizer;
