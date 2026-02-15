import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import {
  GetMaxDisintegrateTargetCount,
  IRIDESCENCE_BLUE_CAST_SPELLS,
  IRIDESCENCE_RED_CAST_SPELLS,
} from '../../constants';
import {
  getLeapingEvents,
  getLivingFlameCastHit,
} from 'analysis/retail/evoker/shared/modules/normalizers/LeapingFlamesNormalizer';
import { CHAINED_CAST, CHAINED_FROM_CAST } from './DisintegrateChainCastLinks';
import { ETERNITY_SURGE_FROM_CAST } from './EternitySurgeNormalizer';
import { DEEP_BREATH_SPELL_IDS } from 'analysis/retail/evoker/shared';

const BURNOUT_CONSUME = 'BurnoutConsumption';
const SNAPFIRE_CONSUME = 'SnapfireConsumption';
const IRIDESCENCE_RED_CONSUME = 'IridescentRedConsumption';
const IRIDESCENCE_BLUE_CONSUME = 'IridescentBlueConsumption';
export const DISINTEGRATE_REMOVE_APPLY = 'DisintegrateRemoveApply';
export const PYRE_CAST = 'PyreCast';
export const PYRE_DRAGONRAGE = 'PyreDragonrage';
export const PYRE_VOLATILITY = 'PyreVolatility';
const DISINTEGRATE_DEBUFF = 'DisintegrateDebuff';
const DISINTEGRATE_TICK = 'DisintegrateTick';
const MASS_DISINTEGRATE_CONSUME = 'MassDisintegrateConsume';
const MASS_DISINTEGRATE_TICK = 'MassDisintegrateTick';
const MASS_DISINTEGRATE_DEBUFF = 'MassDisintegrateDebuff';
const FIRE_BREATH_DEBUFF = 'FireBreathDebuff';
const AZURE_SWEEP_CONSUME = 'AzureSweepConsume';
const AZURE_SWEEP_GENERATE = 'AzureSweepGenerate';
const SHATTERING_STAR_DAMAGE = 'ShatteringStarDamage';
const ETERNITY_SURGE_SHATTER_STAR_LINK = 'EternitySurgeShatterStarLink';

const CONSUME_FLAME_TICK = 'ConsumeFlameTick';
const FIRE_BREATH_REMOVE_DEBUFF = 'FireBreathRemoveDebuff';
const FIRE_BREATH_REMOVE_CONSUME_FLAME_BUFFER_MS = 250;

const CAST_LINK = 'CastLink';
const DAMAGE_LINK = 'DamageLink';

export const PYRE_MIN_TRAVEL_TIME = 950;
export const PYRE_MAX_TRAVEL_TIME = 1_050;
const SHATTERING_STAR_TRAVEL_TIME = 2_000;
const CAST_BUFFER_MS = 100;
const IRIDESCENCE_RED_BACKWARDS_BUFFER_MS = 500;
const DISINTEGRATE_TICK_BUFFER = 4_000; // Haste dependant
const DEEP_BREATH_FLIGHT_TIME_MS = 4_000; // 3s + some leeway
const TWIN_FLAME_TRAVEL_TIME_MS = 1_000;

