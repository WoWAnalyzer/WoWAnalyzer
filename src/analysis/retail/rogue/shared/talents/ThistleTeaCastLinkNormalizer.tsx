import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, EventType, GetRelatedEvent, ResourceChangeEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/rogue';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 50;

const FROM_HARDCAST = 'FromHardcast';
const RESOURCE_CHANGE = 'ResourceChange';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: RESOURCE_CHANGE,
    linkingEventId: TALENTS.THISTLE_TEA_TALENT.id,
    linkingEventType: EventType.ResourceChange,
    referencedEventId: TALENTS.THISTLE_TEA_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
];

export default class ThistleTeaCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getResourceChange(event: CastEvent): ResourceChangeEvent | undefined {
  return GetRelatedEvent(
    event,
    RESOURCE_CHANGE,
    (it): it is ResourceChangeEvent => it.type === EventType.ResourceChange,
  );
}
