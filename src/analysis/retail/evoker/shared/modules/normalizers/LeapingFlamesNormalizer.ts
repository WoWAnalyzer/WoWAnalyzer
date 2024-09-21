import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RemoveBuffEvent,
  AnyEvent,
  EmpowerEndEvent,
} from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

export const LEAPING_FLAMES_HITS = 'leapingFlamesHits';
export const LEAPING_FLAMES_CONSUME = 'leapingFlamesConsume';
export const LEAPING_FLAMES_BUFF = 'leapingFlamesBuff';
export const LEAPING_FLAMES_APPLICATION = 'leapingFlamesApplication';
const LEAPING_FLAMES_CONSUME_BUFFER = 35;
const LEAPING_FLAMES_BUFF_BUFFER = 30_000;

export const LIVING_FLAME_CAST_HIT = 'livingFlameCastHit';
const LIVING_FLAME_HIT_BUFFER = 1_000; // LF has travel time

export const EB_FROM_LF_CAST = 'ebFromLFCast';
export const EB_FROM_LF_HEAL = 'ebFromLFHeal';
export const EB_WASTE_FROM_LF_CAST = 'ebWasteFromLFCast';
export const EB_WASTE_FROM_LF_HEAL = 'ebWasteFromLFHeal';
const BACKWARDS_BUFFER = 10;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: LEAPING_FLAMES_CONSUME,
    reverseLinkRelation: LEAPING_FLAMES_CONSUME,
    linkingEventId: [SPELLS.LIVING_FLAME_CAST.id, SPELLS.CHRONO_FLAME_CAST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    forwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
    backwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
    isActive: (c) => c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT),
  },
  {
    linkRelation: LEAPING_FLAMES_BUFF,
    reverseLinkRelation: LEAPING_FLAMES_BUFF,
    linkingEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    /** If the buff is refreshed/overridden it will gain/lose stacks instead of refreshing
     * It can be observed in this log @24:53.644 & @27:58.515 /reports/rXkDfLBavt1mWpKx#fight=5&type=damage-done&source=1 */
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: LEAPING_FLAMES_BUFF_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT),
    additionalCondition(_linkingEvent, referencedEvent) {
      /** Condition to ensure that we only ever link unique hits to cast
       * LF has travel time so you can technically cast back-to-back before
       * the first LF hits */
      return !HasRelatedEvent(referencedEvent, LEAPING_FLAMES_BUFF);
    },
  },
  {
    linkRelation: LEAPING_FLAMES_APPLICATION,
    reverseLinkRelation: LEAPING_FLAMES_APPLICATION,
    linkingEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    /** If the buff is refreshed/overridden it will gain/lose stacks instead of refreshing
     * See examples above */
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.FIRE_BREATH.id, SPELLS.FIRE_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    forwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
    backwardBufferMs: LEAPING_FLAMES_CONSUME_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT),
  },
  {
    linkRelation: LIVING_FLAME_CAST_HIT,
    reverseLinkRelation: LIVING_FLAME_CAST_HIT,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    forwardBufferMs: LIVING_FLAME_HIT_BUFFER,
    backwardBufferMs: BACKWARDS_BUFFER,
    maximumLinks: 1,
    additionalCondition(_linkingEvent, referencedEvent) {
      /** Condition to ensure that we only ever link unique hits to cast
       * LF has travel time so you can technically cast back-to-back before
       * the first LF hits */
      return !HasRelatedEvent(referencedEvent, LIVING_FLAME_CAST_HIT);
    },
  },
  {
    linkRelation: LEAPING_FLAMES_HITS,
    reverseLinkRelation: LEAPING_FLAMES_HITS,
    linkingEventId: [SPELLS.LIVING_FLAME_CAST.id, SPELLS.CHRONO_FLAME_CAST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: LIVING_FLAME_HIT_BUFFER,
    // Specifically heal hits on yourself / really close targets can show up prior
    // can be seen here at 0:30
    // /report/vDVJKnwGmAM9tCQN/48-Mythic+Volcoross+-+Kill+(2:49)/Vollmer/standard/events
    backwardBufferMs: BACKWARDS_BUFFER,
    maximumLinks: (c) => {
      return c.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT) ||
        c.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
        c.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
        ? 4
        : 3;
    },
    isActive: (c) => c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT),
    additionalCondition(linkingEvent, referencedEvent) {
      if (!HasRelatedEvent(linkingEvent, LEAPING_FLAMES_CONSUME)) {
        return false;
      }

      /** To ensure we don't over attribute hits to Leaping Flames
       * we need to check for amount of targets hit, and max possible */
      const previousLeapingHits = getLeapingEvents(linkingEvent as CastEvent);
      const maxPossibleHits = getLeapingFlamesStacks(linkingEvent);
      if (previousLeapingHits.length >= maxPossibleHits) {
        return false;
      }

      /** Make sure we don't attribute to the main target */
      const curTarget = encodeEventTargetString(referencedEvent);
      /** Talents like Pupil of Alexstrasza will also cleave LF
       * so we just need to make sure we don't double dip the same target */
      const targetHitBefore = previousLeapingHits.some(
        (prevEvent) => encodeEventTargetString(prevEvent) === curTarget,
      );

      return !HasRelatedEvent(referencedEvent, LIVING_FLAME_CAST_HIT) && !targetHitBefore;
    },
  },
];

class LeapingFlamesNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}
export function getLeapingEvents<T extends EventType.Damage | EventType.Heal>(
  event: CastEvent,
  filter?: T,
): AnyEvent<T>[] {
  const events = GetRelatedEvents<AnyEvent<T>>(
    event,
    LEAPING_FLAMES_HITS,
    filter ? (e): e is AnyEvent<T> => e.type === filter : undefined,
  );

  return events;
}
export function getLivingFlameCastHit(event: CastEvent): HealEvent | DamageEvent | undefined {
  return GetRelatedEvent(
    event,
    LIVING_FLAME_CAST_HIT,
    (e): e is HealEvent | DamageEvent => e.type === EventType.Heal || e.type === EventType.Damage,
  );
}

export function isFromLeapingFlames(event: CastEvent | DamageEvent | HealEvent) {
  return (
    HasRelatedEvent(event, LEAPING_FLAMES_CONSUME) || HasRelatedEvent(event, LEAPING_FLAMES_HITS)
  );
}

export function getLeapingCast(event: RemoveBuffEvent): CastEvent | undefined {
  return GetRelatedEvent(
    event,
    LEAPING_FLAMES_CONSUME,
    (e): e is CastEvent => e.type === EventType.Cast,
  );
}

function getLeapingFlamesStacks(event: AnyEvent): number {
  const leapingEvent =
    event.type === EventType.Cast ? GetRelatedEvent(event, LEAPING_FLAMES_CONSUME) : event;

  if (!leapingEvent) {
    return 1;
  }

  if (
    leapingEvent.type === EventType.ApplyBuffStack ||
    leapingEvent.type === EventType.RemoveBuffStack
  ) {
    return leapingEvent.stack;
  }

  const applyEvent =
    leapingEvent.type === EventType.RemoveBuff
      ? GetRelatedEvent(leapingEvent, LEAPING_FLAMES_BUFF)
      : leapingEvent;

  if (!applyEvent) {
    return 1;
  }

  if (
    applyEvent.type === EventType.ApplyBuffStack ||
    applyEvent.type === EventType.RemoveBuffStack
  ) {
    return applyEvent.stack;
  }

  const empowerEvent = GetRelatedEvent<EmpowerEndEvent>(applyEvent, LEAPING_FLAMES_APPLICATION);

  return empowerEvent?.empowermentLevel || 1;
}

export default LeapingFlamesNormalizer;
