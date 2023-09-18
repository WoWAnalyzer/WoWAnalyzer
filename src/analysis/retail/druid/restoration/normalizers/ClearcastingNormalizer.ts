import SPELLS from 'common/SPELLS';
import { CastEvent, EventType, HasRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

const BUFFER_MS = 200;
const BUFFED_REGROWTH = 'BuffedRegrowth';
const BUFFED_BY_CLEARCAST = 'BuffedByClearcast';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: BUFFED_REGROWTH,
    reverseLinkRelation: BUFFED_BY_CLEARCAST,
    linkingEventId: SPELLS.CLEARCASTING_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.REGROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },
];

/** Links Clearcast fade to the Regrowth it buffed */
class ClearcastingNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function buffedRegrowth(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, BUFFED_REGROWTH);
}

export function buffedByClearcast(event: CastEvent): boolean {
  return HasRelatedEvent(event, BUFFED_BY_CLEARCAST);
}

export default ClearcastingNormalizer;
