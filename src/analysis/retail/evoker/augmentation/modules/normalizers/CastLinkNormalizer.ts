import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { ApplyBuffEvent, CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

export const PRESCIENCE_BUFF_CAST_LINK = 'prescienceBuffCastLink';
export const PRESCIENCE_APPLY_REMOVE_LINK = 'prescienceApplyRemoveLink';

export const PRESCIENCE_BUFFER = 100;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PRESCIENCE_BUFF_CAST_LINK,
    reverseLinkRelation: PRESCIENCE_BUFF_CAST_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS.PRESCIENCE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: PRESCIENCE_BUFFER,
    backwardBufferMs: PRESCIENCE_BUFFER,
  },
  {
    linkRelation: PRESCIENCE_APPLY_REMOVE_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RemoveBuff],
    referencedEventId: SPELLS.PRESCIENCE_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RemoveBuff],
    anyTarget: true,
    forwardBufferMs: 5000,
    backwardBufferMs: 5000,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrescienceBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(event, PRESCIENCE_BUFF_CAST_LINK).filter(
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff,
  );
}

export default CastLinkNormalizer;
