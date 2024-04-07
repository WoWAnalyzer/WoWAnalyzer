import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { EB_BUFF_IDS } from '../../constants';
import { TIERS } from 'game/TIERS';

export const EB_GENERATION_EVENT_TYPES = [
  EventType.RefreshBuff,
  EventType.ApplyBuffStack,
  EventType.ApplyBuff,
];
type AnyBuffEvent =
  | ApplyBuffEvent
  | RefreshBuffEvent
  | ApplyBuffStackEvent
  | RemoveBuffEvent
  | RemoveBuffStackEvent;

export const EB_FROM_EMERALD_TRANCE = 'ebFromEmeraldTrance';
export const EB_FROM_AZURE_STRIKE = 'ebFromAzureStrike';
export const EB_FROM_PRESCIENCE = 'ebFromPrescience';
export const EB_FROM_ARCANE_VIGOR = 'ebFromArcaneVigor';
export const EB_FROM_LF_CAST = 'ebFromLFCast';
export const EB_FROM_LF_HEAL = 'ebFromLFHeal'; // Specifically used for Leaping Flames analysis
const ESSENCE_BURST_BUFFER = 40; // Sometimes the EB comes a bit early/late
const EB_LF_CAST_BUFFER = 1000;
const EMERALD_TRANCE_BUFFER = 5000;

/** More deterministic links should be placed above less deterministic links
 * eg.
 * Arcane Vigor from Devastation makes Shattering Star casts produce a guaranteed EB.
 *
 * Whilst Living Flame has a chance to produce an EB on cast/heal hits, which shouldn't inherently be a problem,
 * but due to LF having travel time and how the EB calculation for it works the damage procced EB will always
 * come on cast, but the heal hits will come on the actual hits (sometimes it will proc on cast even when there is travel time).
 * There are also talents/tier sets that produce extra LFs which only makes it harder to specify the exact source.
 *
 * examples:
 * 1. LF Heal hit lands just as you use Shattering Star, generating an EB that potentially could be from both.
 *    In this example Arcane Vigor makes the EB gen 100% and as such would take precedence.
 *    Any subsequent EB would then be attributed to the LF hit.
 * 2. Devastation T31 4pc generates an EB every 5 seconds after Dragonrage ends.
 *    In this example the EB could land within our EB_FROM_LF_CAST search and be incorrectly attributed.
 */
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: EB_FROM_ARCANE_VIGOR,
    reverseLinkRelation: EB_FROM_ARCANE_VIGOR,
    linkingEventId: SPELLS.SHATTERING_STAR.id,
    linkingEventType: EventType.Cast,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    anyTarget: true,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS.ARCANE_VIGOR_TALENT);
    },
  },
  {
    linkRelation: EB_FROM_PRESCIENCE,
    reverseLinkRelation: EB_FROM_PRESCIENCE,
    linkingEventId: TALENTS.PRESCIENCE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    anyTarget: true,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.ANACHRONISM_TALENT),
  },
  {
    linkRelation: EB_FROM_EMERALD_TRANCE,
    reverseLinkRelation: EB_FROM_EMERALD_TRANCE,
    linkingEventId: SPELLS.EMERALD_TRANCE_T31_4PC_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    anyTarget: true,
    forwardBufferMs: EMERALD_TRANCE_BUFFER * 5 + ESSENCE_BURST_BUFFER,
    maximumLinks: 5,
    isActive: (c) => {
      return c.has4PieceByTier(TIERS.DF3);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      // applies one EB each 5000 ms for the duration of the buff (25000ms)
      // so check if the timestamp difference is divisible by 5000 allowing the remainder to be withing the ESSENCE_BURST_BUFFER range
      const timeDiff = Math.abs(
        (linkingEvent.timestamp - referencedEvent.timestamp) % EMERALD_TRANCE_BUFFER,
      );
      if (
        timeDiff > ESSENCE_BURST_BUFFER &&
        EMERALD_TRANCE_BUFFER - timeDiff > ESSENCE_BURST_BUFFER // it can come early
      ) {
        return false;
      }

      return hasNoGenerationLink(referencedEvent as AnyBuffEvent);
    },
  },
  {
    linkRelation: EB_FROM_AZURE_STRIKE,
    reverseLinkRelation: EB_FROM_AZURE_STRIKE,
    linkingEventId: SPELLS.AZURE_STRIKE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    anyTarget: true,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    maximumLinks: 1,
    isActive: (c) => {
      return (
        c.hasTalent(TALENTS.AZURE_ESSENCE_BURST_TALENT) ||
        c.hasTalent(TALENTS.ESSENCE_BURST_AUGMENTATION_TALENT)
      );
    },
    additionalCondition(_linkingEvent, referencedEvent) {
      return hasNoGenerationLink(referencedEvent as AnyBuffEvent);
    },
  },
  {
    linkRelation: EB_FROM_LF_CAST,
    reverseLinkRelation: EB_FROM_LF_CAST,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    forwardBufferMs: EB_LF_CAST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    anyTarget: true,
    additionalCondition(_linkingEvent, referencedEvent) {
      return hasNoGenerationLink(referencedEvent as AnyBuffEvent);
    },
  },
  /** Link used for Leaping Flames analysis */
  {
    linkRelation: EB_FROM_LF_HEAL,
    reverseLinkRelation: EB_FROM_LF_HEAL,
    linkingEventId: SPELLS.LIVING_FLAME_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: EB_BUFF_IDS,
    referencedEventType: EB_GENERATION_EVENT_TYPES,
    anyTarget: true,
    forwardBufferMs: ESSENCE_BURST_BUFFER,
    backwardBufferMs: ESSENCE_BURST_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        !hasNoGenerationLink(referencedEvent as AnyBuffEvent) ||
        (linkingEvent as HealEvent).amount <= 0
      ) {
        // Only effective heals can generated EB
        return false;
      }
      const lfCastEvent = GetRelatedEvent(referencedEvent, EB_FROM_LF_CAST);
      if (!lfCastEvent) {
        return true;
      }

      /** This is essentially just a simple check to see if the heal hit is more likely to have
       * generated the EB rather than a damage hit. */
      const castProcDiff = Math.abs(lfCastEvent.timestamp - referencedEvent.timestamp);
      const healProcDiff = Math.abs(linkingEvent.timestamp - referencedEvent.timestamp);

      return healProcDiff < castProcDiff;
    },
  },
];

class EssenceBurstCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** All the possible EB sources */
export const EBSource = {
  Prescience: EB_FROM_PRESCIENCE,
  ArcaneVigor: EB_FROM_ARCANE_VIGOR,
  EmeraldTrance: EB_FROM_EMERALD_TRANCE,
  AzureStrike: EB_FROM_AZURE_STRIKE,
  LivingFlameCast: EB_FROM_LF_CAST,
  LivingFlameHeal: EB_FROM_LF_HEAL,
} as const;
export type EBSourceType = typeof EBSource[keyof typeof EBSource];

const ebSourcesValues = Object.values(EBSource);
/** Get the source type for EB event */
export function getEBSource(event: AnyEvent): EBSourceType | undefined {
  return ebSourcesValues.find((source) => HasRelatedEvent(event, source));
}

/** Check if EB was generated by specific source type
 *
 * @param event - The event to check
 * @param source - The source type to check against
 */
export function isEBFrom(event: AnyBuffEvent, source: EBSourceType): boolean {
  return HasRelatedEvent(event, source);
}

/** Get the source event for EB event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 */
export function getEBSourceEvent<T extends AnyEvent>(
  event: AnyEvent,
  source?: EBSourceType,
): T | undefined {
  const link = source ?? getEBSource(event);

  if (!link) {
    return;
  }
  return GetRelatedEvent(event, link);
}

/** Get all the EB events for an event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 * @param filter - An optional filter to apply to the events
 */
export function getAllEBEvents<T extends AnyBuffEvent>(
  event: AnyEvent,
  source?: EBSourceType,
  filter?: (e: AnyEvent) => boolean,
): T[] {
  const link = source ?? getEBSource(event);
  if (!link) {
    return [];
  }

  const ebEvents: T[] = GetRelatedEvents(event, link, filter);
  return ebEvents;
}

/** Get all the EB events generated by an event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 */
export function getGeneratedEBEvents(
  event: AnyEvent,
  source?: EBSourceType,
): (ApplyBuffEvent | ApplyBuffStackEvent)[] {
  return getAllEBEvents(
    event,
    source,
    (e) => e.type === EventType.ApplyBuff || e.type === EventType.ApplyBuffStack,
  );
}

/** Get all the EB events wasted by an event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 */
export function getWastedEBEvents(event: AnyEvent, source?: EBSourceType): RefreshBuffEvent[] {
  return getAllEBEvents(event, source, (e) => e.type === EventType.RefreshBuff);
}

/** Check if any EB was generated by an event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 */
export function eventGeneratedEB(event: AnyEvent, source?: EBSourceType) {
  return Boolean(getGeneratedEBEvents(event, source).length);
}

/** Check if any EB was wasted by an event
 *
 * @param event - The event to check
 * @param source - Optional source to check against, if not provided it will be inferred
 */
export function eventWastedEB(event: AnyEvent, source?: EBSourceType) {
  return Boolean(getWastedEBEvents(event, source).length);
}

/** We allow LivingFlameCast link since only our Heal hits will actually be able to meet it, and Leaping Flames relies on it. */
function hasNoGenerationLink(event: AnyBuffEvent) {
  const curLink = getEBSource(event);
  return !curLink || curLink === EBSource.LivingFlameCast;
}

export default EssenceBurstCastLinkNormalizer;
