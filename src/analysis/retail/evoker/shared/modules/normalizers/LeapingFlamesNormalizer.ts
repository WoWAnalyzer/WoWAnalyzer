import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';

export const LEAPING_FLAMES_CONSUME = 'leapingFlamesConsume';
export const ESSENCE_BURST_GENERATED = 'EssenceBurstGenerated';

const LEAPING_FLAMES_BUFFER = 1000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: LEAPING_FLAMES_CONSUME,
    reverseLinkRelation: LEAPING_FLAMES_CONSUME,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: LEAPING_FLAMES_BUFFER,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.LEAPING_FLAMES_TALENT);
    },
  },
  {
    linkRelation: ESSENCE_BURST_GENERATED,
    reverseLinkRelation: ESSENCE_BURST_GENERATED,
    linkingEventId: [TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: [
      SPELLS.LIVING_FLAME_DAMAGE.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.AZURE_STRIKE.id,
    ],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: 20,
    backwardBufferMs: 20, // Sometimes the EB comes a bit early/late
    maximumLinks: 1,
  },
];

class LeapingFlamesNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getLeapingDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, LEAPING_FLAMES_CONSUME).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getLeapingHealEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, LEAPING_FLAMES_CONSUME).filter(
    (e): e is HealEvent => e.type === EventType.Heal,
  );
}

export function generatedEssenceBurst(event: DamageEvent | HealEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_GENERATED);
}

export default LeapingFlamesNormalizer;