const EVENT_LINKS: EventLink[] = [
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
    linkRelation: IRIDESCENCE_RED_CONSUME,
    reverseLinkRelation: IRIDESCENCE_RED_CONSUME,
    linkingEventId: SPELLS.IRIDESCENCE_RED.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: IRIDESCENCE_RED_CAST_SPELLS.map((spell) => spell.id),
    referencedEventType: [EventType.Cast, EventType.EmpowerEnd],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: IRIDESCENCE_RED_BACKWARDS_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS.IRIDESCENCE_TALENT);
    },
    additionalCondition(_linkingEvent, referencedEvent) {
      // We don't want to link to empower cast event
      // easier to deal with it in this castlink rather than making another one
      return (
        referencedEvent.type === EventType.EmpowerEnd ||
        ![SPELLS.FIRE_BREATH.id, SPELLS.FIRE_BREATH_FONT.id].includes(
          (referencedEvent as CastEvent).ability.guid,
        )
      );
    },
  },
  {
    linkRelation: IRIDESCENCE_BLUE_CONSUME,
    reverseLinkRelation: IRIDESCENCE_BLUE_CONSUME,
    linkingEventId: SPELLS.IRIDESCENCE_BLUE.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: IRIDESCENCE_BLUE_CAST_SPELLS.map((spell) => spell.id),
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
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
   *
   * This also works as a "is this from a chain" check, used for the Disintegrate module
   * FIXME: This should be removed once a better way to link chained cast events together is implemented
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

      return pyreHitIsUnique(linkingEvent as CastEvent, referencedEvent as DamageEvent, 3);
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

      return pyreHitIsUnique(linkingEvent as CastEvent, referencedEvent as DamageEvent);
    },
  },
  {
    linkRelation: DISINTEGRATE_DEBUFF,
    reverseLinkRelation: DISINTEGRATE_DEBUFF,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.DISINTEGRATE.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    forwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: MASS_DISINTEGRATE_CONSUME,
    reverseLinkRelation: MASS_DISINTEGRATE_CONSUME,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MASS_DISINTEGRATE_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive: (c) => c.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT),
    maximumLinks: 1,
  },
  {
    linkRelation: DISINTEGRATE_TICK,
    reverseLinkRelation: DISINTEGRATE_TICK,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.DISINTEGRATE.id,
    referencedEventType: EventType.Cast,
    anyTarget: false,
    backwardBufferMs: DISINTEGRATE_TICK_BUFFER,
    maximumLinks: 1,
  },
  {
    linkRelation: MASS_DISINTEGRATE_TICK,
    reverseLinkRelation: MASS_DISINTEGRATE_TICK,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.DISINTEGRATE.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: DISINTEGRATE_TICK_BUFFER,
    isActive: (c) => c.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT),
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(linkingEvent, DISINTEGRATE_TICK) &&
        encodeEventTargetString(linkingEvent) !== encodeEventTargetString(referencedEvent)
      );
    },
  },
  {
    linkRelation: MASS_DISINTEGRATE_DEBUFF,
    reverseLinkRelation: MASS_DISINTEGRATE_DEBUFF,
    linkingEventId: SPELLS.DISINTEGRATE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.DISINTEGRATE.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    isActive: (c) => c.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT),
    maximumLinks: (c) => GetMaxDisintegrateTargetCount(c) - 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return encodeEventTargetString(linkingEvent) !== encodeEventTargetString(referencedEvent);
    },
  },
  {
    linkRelation: FIRE_BREATH_DEBUFF,
    reverseLinkRelation: FIRE_BREATH_DEBUFF,
    linkingEventId: [SPELLS.FIRE_BREATH.id, SPELLS.FIRE_BREATH_FONT.id],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.FIRE_BREATH_DOT.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: DAMAGE_LINK,
    reverseLinkRelation: CAST_LINK,
    linkingEventId: SPELLS.AZURE_STRIKE.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.AZURE_STRIKE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: DAMAGE_LINK,
    reverseLinkRelation: CAST_LINK,
    linkingEventId: SPELLS.AZURE_SWEEP.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.AZURE_SWEEP.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    isActive: (c) => c.hasTalent(TALENTS.AZURE_SWEEP_TALENT),
  },
  {
    linkRelation: CAST_LINK,
    reverseLinkRelation: DAMAGE_LINK,
    linkingEventId: SPELLS.DEEP_BREATH_DAM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: DEEP_BREATH_SPELL_IDS,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: DEEP_BREATH_FLIGHT_TIME_MS,
    maximumLinks: 1,
  },
  {
    linkRelation: AZURE_SWEEP_CONSUME,
    linkingEventId: SPELLS.AZURE_SWEEP_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.AZURE_SWEEP.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AZURE_SWEEP_TALENT),
  },
  {
    linkRelation: AZURE_SWEEP_GENERATE,
    reverseLinkRelation: AZURE_SWEEP_GENERATE,
    linkingEventId: [SPELLS.ETERNITY_SURGE.id, SPELLS.ETERNITY_SURGE_FONT.id],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.AZURE_SWEEP_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.AZURE_SWEEP_TALENT),
  },
  {
    linkRelation: SHATTERING_STAR_DAMAGE,
    reverseLinkRelation: ETERNITY_SURGE_SHATTER_STAR_LINK,
    linkingEventId: SPELLS.ETERNITY_SURGE_DAM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.SHATTERING_STAR_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: SHATTERING_STAR_TRAVEL_TIME,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.SHATTERING_STARS_TALENT),
  },
  {
    linkRelation: CAST_LINK,
    reverseLinkRelation: DAMAGE_LINK,
    linkingEventId: SPELLS.TWIN_FLAME.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.TWIN_FLAME.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    backwardBufferMs: TWIN_FLAME_TRAVEL_TIME_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.TWIN_FLAME_TALENT),
  },
  {
    linkRelation: CONSUME_FLAME_TICK,
    reverseLinkRelation: FIRE_BREATH_REMOVE_DEBUFF,
    linkingEventId: SPELLS.FIRE_BREATH_DOT.id,
    linkingEventType: EventType.RemoveDebuff,
    referencedEventId: SPELLS.CONSUME_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: FIRE_BREATH_REMOVE_CONSUME_FLAME_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.CONSUME_FLAME_TALENT),
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
  if (event.ability.guid === TALENTS.DRAGONRAGE_TALENT.id) {
    return GetRelatedEvents<DamageEvent>(event, PYRE_DRAGONRAGE);
  }
  return GetRelatedEvents<DamageEvent>(event, PYRE_CAST);
}

