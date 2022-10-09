import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_MONK } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';

export const APPLIED_HEAL = 'AppliedHeal';
export const BOUNCED = 'Bounced';
export const FROM_HARDCAST = 'FromHardcast';

const CAST_BUFFER_MS = 2000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.RENEWING_MIST.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BOUNCED,
    linkingEventId: [SPELLS.RENEWING_MIST_HEAL.id],
    linkingEventType: [EventType.ApplyBuff],
    referencedEventId: SPELLS.RENEWING_MIST_HEAL.id,
    referencedEventType: [EventType.ApplyBuff],
    forwardBufferMs: 5,
    backwardBufferMs: 5,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.ENVELOPING_MIST.id, SPELLS.ENVELOPING_MIST_TFT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.ENVELOPING_MIST.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.ESSENCE_FONT_BUFF.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 10000,
    backwardBufferMs: 10000,
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/Heal linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for Renewing Mist and Enveloping Mist
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  if (HasRelatedEvent(event, BOUNCED)) {
    const related = GetRelatedEvents(event, BOUNCED);
    if (related[0].timestamp > event.timestamp) {
      return isFromHardcast(related[0] as ApplyBuffEvent);
    }
  }
  const related = GetRelatedEvents(event, FROM_HARDCAST);
  if (related.length > 0 && related[0].type === 'cast') {
    const cast = related[0] as CastEvent;
    return cast.ability.name === event.ability.name;
  }
  return false;
}

export default CastLinkNormalizer;
