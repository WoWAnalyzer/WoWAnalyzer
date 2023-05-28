import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

export class StompOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      {
        beforeEventId: SPELLS.NIUZAO_STOMP_DAMAGE.id,
        beforeEventType: EventType.Cast,
        afterEventId: SPELLS.NIUZAO_STOMP_DAMAGE.id,
        afterEventType: EventType.Damage,
        bufferMs: 100,
        anyTarget: true, // Stomp is untargeted, but damage has targets
        // don't like altering timestamps, but this does make it work
        updateTimestamp: true,
      },
    ]);
  }
}
