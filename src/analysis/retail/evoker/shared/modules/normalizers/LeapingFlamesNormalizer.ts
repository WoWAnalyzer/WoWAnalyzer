import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
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
  ApplyBuffStackEvent,
} from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import LeapingFlamesBuffNormalizer from './LeapingFlamesBuffNormalizer';

export const LEAPING_FLAMES_HITS = 'leapingFlamesHits';
export const LEAPING_FLAMES_CONSUME = 'leapingFlamesConsume';
export const LEAPING_FLAMES_BUFF = 'leapingFlamesBuff';
const LEAPING_FLAMES_CONSUME_BUFFER = 35;
const LEAPING_FLAMES_BUFF_BUFFER = 30_000;

export const LIVING_FLAME_CAST_HIT = 'livingFlameCastHit';
const LIVING_FLAME_HIT_BUFFER = 1000; // LF has travel time

export const EB_FROM_LF_CAST = 'ebFromLFCast';
export const EB_FROM_LF_HEAL = 'ebFromLFHeal';
export const EB_WASTE_FROM_LF_CAST = 'ebWasteFromLFCast';
export const EB_WASTE_FROM_LF_HEAL = 'ebWasteFromLFHeal';
const BACKWARDS_BUFFER = 10;

const EVENT_LINKS: EventLink[] = [
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
    isActive(c) {
      return c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);
    },
  },
  {
    linkRelation: LEAPING_FLAMES_BUFF,
    reverseLinkRelation: LEAPING_FLAMES_BUFF,
    linkingEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.LEAPING_FLAMES_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: LEAPING_FLAMES_BUFF_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(_linkingEvent, referencedEvent) {
      /** Condition to ensure that we only ever link unique hits to cast
       * LF has travel time so you can technically cast back-to-back before
       * the first LF hits */
      return !HasRelatedEvent(referencedEvent, LEAPING_FLAMES_BUFF);
    },
    isActive(c) {
      return c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);
    },
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
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    anyTarget: true,
    forwardBufferMs: LIVING_FLAME_HIT_BUFFER,
    // Specifically heal hits on yourself / really close targets can show up prior
    // can be seen here at 0:30
    // /report/vDVJKnwGmAM9tCQN/48-Mythic+Volcoross+-+Kill+(2:49)/Vollmer/standard/events
    backwardBufferMs: BACKWARDS_BUFFER,
    maximumLinks: (c) =>
      c.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT) ||
      c.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
      c.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
        ? 4
        : 3,
    additionalCondition(linkingEvent, referencedEvent) {
      if (!HasRelatedEvent(linkingEvent, LEAPING_FLAMES_CONSUME)) {
        return false;
      }

      /** To ensure we don't over attribute hits to Leaping Flames
       * we need to check for amount of targets hit, and max possible */
      const previousLeapingHits = getLeapingEvents(linkingEvent as CastEvent);
      const maxPossibleHits = leapingFlamesStackCount(linkingEvent);
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
    isActive(c) {
      return c.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);
    },
  },
];

class LeapingFlamesNormalizer extends EventLinkNormalizer {
  static dependencies = {
    ...EventLinkNormalizer.dependencies,
    leapingFlamesBuffNormalizer: LeapingFlamesBuffNormalizer,
  };

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

function leapingFlamesStackCount(event: AnyEvent): number {
  const leapingRemove = GetRelatedEvent(event, LEAPING_FLAMES_CONSUME);
  if (!leapingRemove) {
    return 1;
  }
  const applyEvent = GetRelatedEvent<ApplyBuffStackEvent>(leapingRemove, LEAPING_FLAMES_BUFF);

  if (!applyEvent || applyEvent.type !== EventType.ApplyBuffStack) {
    return 1;
  }

  return applyEvent.stack;
}

export default LeapingFlamesNormalizer;