function pyreHitIsUnique(castEvent: CastEvent, damageEvent: DamageEvent, maxHitsAllowed = 1) {
  /** Since Pyre can only hit a target once per cast
   * we need to check if it's the same target
   * Dragonrage shoots out 3 pyres so we need to count */
  const previousEvents = getPyreEvents(castEvent);
  if (previousEvents.length > 0) {
    const targetHitCount = previousEvents.filter(
      (e) => encodeEventTargetString(e) === encodeEventTargetString(damageEvent),
    );
    return targetHitCount.length < maxHitsAllowed;
  }

  return true;
}

/** Returns the number of targets that was hit by a Disintegrate cast */
export function getDisintegrateTargetCount(event: CastEvent) {
  return getDisintegrateDebuffEvents(event).length;
}

/** Returns the number of extra targets that was hit by a Mass Disintegrate cast */
export function getMassDisintegrateTargetCount(event: CastEvent) {
  return GetRelatedEvents<ApplyDebuffEvent | RefreshDebuffEvent>(event, MASS_DISINTEGRATE_DEBUFF)
    .length;
}

/** Returns the apply/refresh debuff events that were caused by a Disintegrate cast */
export function getDisintegrateDebuffEvents(
  event: CastEvent,
): (ApplyDebuffEvent | RefreshDebuffEvent)[] {
  return [
    ...GetRelatedEvents<ApplyDebuffEvent | RefreshDebuffEvent>(event, DISINTEGRATE_DEBUFF),
    ...GetRelatedEvents<ApplyDebuffEvent | RefreshDebuffEvent>(event, MASS_DISINTEGRATE_DEBUFF),
  ];
}

