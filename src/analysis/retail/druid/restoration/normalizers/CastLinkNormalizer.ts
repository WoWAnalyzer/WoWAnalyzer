import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  AbilityEvent,
  AnyEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
  HasTarget,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';

const CAST_BUFFER_MS = 150;
const TRANQ_CHANNEL_BUFFER_MS = 6_000;
const EVERBLOOM_BUFFER_MS = 1500;
const CONVOKE_CHANNEL_BUFFER_MS = 4_200;
// Genesis is granted at the moment the empowering ability is cast, but the applybuff can be logged
// slightly before/after the cast event, so allow a small window in both directions.
const GENESIS_PROC_BUFFER_MS = 500;
const IMPLANT_BUFFER_MS = 250;
/** Twin Sprouts grows the new bloom immediately after a parent bloom — allow a short log delay. */
const TWIN_SPROUTS_BUFFER_MS = 500;

const APPLIED_HEAL = 'AppliedHeal';
const FROM_HARDCAST = 'FromHardcast';
const FROM_CONVOKE = 'FromConvoke';
const FROM_OVERGROWTH = 'FromOvergrowth';
const CONSUMED_NATURES_SWIFTNESS = 'ConsumedNaturesSwiftness';
const CAUSED_TOL_REGROWTHS = 'CausedTreeOfLifeRegrowths';
const FROM_EXPIRING_LIFEBLOOM = 'FromExpiringLifebloom';
const CAUSED_BLOOM = 'CausedBloom';
const CAUSED_TICK = 'CausedTick';
const CAUSED_SUMMON = 'CausedSummon';
const FROM_EVERBLOOM = 'FromEverbloom';
const FROM_BLOOM = 'FromBloom';
const GENESIS_FROM_TIER_CD = 'GenesisFromTierCooldown';
const FROM_IMPLANT = 'FromImplant';
const FROM_TWIN_SPROUTS = 'FromTwinSprouts';
const CAUSED_TWIN_SPROUTS = 'CausedTwinSprouts';
const CAUSED_NATURES_BOUNTY = 'CausedNaturesBounty';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: APPLIED_HEAL,
    reverseLinkRelation: FROM_CONVOKE,
    linkingEventId: SPELLS.CONVOKE_SPIRITS.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: [
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
      SPELLS.REGROWTH.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.SWIFTMEND.id,
      SPELLS.TRANQUILITY_HEAL.id,
    ],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    forwardBufferMs: CONVOKE_CHANNEL_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: [SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.REJUVENATION.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition: (linkingEvent: AnyEvent) => !HasRelatedEvent(linkingEvent, FROM_CONVOKE),
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.REGROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    referencedEventId: SPELLS.REGROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition: (linkingEvent: AnyEvent) => !HasRelatedEvent(linkingEvent, FROM_CONVOKE),
  },
  {
    // Nature's Bounty: Regrowth's direct heal also heals other allies who have Regrowth
    linkRelation: CAUSED_NATURES_BOUNTY,
    linkingEventId: SPELLS.REGROWTH.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.NATURES_BOUNTY.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.NATURES_BOUNTY_TALENT),
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.WILD_GROWTH.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.WILD_GROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.SWIFTMEND.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.SWIFTMEND.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    // for discerning hardcasts from reforestation procs
    linkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.INCARNATION_TOL_ALLOWED.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    // for discerning hardcast and CG summons
    linkRelation: CAUSED_SUMMON,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: [SPELLS.SWIFTMEND.id, SPELLS.WILD_GROWTH.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.GROVE_GUARDIANS_SUMMON.id,
    referencedEventType: EventType.Summon,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true, // the summon event 'targets' the summon, while cast targets a player
    maximumLinks: 1,
  },
  {
    linkRelation: CAUSED_SUMMON,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.CONVOKE_SPIRITS.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.GROVE_GUARDIANS_SUMMON.id,
    referencedEventType: EventType.Summon,
    forwardBufferMs: CONVOKE_CHANNEL_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true, // the summon event 'targets' the summon, while cast targets a player
    maximumLinks: 6, // convoke can cast 0-2 wild growths and 2-4 swiftmends, so up to 6 GG summons can be expected
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.LIFEBLOOM_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.LIFEBLOOM_HOT_HEAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // linking lifebloom's bloom heal to the buff refresh (pandemic) or removal (expiry)
  // that caused it. Uses LIFEBLOOM_BUFF (1227806), not LIFEBLOOM_HOT_HEAL (33763) —
  // 33763 refreshbuffs are Everbloom stack gains and do not indicate a natural bloom.
  // Must run before the Everbloom link so pandemic refreshes / natural expiries are not
  // claimed by a nearby Swiftmend.
  {
    linkRelation: FROM_EXPIRING_LIFEBLOOM,
    reverseLinkRelation: CAUSED_BLOOM,
    linkingEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBLOOM_BUFF.id,
    referencedEventType: [EventType.RefreshBuff, EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  // linking Swiftmend heals to the 3-bloom Everbloom sequence they trigger
  {
    linkRelation: CAUSED_BLOOM,
    reverseLinkRelation: FROM_EVERBLOOM,
    linkingEventId: SPELLS.SWIFTMEND.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: EVERBLOOM_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 3,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT),
    additionalCondition: (_linkingEvent: AnyEvent, referencedEvent: AnyEvent) =>
      !HasRelatedEvent(referencedEvent, FROM_EVERBLOOM) &&
      !HasRelatedEvent(referencedEvent, FROM_EXPIRING_LIFEBLOOM),
  },
  {
    // initial Tree of Life shapeshift can instantly apply up to 3 Regrowths
    linkRelation: CAUSED_TOL_REGROWTHS,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.REGROWTH.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    forwardBufferMs: 500,
    anyTarget: true,
    maximumLinks: 6,
  },
  {
    linkRelation: CAUSED_TICK,
    linkingEventId: SPELLS.TRANQUILITY_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TRANQUILITY_HEAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: TRANQ_CHANNEL_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    // for discerning hardcast Tranquility healing from Convoke-procced Tranquility healing
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: APPLIED_HEAL,
    linkingEventId: SPELLS.TRANQUILITY_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.TRANQUILITY_HEAL.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  // linking Everbloom splash healing to the Lifebloom bloom that triggered it
  {
    linkRelation: FROM_BLOOM,
    linkingEventId: SPELLS.EVERBLOOM_SPLASH_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
  // linking Verdancy heal to the bloom that triggered it
  {
    linkRelation: FROM_BLOOM,
    linkingEventId: SPELLS.VERDANCY.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBLOOM_BLOOM_HEAL.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
  // Season 2 4pc: Nature's Swiftness, Tranquility, and Incarnation: ToL / Convoke the Spirits have a
  // 100% chance to grant Genesis. Link the Genesis application to the empowering cast so we can tell
  // 4pc-granted stacks apart from the 2pc Rejuvenation procs (same buff ID).
  {
    linkRelation: GENESIS_FROM_TIER_CD,
    linkingEventId: SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: [
      SPELLS.NATURES_SWIFTNESS.id,
      SPELLS.TRANQUILITY_CAST.id,
      TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
      SPELLS.CONVOKE_SPIRITS.id,
    ],
    referencedEventType: EventType.Cast,
    forwardBufferMs: GENESIS_PROC_BUFFER_MS,
    backwardBufferMs: GENESIS_PROC_BUFFER_MS,
    anyTarget: true,
    isActive: (c) => c.has4PieceByTier(TIERS.MID2),
  },
  // Implant: Symbiotic Bloom from Swiftmend (same target)
  {
    linkRelation: FROM_IMPLANT,
    linkingEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.SWIFTMEND.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: IMPLANT_BUFFER_MS,
    backwardBufferMs: IMPLANT_BUFFER_MS,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.IMPLANT_TALENT),
  },
  // Implant: Symbiotic Bloom from Wild Growth cast
  {
    linkRelation: FROM_IMPLANT,
    linkingEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.WILD_GROWTH.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: IMPLANT_BUFFER_MS,
    backwardBufferMs: IMPLANT_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.IMPLANT_TALENT),
    additionalCondition: (bloom: AnyEvent) => !HasRelatedEvent(bloom, FROM_IMPLANT),
  },
  // Implant: Symbiotic Bloom from Convoke Wild Growth (no cast event)
  {
    linkRelation: FROM_IMPLANT,
    linkingEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.WILD_GROWTH.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: IMPLANT_BUFFER_MS,
    backwardBufferMs: IMPLANT_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.IMPLANT_TALENT),
    additionalCondition: (bloom: AnyEvent, wgApply: AnyEvent) =>
      !HasRelatedEvent(bloom, FROM_IMPLANT) && HasRelatedEvent(wgApply, FROM_CONVOKE),
  },
  // Twin Sprouts: when a Symbiotic Bloom grows, 30% chance to grow another on a nearby target
  {
    linkRelation: FROM_TWIN_SPROUTS,
    reverseLinkRelation: CAUSED_TWIN_SPROUTS,
    linkingEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    backwardBufferMs: TWIN_SPROUTS_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS_DRUID.TWIN_SPROUTS_TALENT),
    additionalCondition: (twin: AnyEvent, parent: AnyEvent) =>
      HasTarget(twin) &&
      HasTarget(parent) &&
      twin.targetID !== parent.targetID &&
      !HasRelatedEvent(twin, FROM_IMPLANT) &&
      !HasRelatedEvent(parent, CAUSED_TWIN_SPROUTS),
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/Heal linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for the buffs Rejuvenation, Regrowth, Wild Growth, Lifebloom,
 * and for the direct heals of Swiftmend and Regrowth, and the self buff from Flourish.
 *
 * Overgrowth: Nature's Swiftness + Regrowth applies Rejuv / Lifebloom / Wild Growth with no
 * separate hardcast of those spells. Those applybuffs are linked to the empowering Regrowth cast
 * via FROM_OVERGROWTH. NS consumption is detected by linking the Regrowth cast to the Nature's
 * Swiftness RemoveBuff (hasBuff is unavailable during normalize). Implant Symbiotic Blooms from
 * that WG effect are linked after FROM_OVERGROWTH is established (same pattern as Convoke WG).
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      ...EVENT_LINKS,
      // NS consumed by Regrowth (Overgrowth trigger). Must run before Overgrowth HoT links.
      {
        linkRelation: CONSUMED_NATURES_SWIFTNESS,
        linkingEventId: SPELLS.REGROWTH.id,
        linkingEventType: EventType.Cast,
        referencedEventId: SPELLS.NATURES_SWIFTNESS.id,
        referencedEventType: EventType.RemoveBuff,
        forwardBufferMs: CAST_BUFFER_MS,
        backwardBufferMs: CAST_BUFFER_MS,
        anyTarget: true, // NS is on the player; Regrowth targets an ally
        maximumLinks: 1,
        isActive: (c) => c.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT),
      },
      // Overgrowth HoTs: Rejuv / Germination / WG / Lifebloom apply from NS+Regrowth (no own cast)
      {
        linkRelation: FROM_OVERGROWTH,
        reverseLinkRelation: APPLIED_HEAL,
        linkingEventId: [
          SPELLS.REJUVENATION.id,
          SPELLS.REJUVENATION_GERMINATION.id,
          SPELLS.WILD_GROWTH.id,
          SPELLS.LIFEBLOOM_BUFF.id,
        ],
        linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
        referencedEventId: SPELLS.REGROWTH.id,
        referencedEventType: EventType.Cast,
        forwardBufferMs: CAST_BUFFER_MS,
        backwardBufferMs: CAST_BUFFER_MS,
        maximumLinks: 1,
        isActive: (c) => c.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT),
        additionalCondition: (linkingEvent: AnyEvent, regrowthCast: AnyEvent) =>
          !HasRelatedEvent(linkingEvent, FROM_HARDCAST) &&
          !HasRelatedEvent(linkingEvent, FROM_CONVOKE) &&
          HasRelatedEvent(regrowthCast, CONSUMED_NATURES_SWIFTNESS),
      },
      // Implant: Symbiotic Bloom from Overgrowth Wild Growth (no WG cast — must follow FROM_OVERGROWTH)
      {
        linkRelation: FROM_IMPLANT,
        linkingEventId: SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
        linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
        referencedEventId: SPELLS.WILD_GROWTH.id,
        referencedEventType: EventType.ApplyBuff,
        forwardBufferMs: IMPLANT_BUFFER_MS,
        backwardBufferMs: IMPLANT_BUFFER_MS,
        anyTarget: true,
        maximumLinks: 1,
        isActive: (c) =>
          c.hasTalent(TALENTS_DRUID.IMPLANT_TALENT) && c.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT),
        additionalCondition: (bloom: AnyEvent, wgApply: AnyEvent) =>
          !HasRelatedEvent(bloom, FROM_IMPLANT) && HasRelatedEvent(wgApply, FROM_OVERGROWTH),
      },
    ]);
  }
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcast(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

/** Returns true iff the given buff application or heal can be matched back to Convoke */
export function isFromConvoke(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_CONVOKE);
}

