import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { CastEvent, EventType, HasRelatedEvent } from 'parser/core/Events';

export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption';
export const BURNOUT_CONSUME = 'BurnoutConsumption';

const CAST_BUFFER_MS = 100;
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: [
      TALENTS_EVOKER.ESSENCE_BURST_TALENT.id,
      TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT.id,
    ],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.DISINTEGRATE.id,

    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: [
      TALENTS_EVOKER.ESSENCE_BURST_TALENT.id,
      TALENTS_EVOKER.ESSENCE_BURST_ATTUNED_TALENT.id,
    ],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.PYRE.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BURNOUT_CONSUME,
    reverseLinkRelation: BURNOUT_CONSUME,
    linkingEventId: SPELLS.BURNOUT_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_CAST.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: 1000,
    backwardBufferMs: 1000,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.BURNOUT_TALENT);
    },
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromBurnout(event: CastEvent) {
  return HasRelatedEvent(event, BURNOUT_CONSUME);
}

export function isFromEssenceBurst(event: CastEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_CONSUME);
}

export default CastLinkNormalizer;
