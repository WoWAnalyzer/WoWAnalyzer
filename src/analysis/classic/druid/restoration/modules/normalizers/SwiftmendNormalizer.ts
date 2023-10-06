import SPELLS from 'common/SPELLS/classic/druid';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  HasAbility,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const REMOVE_BUFFER_MS = 50;

export const CONSUMED_HOT = 'ConsumedHot';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CONSUMED_HOT,
    linkingEventId: SPELLS.SWIFTMEND.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.REJUVENATION.id, SPELLS.REGROWTH.id, SPELLS.WILD_GROWTH.id],
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: REMOVE_BUFFER_MS,
  },
];

class SwiftmendNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getRemovedHot(event: CastEvent): AbilityEvent<any> | undefined {
  return GetRelatedEvent(event, CONSUMED_HOT, HasAbility);
}

export default SwiftmendNormalizer;