/** Returns true iff this Symbiotic Bloom came from Implant (Swiftmend / Wild Growth / Overgrowth) */
export function isFromImplant(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_IMPLANT);
}

/**
 * Returns true iff this Implant Symbiotic Bloom was spawned by Overgrowth's Wild Growth effect
 * (linked to a FROM_OVERGROWTH WG apply, not a WG cast / Swiftmend / Convoke).
 */
export function isImplantFromOvergrowth(event: AbilityEvent<any>): boolean {
  return GetRelatedEvents(event, FROM_IMPLANT).some(
    (e) =>
      e.type === EventType.ApplyBuff &&
      HasAbility(e) &&
      e.ability.guid === SPELLS.WILD_GROWTH.id &&
      HasRelatedEvent(e, FROM_OVERGROWTH),
  );
}

/** Returns true iff this Symbiotic Bloom grew from a Twin Sprouts proc off another bloom's growth */
export function isFromTwinSprouts(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_TWIN_SPROUTS);
}

/** Returns true iff the HoT apply/refresh came from Overgrowth (NS+Regrowth) */
export function isFromOvergrowth(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, FROM_OVERGROWTH);
}

/** Returns the hardcast event that caused this buff or heal, if there is one */
export function getHardcast(event: AbilityEvent<any>): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    FROM_HARDCAST,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