/**
 * Returns the damage events associated with a Disintegrate cast.
 *
 * When `discriminateChainedTicks` is enabled, the returned events are adjusted to account for Disintegrate chaining:
 *  - Damage ticks that were carried over *into* this cast are removed
 *  - Damage ticks that are carried over *from* this cast are added
 *
 * This is intended to be used as an easy path for correctly evaluating modifiers that persist
 * across chained Disintegrate ticks (e.g. Iridescence), but may be expensive
 * depending on call frequency and usage.
 *
 * NOTE: This assumes that the first tick in a chained Disintegrate is the chained tick.
 *
 * @param discriminateChainedTicks If true, will remove ticks that were chained into this cast and add ticks that were chained from this cast
 */
export function getDisintegrateDamageEvents(
  event: CastEvent,
  discriminateChainedTicks = false,
): DamageEvent[] {
  const disintegrateTicks = GetRelatedEvents<DamageEvent>(event, DISINTEGRATE_TICK);
  let massDisintegrateTicks = GetRelatedEvents<DamageEvent>(event, MASS_DISINTEGRATE_TICK);

  if (!discriminateChainedTicks) {
    return [...disintegrateTicks, ...massDisintegrateTicks];
  }

  const chainedFromCast = getChainedFromCast(event);
  if (chainedFromCast) {
    disintegrateTicks.shift();

    // You can only chain into a Mass Disintegrate from another Mass Disintegrate
    if (massDisintegrateTicks.length > 0) {
      const amountOfChainedTicks = Math.min(
        getMassDisintegrateTargetCount(event),
        getMassDisintegrateTargetCount(chainedFromCast),
      );

      if (amountOfChainedTicks > 0) {
        const seenTargets = new Set<string>();

        massDisintegrateTicks = massDisintegrateTicks.filter((tick) => {
          if (seenTargets.size >= amountOfChainedTicks) return true;

          const target = encodeEventTargetString(tick);
          if (seenTargets.has(target)) return true;

          seenTargets.add(target);
          return false;
        });
      }
    }
  }

  const chainedCast = getChainedCast(event);
  if (chainedCast) {
    const chainedCastTicks = GetRelatedEvents<DamageEvent>(chainedCast, DISINTEGRATE_TICK);
    if (chainedCastTicks.length > 0) {
      disintegrateTicks.push(chainedCastTicks[0]);
    }

    // Chaining into a normal Disintegrate won't carry over Mass ticks
    // So this case will only be a Mass Disintegrate chained into another Mass Disintegrate
    const chainedCastMassDisintegrateTicks = GetRelatedEvents<DamageEvent>(
      chainedCast,
      MASS_DISINTEGRATE_TICK,
    );
    if (chainedCastMassDisintegrateTicks.length > 0) {
      const amountOfChainedTicks = Math.min(
        getMassDisintegrateTargetCount(event),
        getMassDisintegrateTargetCount(chainedCast),
      );

      if (amountOfChainedTicks > 0) {
        const seenTargets = new Set<string>();

        for (const tick of chainedCastMassDisintegrateTicks) {
          const target = encodeEventTargetString(tick);
          if (seenTargets.has(target)) continue;

          seenTargets.add(target);
          massDisintegrateTicks.push(tick);

          if (seenTargets.size >= amountOfChainedTicks) break;
        }
      }
    }
  }

  return [...disintegrateTicks, ...massDisintegrateTicks];
}

export function isFromMassDisintegrate(event: CastEvent) {
  return HasRelatedEvent(event, MASS_DISINTEGRATE_CONSUME);
}

export function isMassDisintegrateTick(event: DamageEvent) {
  return HasRelatedEvent(event, MASS_DISINTEGRATE_TICK);
}

export function isMassDisintegrateDebuff(event: ApplyDebuffEvent | RefreshDebuffEvent) {
  return HasRelatedEvent(event, MASS_DISINTEGRATE_DEBUFF);
}

export function isChainedCast(event: CastEvent) {
  return HasRelatedEvent(event, CHAINED_FROM_CAST);
}

export function hasChainedCast(event: CastEvent) {
  return HasRelatedEvent(event, CHAINED_CAST);
}

