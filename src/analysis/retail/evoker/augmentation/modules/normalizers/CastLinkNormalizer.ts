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

export const PRESCIENCE_BUFF_CAST_LINK = 'prescienceBuffCastLink';
export const PRESCIENCE_APPLY_REMOVE_LINK = 'prescienceApplyRemoveLink';
export const TIP_THE_SCALES_CONSUME = 'tipTheScalesConsume';
export const BREATH_EBON_APPLY_LINK = 'breathEbonApplyLink';

export const PRESCIENCE_BUFFER = 150;
export const CAST_BUFFER_MS = 100;
export const BREATH_EBON_BUFFER = 250;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PRESCIENCE_BUFF_CAST_LINK,
    reverseLinkRelation: PRESCIENCE_BUFF_CAST_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
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
  {
    linkRelation: TIP_THE_SCALES_CONSUME,
    reverseLinkRelation: TIP_THE_SCALES_CONSUME,
    linkingEventId: TALENTS.TIP_THE_SCALES_TALENT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.FIRE_BREATH.id,
      SPELLS.FIRE_BREATH_FONT.id,
      SPELLS.UPHEAVAL.id,
      SPELLS.UPHEAVAL_FONT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BREATH_EBON_APPLY_LINK,
    reverseLinkRelation: BREATH_EBON_APPLY_LINK,
    linkingEventId: TALENTS.BREATH_OF_EONS_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: BREATH_EBON_BUFFER,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrescienceBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(event, PRESCIENCE_BUFF_CAST_LINK).filter(
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RefreshBuff,
  );
}

export function isFromTipTheScales(event: CastEvent) {
  return HasRelatedEvent(event, TIP_THE_SCALES_CONSUME);
}

export function ebonIsFromBreath(event: ApplyBuffEvent) {
  return HasRelatedEvent(event, BREATH_EBON_APPLY_LINK);
}

export default CastLinkNormalizer;