/** Returns the buff application and direct heal events caused by the given hardcast */
export function getHeals(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, APPLIED_HEAL);
}

/** Returns true iff the given Regrowth came from the initial Tree of Life shapeshift cast */
export function isFromTreeOfLifeCast(event: AbilityEvent<any>): boolean {
  return (
    HasRelatedEvent(event, CAUSED_TOL_REGROWTHS) ||
    GetRelatedEvents<CastEvent>(
      event,
      FROM_HARDCAST,
      (e): e is CastEvent =>
        e.type === EventType.Cast &&
        e.ability.guid === TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
    ).length > 0
  );
}

/** Returns the direct heal event caused by this hardcast, if there is one */
export function getDirectHeal(event: CastEvent): HealEvent | undefined {
  return getHeals(event)
    .filter((e): e is HealEvent => e.type === EventType.Heal)
    .pop();
}

/** Returns Nature's Bounty cleave heals caused by this Regrowth cast (excludes primary target) */
export function getNaturesBountyHeals(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(
    event,
    CAUSED_NATURES_BOUNTY,
    (e): e is HealEvent => e.type === EventType.Heal,
  );
}

/** Returns true iff the given bloom heal can be linked to a Lifebloom buff refresh
 *  (pandemic) or removal (expiry) - used to differentiate from a Photosynthesis proc */