export function getChainedCast(event: CastEvent) {
  return GetRelatedEvent<CastEvent>(event, CHAINED_CAST);
}

export function getChainedFromCast(event: CastEvent) {
  return GetRelatedEvent<CastEvent>(event, CHAINED_FROM_CAST);
}

/** Get ALL related damage events from a cast event
 *
 * Still WIP so make sure to check if it works for your specific use case
 *
 * The main use case currently for this is Iridescence
 */
export function getDamageEventsFromCast(event: CastEvent): DamageEvent[] {
  switch (event.ability.guid) {
    case SPELLS.LIVING_FLAME_CAST.id:
      return [
        // TODO: DoT
        getLivingFlameCastHit(event, EventType.Damage),
        ...getLeapingEvents(event, EventType.Damage),
      ].filter((x) => x !== undefined);
    case SPELLS.PYRE.id:
    case SPELLS.PYRE_DENSE_TALENT.id:
    case TALENTS.DRAGONRAGE_TALENT.id:
      return getPyreEvents(event);
    case SPELLS.DISINTEGRATE.id:
      return getDisintegrateDamageEvents(event, true);
  }

  return GetRelatedEvents<DamageEvent>(event, DAMAGE_LINK);
}

/** Get the cast event that triggered the damage event
 *
 * Still WIP so make sure to check if it works for your specific use case
 */
export function getCastEventFromDamage(event: DamageEvent): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, CAST_LINK);
}

export function getIridescenceConsumeEvent(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): CastEvent | EmpowerEndEvent | undefined {
  if (event.ability.guid === SPELLS.IRIDESCENCE_BLUE.id) {
    return GetRelatedEvent<CastEvent>(event, IRIDESCENCE_BLUE_CONSUME);
  }

  return GetRelatedEvent<CastEvent | EmpowerEndEvent>(event, IRIDESCENCE_RED_CONSUME);
}

export function isFromIridescenceConsume(event: CastEvent | EmpowerEndEvent) {
  return (
    HasRelatedEvent(event, IRIDESCENCE_RED_CONSUME) ||
    HasRelatedEvent(event, IRIDESCENCE_BLUE_CONSUME)
  );
}

export function getEternitySurgeDamageEvents(event: EmpowerEndEvent): DamageEvent[] {
  return GetRelatedEvents<DamageEvent>(event, ETERNITY_SURGE_FROM_CAST);
}

export function getAzureSweepBuffEvent(
  event: EmpowerEndEvent,
): ApplyBuffEvent | ApplyBuffStackEvent | undefined {
  return GetRelatedEvent<ApplyBuffEvent | ApplyBuffStackEvent>(event, AZURE_SWEEP_GENERATE);
}

export function getAzureSweepConsumeEvent(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, AZURE_SWEEP_CONSUME);
}

export function getEternitySurgeEventForShatteringStarDamage(
  event: DamageEvent,
): EmpowerEndEvent | undefined {
  const eternitySurgeDamageEvent = GetRelatedEvent<DamageEvent>(
    event,
    ETERNITY_SURGE_SHATTER_STAR_LINK,
  );

  if (!eternitySurgeDamageEvent) {
    return undefined;
  }

  return GetRelatedEvent<EmpowerEndEvent>(eternitySurgeDamageEvent, ETERNITY_SURGE_FROM_CAST);
}

export function getFireBreathDebuffEvents(
  event: EmpowerEndEvent,
): (ApplyDebuffEvent | RefreshDebuffEvent)[] {
  return GetRelatedEvents<ApplyDebuffEvent | RefreshDebuffEvent>(event, FIRE_BREATH_DEBUFF);
}

export function getConsumeFlameTickEvent(event: RemoveDebuffEvent) {
  return GetRelatedEvent<DamageEvent>(event, CONSUME_FLAME_TICK);
}

export default CastLinkNormalizer;
