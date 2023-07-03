import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

export const PRESCIENCE_BUFFER = 100;

export const PRESCIENCE_BUFF_LINK = 'prescienceBuffLink';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PRESCIENCE_BUFF_LINK,
    reverseLinkRelation: PRESCIENCE_BUFF_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS.PRESCIENCE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: PRESCIENCE_BUFFER,
    backwardBufferMs: PRESCIENCE_BUFFER,
  },
];

class PrescienceNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrescienceBuffTarget(event: CastEvent) {
  if (HasRelatedEvent(event, PRESCIENCE_BUFF_LINK)) {
    const buffevent = GetRelatedEvents(event, PRESCIENCE_BUFF_LINK).filter(
      (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff,
    );
    for (const event of buffevent) {
      // Filter out targets like Light hammer, to get the "real" target
      if (event.targetID !== undefined) {
        const buffEvent = event;
        return buffEvent;
      }
    }
  }
}

export default PrescienceNormalizer;