export function isFromExpiringLifebloom(event: HealEvent): boolean {
  return HasRelatedEvent(event, FROM_EXPIRING_LIFEBLOOM);
}

/** Returns true iff the bloom heal can be linked to an Everbloom-triggered Swiftmend (hardcast or Convoke) */
export function isFromEverbloom(event: HealEvent): boolean {
  return HasRelatedEvent(event, FROM_EVERBLOOM);
}

/** Returns true iff the Lifebloom buff refresh or removal caused a bloom to proc */
export function causedBloom(event: RemoveBuffEvent | RefreshBuffEvent): boolean {
  return HasRelatedEvent(event, CAUSED_BLOOM);
}

/** Gets the tranquility "tick cast" events caused by channeling the given Tranquility w/
 *  cast ID `TRANQUILITY_CAST`. */
export function getTranquilityTicks(event: CastEvent): AnyEvent[] {
  return GetRelatedEvents(event, CAUSED_TICK);
}

/** Returns true iff this Genesis application was granted by a Season 2 4pc empowering cast
 *  (Nature's Swiftness, Tranquility, Incarnation: Tree of Life, or Convoke the Spirits) rather
 *  than by the 2pc Rejuvenation proc. */
export function isGenesisFromTierCooldown(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, GENESIS_FROM_TIER_CD);
}

/** Returns the bloom heal event that triggered this Verdancy heal, if linked */
export function getSourceBloom(event: HealEvent): HealEvent | undefined {
  return GetRelatedEvents<HealEvent>(
    event,
    FROM_BLOOM,
    (e): e is HealEvent => e.type === EventType.Heal,
  ).pop();
}

export default CastLinkNormalizer;
