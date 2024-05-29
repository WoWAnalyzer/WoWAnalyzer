import { Options } from 'parser/core/Analyzer';
import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

export default class ResourceOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, [
      {
        beforeEventId: null,
        beforeEventType: EventType.Cast,
        afterEventId: null,
        afterEventType: EventType.ResourceChange,
        anySource: true,
        anyTarget: true,
      },
    ]);
  }
}
