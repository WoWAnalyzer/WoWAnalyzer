import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

export const DEMOLISH_DAMAGE_CAST = 'Demolish-Damage-Cast';
const DEMOLISH_DURATION = 2000; // base 2s channel, hasted but shouldn't affect buffer window

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: DEMOLISH_DAMAGE_CAST,
    linkingEventId: SPELLS.DEMOLISH_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.DEMOLISH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: DEMOLISH_DURATION,
    backwardBufferMs: DEMOLISH_DURATION,
    anyTarget: true,
  },
];

class DemolishNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default DemolishNormalizer;
