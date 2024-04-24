import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption';
export const BURNOUT_CONSUME = 'BurnoutConsumption';
export const SNAPFIRE_CONSUME = 'SnapfireConsumption';
export const IRIDESCENCE_RED_CONSUME = 'IridescentRedConsumption';
export const IRIDESCENCE_BLUE_CONSUME = 'IridescentBlueConsumption';
export const DISINTEGRATE_REMOVE_APPLY = 'DisintegrateRemoveApply';
export const PYRE_CAST = 'PyreCast';
export const PYRE_DRAGONRAGE = 'PyreDragonrage';
export const PYRE_VOLATILITY = 'PyreVolatility';

export const PYRE_MIN_TRAVEL_TIME = 950;
export const PYRE_MAX_TRAVEL_TIME = 1_050;
const CAST_BUFFER_MS = 100;
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: [TALENTS.RUBY_ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
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
    linkingEventId: [TALENTS.RUBY_ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.PYRE.id, SPELLS.PYRE_DENSE_TALENT.id],
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
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS.BURNOUT_TALENT);
    },
  },
  {
    linkRelation: SNAPFIRE_CONSUME,
    reverseLinkRelation: SNAPFIRE_CONSUME,
    linkingEventId: SPELLS.SNAPFIRE_BUFF.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [TALENTS.FIRESTORM_TALENT.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 1000,
    isActive(c) {
      return c.hasTalent(TALENTS.FIRESTORM_TALENT);
    },
  },
  {
    linkRelation: IRIDESCENCE_RED_CONSUME,
    reverseLinkRelation: IRIDESCENCE_RED_CONSUME,
    linkingEventId: [SPELLS.IRIDESCENCE_RED.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.PYRE.id, SPELLS.PYRE_DENSE_TALENT.id, SPELLS.LIVING_FLAME_CAST.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS.IRIDESCENCE_TALENT);
    },
  },
  {
    linkRelation: IRIDESCENCE_BLUE_CONSUME,
    reverseLinkRelation: IRIDESCENCE_BLUE_CONSUME,
    linkingEventId: [SPELLS.IRIDESCENCE_BLUE.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.DISINTEGRATE.id,
      SPELLS.UNRAVEL.id,
      SPELLS.AZURE_STRIKE.id,
      SPELLS.SHATTERING_STAR.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS.IRIDESCENCE_TALENT);
    },
  },
  /** Sometimes, rarely, will disintegrate debuff be removed and reapplied
   * instead of refreshed, this messes with analysis. We make this link
   * so that we can check for it in our module and treat it as a refresh event
   * doing this over a normalizer for simplicity sake.
   * issue seen here: @ 06:36.392
   * https://www.warcraftlogs.com/reports/6RgwY1MV3CcJv792/#fight=25&type=damage-done&pins=0%24Separate%24%23244F4B%24casts%240%240.0.0.Any%24175324455.0.0.Evoker%24true%240.0.0.Any%24false%24356995%5E0%24Separate%24%23909049%24auras-gained%241%240.0.0.Any%24175324455.0.0.Evoker%24true%240.0.0.Any%24false%24356995&view=events&source=20&start=6166628&end=6169628
   */
  {
    linkRelation: DISINTEGRATE_REMOVE_APPLY,
    reverseLinkRelation: DISINTEGRATE_REMOVE_APPLY,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.RemoveDebuff,
    referencedEventId: SPELLS.DISINTEGRATE.id,
    referencedEventType: EventType.ApplyDebuff,
    anyTarget: true,
  },
  // region PYRE
  {
    linkRelation: PYRE_DRAGONRAGE,
    reverseLinkRelation: PYRE_DRAGONRAGE,
    linkingEventId: TALENTS.DRAGONRAGE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.PYRE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: PYRE_MAX_TRAVEL_TIME,
    isActive(c) {
      return c.hasTalent(TALENTS.DRAGONRAGE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      if (pyreHasSource(referencedEvent as DamageEvent)) {
        return false;
      }
      const delay = referencedEvent.timestamp - linkingEvent.timestamp;
      if (delay < PYRE_MIN_TRAVEL_TIME) {
        return false;
      }

      /** Since Pyre can only hit a target once per cast
       * we need to check if it's the same target
       * Dragonrage shoots out 3 pyres so we need to count */
      const previousEvents = getPyreEvents(linkingEvent as CastEvent);
      if (previousEvents.length > 0) {
        const targetHitCount = previousEvents.filter(
          (e) => encodeEventTargetString(e) === encodeEventTargetString(referencedEvent),
        );
        return targetHitCount.length < 3;
      }

      return true;
    },
  },
  {
    linkRelation: PYRE_CAST,
    reverseLinkRelation: PYRE_CAST,
    linkingEventId: TALENTS.PYRE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.PYRE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: PYRE_MAX_TRAVEL_TIME,
    isActive(c) {
      return c.hasTalent(TALENTS.PYRE_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      if (pyreHasSource(referencedEvent as DamageEvent)) {
        return false;
      }
      const delay = referencedEvent.timestamp - linkingEvent.timestamp;
      if (delay < PYRE_MIN_TRAVEL_TIME) {
        return false;
      }

      /** Since Pyre can only hit a target once per cast
       * we need to check if it's the same target */
      const previousEvents = getPyreEvents(linkingEvent as CastEvent);
      if (previousEvents.length > 0) {
        const hasSameTarget = previousEvents.some(
          (e) => encodeEventTargetString(e) === encodeEventTargetString(referencedEvent),
        );
        return !hasSameTarget;
      }

      return true;
    },
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

// region HELPERS
export function isFromBurnout(event: CastEvent) {
  return HasRelatedEvent(event, BURNOUT_CONSUME);
}

export function isFromEssenceBurst(event: CastEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_CONSUME);
}

export function isFromSnapfire(event: CastEvent) {
  return HasRelatedEvent(event, SNAPFIRE_CONSUME);
}

export function pyreHasSource(event: DamageEvent) {
  return isPyreFromDragonrage(event) || isPyreFromCast(event);
}

export function isPyreFromDragonrage(event: DamageEvent) {
  return HasRelatedEvent(event, PYRE_DRAGONRAGE);
}

export function isPyreFromCast(event: DamageEvent) {
  return HasRelatedEvent(event, PYRE_CAST);
}

export function getPyreEvents(event: CastEvent): DamageEvent[] {
  if (event.ability.guid === TALENTS.PYRE_TALENT.id) {
    return GetRelatedEvents<DamageEvent>(event, PYRE_CAST);
  }

  return GetRelatedEvents<DamageEvent>(event, PYRE_DRAGONRAGE);
}

export default CastLinkNormalizer;
