import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';

export const LEAPING_FLAMES_HITS = 'leapingFlamesHits';
export const LEAPING_FLAMES_CONSUME = 'leapingFlamesConsume';
export const ESSENCE_BURST_GENERATED = 'essenceBurstGenerated';
export const ESSENCE_BURST_CAST_GENERATED = 'essenceBurstCastGenerated';
export const ESSENCE_BURST_WASTED = 'essenceBurstWasted';

const LEAPING_FLAMES_HIT_BUFFER = 1000;
const ESSENCE_BURST_BUFFER = 20;
const LEAPING_FLAMES_CONSUME_BUFFER = 35;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: LEAPING_FLAMES_HITS,
    reverseLinkRelation: LEAPING_FLAMES_HITS,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: LEAPING_FLAMES_HIT_BUFFER,
  },
  {
    linkRelation: LEAPING_FLAMES_CONSUME,
    reverseLinkRelation: LEAPING_FLAMES_CONSUME,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    forwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
    backwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
  },
  {
    linkRelation: ESSENCE_BURST_GENERATED,
    reverseLinkRelation: ESSENCE_BURST_GENERATED,
    linkingEventId: [
      TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT.id,
      SPELLS.ESSENCE_BURST_DEV_BUFF.id,
      SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: [
      SPELLS.LIVING_FLAME_DAMAGE.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.AZURE_STRIKE.id,
    ],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER, // Sometimes the EB comes a bit early/late
    maximumLinks: 1,
  },
  {
    linkRelation: ESSENCE_BURST_CAST_GENERATED,
    reverseLinkRelation: ESSENCE_BURST_CAST_GENERATED,
    linkingEventId: [
      TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT.id,
      SPELLS.ESSENCE_BURST_DEV_BUFF.id,
      SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
    ],
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.LIVING_FLAME_CAST.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: ESSENCE_BURST_WASTED,
    reverseLinkRelation: ESSENCE_BURST_WASTED,
    linkingEventId: [
      TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT.id,
      SPELLS.ESSENCE_BURST_DEV_BUFF.id,
      SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
    ],
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.LIVING_FLAME_CAST.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    anyTarget: true,
  },
];

class LeapingFlamesNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.LEAPING_FLAMES_TALENT);
  }
}

export function getLeapingDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, LEAPING_FLAMES_HITS).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getLeapingHealEvents(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, LEAPING_FLAMES_HITS).filter(
    (e): e is HealEvent => e.type === EventType.Heal,
  );
}

export function getCastedGeneratedEssenceBurst(
  event: CastEvent,
): (ApplyBuffEvent | ApplyBuffStackEvent)[] {
  return GetRelatedEvents(event, ESSENCE_BURST_CAST_GENERATED).filter(
    (e): e is ApplyBuffEvent | ApplyBuffStackEvent =>
      e.type === EventType.ApplyBuff || e.type === EventType.ApplyBuffStack,
  );
}

export function getWastedEssenceBurst(event: CastEvent): RefreshBuffEvent[] {
  return GetRelatedEvents(event, ESSENCE_BURST_WASTED).filter(
    (e): e is RefreshBuffEvent => e.type === EventType.RefreshBuff,
  );
}

export function generatedEssenceBurst(event: DamageEvent | HealEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_GENERATED);
}

export function isFromLeapingFlames(event: CastEvent) {
  return HasRelatedEvent(event, LEAPING_FLAMES_CONSUME);
}

export default LeapingFlamesNormalizer;
