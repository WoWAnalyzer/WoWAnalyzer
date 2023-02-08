import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AnyEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/rogue';
import { Options } from 'parser/core/Module';

const CAST_BUFFER_MS = 50;

export const FROM_HARDCAST = 'FromHardcast';
export const RESOURCE_CHANGE = 'ResourceChange';

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

export function isFromHardcast(event: AnyEvent): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function getHardcast(event: ResourceChangeEvent): CastEvent | undefined {
  const events: AnyEvent[] = GetRelatedEvents(event, FROM_HARDCAST);
  return events.length === 0 ? undefined : (events[0] as CastEvent);
}

export function getResourceChange(event: CastEvent): ResourceChangeEvent | undefined {
  const events = GetRelatedEvents(event, RESOURCE_CHANGE).filter(
    (it): it is ResourceChangeEvent => it.type === EventType.ResourceChange,
  );
  return events.length === 0 ? undefined : events[0];
}
