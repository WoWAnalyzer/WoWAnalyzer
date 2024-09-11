import SPELLS from 'common/SPELLS/shaman';
import { Options } from 'parser/core/Analyzer';
import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

class StormbringerEventOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      /** There is a **BIG** gap between when the awakening storms buff is removed and the tempest buff is applied */
      {
        afterEventId: SPELLS.AWAKENING_STORMS_BUFF.id,
        afterEventType: EventType.RemoveBuff,
        beforeEventId: SPELLS.TEMPEST_BUFF.id,
        beforeEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
        bufferMs: 750,
        maxMatches: 1,
        updateTimestamp: true,
        anyTarget: true,
        anySource: true,
      },
    ]);
  }
}

export default StormbringerEventOrderNormalizer;
