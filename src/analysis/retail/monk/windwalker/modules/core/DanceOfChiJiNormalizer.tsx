import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/monk';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.SPINNING_CRANE_KICK.id,
    beforeEventType: EventType.Cast,
    afterEventId: SPELLS.DANCE_OF_CHI_JI_BUFF.id,
    afterEventType: EventType.RemoveBuff,
    anyTarget: true,
  },
];
class DanceOfChiJiNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default DanceOfChiJiNormalizer;
