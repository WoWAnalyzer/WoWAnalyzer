import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.MUTILATE_OFFHAND.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.MUTILATE.id,
    afterEventType: EventType.Cast,
    bufferMs: 50,
  },
  {
    beforeEventId: SPELLS.MUTILATE.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.BLINDSIDE_BUFF.id,
    afterEventType: EventType.ApplyBuff,
    bufferMs: 50,
    anyTarget: true,
    updateTimestamp: true,
  },
];

export default class BlindsideEventOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
