import Spell from 'common/SPELLS/Spell';
import PhaseConfig from 'parser/core/PhaseConfig';
import * as React from 'react';

import EventFilter from './EventFilter';
import { PetInfo } from './Pet';
import { PlayerInfo } from './Player';
import { EventLink } from './EventLinkNormalizer';

export enum EventType {
  Destroy = 'destroy', // super rare, apparently happens on dausegne, no idea what it is?
  Heal = 'heal',
  HealAbsorbed = 'healabsorbed',
  Absorbed = 'absorbed',
  Damage = 'damage',
  BeginCast = 'begincast',
  Cast = 'cast',
  Drain = 'drain',
  ApplyBuff = 'applybuff',
  ApplyDebuff = 'applydebuff',
  ApplyBuffStack = 'applybuffstack',
  ApplyDebuffStack = 'applydebuffstack',
  RemoveBuffStack = 'removebuffstack',
  RemoveDebuffStack = 'removedebuffstack',
  ChangeBuffStack = 'changebuffstack',
  ChangeDebuffStack = 'changedebuffstack',
  RefreshBuff = 'refreshbuff',
  RefreshDebuff = 'refreshdebuff',
  RemoveBuff = 'removebuff',
  RemoveDebuff = 'removedebuff',
  Summon = 'summon',
  ResourceChange = 'resourcechange',
  Interrupt = 'interrupt',
  Death = 'death',
  Resurrect = 'resurrect',
  CombatantInfo = 'combatantinfo',
  Instakill = 'instakill',
  AuraBroken = 'aurabroken',
  ExtraAttacks = 'extraattacks',
  OrbGenerated = 'orb-generated',
  Create = 'create',
  Spellsteal = 'spellsteal',
  EmpowerStart = 'empowerstart',
  EmpowerEnd = 'empowerend',
  Leech = 'leech',

  // Fabricated:
  Event = 'event', // everything
  FightEnd = 'fightend',
  GlobalCooldown = 'globalcooldown',
  AutoAttackCooldown = 'autoattackcooldown',
  BeginChannel = 'beginchannel',
  EndChannel = 'endchannel',
  CancelChannel = 'cancelchannel',
  UpdateSpellUsable = 'updatespellusable',
  BeaconTransfer = 'beacontransfer',
  BeaconTransferFailed = 'beacontransferfailed',
  ChangeStats = 'changestats',
  ChangeHaste = 'changehaste',
  MaxChargesIncreased = 'maxchargesincreased',
  MaxChargesDecreased = 'maxchargesdecreased',
  Health = 'health',
  Adds = 'adds',
  Dispel = 'dispel',
  Time = 'time',
  Test = 'test',
  SpendResource = 'spendresource',
  // casts that are triggered for free by something else
  FreeCast = 'freecast',

  // Demon Hunter
  ConsumeSoulFragments = 'consumesoulfragments',

  // Hunter
  Tick = 'tick',

  // Monk
  AddStagger = 'addstagger',
  RemoveStagger = 'removestagger',

  // Priest
  Atonement = 'atonement',
  AtonementDamage = 'atonementDamageSource',
  AtonementApplied = 'atonement_applied',
  AtonementFaded = 'atonement_faded',
  AtonementRefresh = 'atonement_refresh',
  AtonementRefreshImproper = 'atonement_refresh_improper',
  SpiritShell = 'spirit_shell',

  // Paladin
  BeaconApplied = 'beacon_applied',
  BeaconRemoved = 'beacon_removed',

  //Shaman
  FeedHeal = 'feed_heal',

  // Warlock
  FullShardGained = 'fullshardgained',

  // Phases:
  PhaseStart = 'phasestart',
  PhaseEnd = 'phaseend',

  // Time Filtering:
  FilterCooldownInfo = 'filtercooldowninfo',
  FilterBuffInfo = 'filterbuffinfo',

  // Resource Caps
  BeginResourceCap = 'beginresourcecap',
  EndResourceCap = 'endresourcecap',
}

export interface AddStaggerEvent extends Event<EventType.AddStagger> {
  amount: number;
  overheal: number;
  newPooledDamage: number;
  extraAbility?: Ability;
  trigger?: AbsorbedEvent;
}

export interface RemoveStaggerEvent extends Event<EventType.RemoveStagger> {
  amount: number;
  overheal: number;
  newPooledDamage: number;
  trigger?: CastEvent | DeathEvent;
  sourceBreakdown?: { base: number } & Record<number, number>;
}

type MappedEventTypes = {
  [EventType.Event]: Event<EventType.Event>;
  [EventType.FreeCast]: FreeCastEvent;
  [EventType.Heal]: HealEvent;
  [EventType.Absorbed]: AbsorbedEvent;
  [EventType.Damage]: DamageEvent;
  [EventType.BeginCast]: BeginCastEvent;
  [EventType.Cast]: CastEvent;
  [EventType.ApplyBuff]: ApplyBuffEvent;
  [EventType.ApplyDebuff]: ApplyDebuffEvent;
  [EventType.ApplyBuffStack]: ApplyBuffStackEvent;
  [EventType.ApplyDebuffStack]: ApplyDebuffStackEvent;
  [EventType.RemoveBuffStack]: RemoveBuffStackEvent;
  [EventType.RemoveDebuffStack]: RemoveDebuffStackEvent;
  [EventType.ChangeBuffStack]: ChangeBuffStackEvent;
  [EventType.ChangeDebuffStack]: ChangeDebuffStackEvent;
  [EventType.RefreshBuff]: RefreshBuffEvent;
  [EventType.RefreshDebuff]: RefreshDebuffEvent;
  [EventType.RemoveBuff]: RemoveBuffEvent;
  [EventType.RemoveDebuff]: RemoveDebuffEvent;
  [EventType.Summon]: SummonEvent;
  [EventType.ResourceChange]: ResourceChangeEvent;
  [EventType.Drain]: DrainEvent;
  [EventType.Death]: DeathEvent;
  [EventType.CombatantInfo]: CombatantInfoEvent;
  [EventType.Dispel]: DispelEvent;
  [EventType.AuraBroken]: AuraBrokenEvent;
  [EventType.ExtraAttacks]: ExtraAttacksEvent;
  [EventType.Create]: CreateEvent;
  [EventType.Spellsteal]: SpellstealEvent;
  [EventType.EmpowerStart]: EmpowerStartEvent;
  [EventType.EmpowerEnd]: EmpowerEndEvent;
  [EventType.Leech]: LeechEvent;

  // Fabricated:
  [EventType.FightEnd]: FightEndEvent;
  [EventType.GlobalCooldown]: GlobalCooldownEvent;
  [EventType.AutoAttackCooldown]: AutoAttackCooldownEvent;
  [EventType.BeginChannel]: BeginChannelEvent;
  [EventType.EndChannel]: EndChannelEvent;
  [EventType.UpdateSpellUsable]: UpdateSpellUsableEvent;
  [EventType.MaxChargesIncreased]: MaxChargesIncreasedEvent;
  [EventType.MaxChargesDecreased]: MaxChargesDecreasedEvent;
  [EventType.ChangeStats]: ChangeStatsEvent;
  [EventType.SpendResource]: SpendResourceEvent;
  [EventType.FeedHeal]: FeedHealEvent;
  [EventType.AddStagger]: AddStaggerEvent;
  [EventType.RemoveStagger]: RemoveStaggerEvent;
  [EventType.BeaconTransfer]: BeaconHealEvent;
  [EventType.BeaconTransferFailed]: BeaconTransferFailedEvent;

  // Phases:
  [EventType.PhaseStart]: PhaseStartEvent;
  [EventType.PhaseEnd]: PhaseEndEvent;

  // Time Filtering:
  [EventType.FilterCooldownInfo]: FilterCooldownInfoEvent;
  [EventType.FilterBuffInfo]: FilterBuffInfoEvent;
};

export interface Ability {
  /** The ability's name */
  name: string;
  /**
   * The ability's ID - this uniquely identifies the ability,
   * as there are sometimes multiple different abilities with the same name,
   * but they'll have different guids
   */
  guid: number;
  /** The ability's spell school. See {@link MAGIC_SCHOOLS}. */
  type: number;
  /** The resource name for the ability's icon */
  abilityIcon: string;
}

export const isAbility = (x: unknown): x is Ability => {
  const typedObj = x as Ability;
  return (
    ((typedObj !== null && typeof typedObj === 'object') || typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    typeof typedObj['guid'] === 'number' &&
    typeof typedObj['type'] === 'number' &&
    typeof typedObj['abilityIcon'] === 'string'
  );
};

/** The state of the TARGET'S resource. Each ClassResources refers to a specific resource.
 *  Events typically will have an array of these objects, one object per resource.
 *  All the player's resources are not guaranteed to show! Only the ones changing. */
export interface ClassResources {
  /** The amount of the resource the target has.
   *  Can be before or after the event depending on event... TODO document which and when */
  amount: number;
  /** The maximum amount of resource the target can have */
  max: number;
  /** The type of resource this is for (see {@link RESOURCE_TYPES} */
  type: number;
  /** The amount of resource being spent in this event (only spenders will fill this) */
  cost?: number;
}

// TODO: Find a good place for this
export enum Class {
  DemonHunter = 'Demon Hunter',
  DeathKnight = 'Death Knight',
  Druid = 'Druid',
  Evoker = 'Evoker',
  Hunter = 'Hunter',
  Mage = 'Mage',
  Monk = 'Monk',
  Paladin = 'Paladin',
  Priest = 'Priest',
  Rogue = 'Rogue',
  Shaman = 'Shaman',
  Warrior = 'Warrior',
  Warlock = 'Warlock',
}

/** Mapping for numbers in the resourceActor field */
export enum ResourceActor {
  Source = 1,
  Target = 2,
}

/**
 * Event meta information filled in by various modules.
 */
export interface EventMeta {
  isInefficientCast?: boolean;
  inefficientCastReason?: React.ReactNode;
  isEnhancedCast?: boolean;
  enhancedCastReason?: React.ReactNode;
}

export type AbilityEvent<T extends string> = Event<T> & { ability: Ability };
export type SourcedEvent<T extends string> = Event<T> & {
  sourceID: number;
  sourceInstance?: number;
  sourceIsFriendly: boolean;
};
export type TargettedEvent<T extends string> = Event<T> & {
  targetID: number;
  targetInstance?: number;
  targetIsFriendly: boolean;
};
export type HitpointsEvent<T extends string> = Event<T> & {
  hitPoints: number;
  maxHitPoints: number;
};

export type LocationEvent<T extends string> = Event<T> & { x: number; y: number };

export function HasAbility<T extends EventType>(event: Event<T>): event is AbilityEvent<T> {
  return (event as AbilityEvent<T>).ability !== undefined;
}

export function HasSource<T extends EventType>(event: Event<T>): event is SourcedEvent<T> {
  return (event as SourcedEvent<T>).sourceID !== undefined;
}

export function HasTarget<T extends EventType>(event: Event<T>): event is TargettedEvent<T> {
  return (event as TargettedEvent<T>).targetID !== undefined;
}

export function HasHitpoints<T extends EventType>(event: Event<T>): event is HitpointsEvent<T> {
  return (event as HitpointsEvent<T>).hitPoints !== undefined;
}

export function HasLocation<T extends EventType>(event: Event<T>): event is LocationEvent<T> {
  const locEvent = event as Partial<LocationEvent<T>>;
  return (
    'x' in locEvent && 'y' in locEvent && Number.isFinite(locEvent.x) && Number.isFinite(locEvent.y)
  );
}

/** Gets the events related to the given event with the given relation (key). Events will not
 *  by default have any relations, you must add them with an {@link EventLinkNormalizer}. */
export function GetRelatedEvents<T extends AnyEvent>(event: AnyEvent, relation: string): T[];
export function GetRelatedEvents<T extends AnyEvent>(
  event: AnyEvent,
  relation: string,
  filter: ((e: AnyEvent) => boolean) | undefined,
): T[];
export function GetRelatedEvents<T extends AnyEvent>(
  event: AnyEvent,
  relation: string,
  filter?: (e: AnyEvent) => boolean,
): T[] {
  const relatedEvents =
    event?._linkedEvents?.filter((le) => le.relation === relation).map((le) => le.event as T) ?? [];
  if (filter) {
    return relatedEvents.filter(filter);
  } else {
    return relatedEvents;
  }
}

/** Gets the first event related to the given event with the given relation (key). Events will not
 * by default have any relations, you must hadd them with an {@link EventLinkNormalizer}. */
export function GetRelatedEvent<T extends AnyEvent>(
  event: AnyEvent,
  relation: string,
): T | undefined;
export function GetRelatedEvent<T extends AnyEvent>(
  event: AnyEvent,
  relation: string,
  filter: ((e: AnyEvent) => boolean) | undefined,
): T | undefined;
export function GetRelatedEvent<T extends AnyEvent>(
  event: AnyEvent,
  relation: string,
  filter?: (e: AnyEvent) => boolean,
): T | undefined {
  const relatedEvents = GetRelatedEvents<T>(event, relation, filter);
  if (relatedEvents.length >= 1) {
    return relatedEvents.at(0);
  }
}

/** Returns true iff the given event has a relation with the given relation (key). Events will not
 *  by default have any relations, you must add them with an {@link EventLinkNormalizer}. */
export function HasRelatedEvent(event: AnyEvent, relation: string): boolean {
  return event?._linkedEvents?.find((le) => le.relation === relation) !== undefined;
}

/** Adds a relation between events using the `_linkedEvents` field.
 *  This should not be done manually, use {@link EventLinkNormalizer} */
export function AddRelatedEvent(event: AnyEvent, relation: string, relatedEvent: AnyEvent): void {
  if (!event?._linkedEvents) {
    event._linkedEvents = [];
  }
  event._linkedEvents.push({ relation, event: relatedEvent });
  event.__modified = true;
}

export type AnyEvent<T extends EventType = EventType> = T extends keyof MappedEventTypes
  ? MappedEventTypes[T]
  : Event<T>;

// TODO Eventually convert this back from string to EventType (once the edge cases of raw string filters are removed)
export interface Event<T extends string> {
  /** Event type string */
  type: T;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** True iff the event happened before the pull. Added by WoWA */
  prepull?: boolean;
  /** Other events associated with this event. Added by WoWA normalizers. Meaning is context sensitive */
  _linkedEvents?: LinkedEvent[];
  /** Set of eventLinks that have been processed already to avoid duplicated linking */
  _processedLinks?: Set<EventLink>;
  /** True iff the event was created by WoWA */
  __fabricated?: boolean;
  /** True iff the event's content was modified by WoWA */
  __modified?: boolean;
  /** True iff a WoWA normalizer reordered this event */
  __reordered?: boolean;
}

// TODO way to specify specific expected event type?
interface LinkedEvent {
  /** A string specifying the relationship of the linked event. Will be used as a key during lookup */
  relation: string;
  /** The linked event */
  event: AnyEvent;
}

interface CastTarget {
  name: string;
  id: number;
  guid: number;
  type: string;
  icon: string;
}

export interface BeginCastEvent extends Event<EventType.BeginCast> {
  ability: Ability;
  castEvent: CastEvent | null;
  channel: {
    type: EventType.BeginChannel;
    timestamp: number;
    ability: Ability;
    sourceID: number;
    isCancelled: boolean;
  };
  isCancelled: boolean;
  sourceID: number;
  sourceIsFriendly: boolean;
  target: CastTarget;
  targetIsFriendly: boolean;
}

export interface BeginChannelEvent extends Event<EventType.BeginChannel> {
  ability: Ability;
  sourceID: number;
  isCancelled: boolean;
  targetID?: number;
  targetInstance?: number;
  sourceIsFriendly: boolean;
  targetIsFriendly: boolean;
  classResources?: Array<ClassResources & { cost: number }>;
  // Added by any module, used in the timeline
  meta?: EventMeta;
  trigger?: AnyEvent;
  globalCooldown?: GlobalCooldownEvent;
}

export interface EndChannelEvent extends Event<EventType.EndChannel> {
  ability: Ability;
  sourceID: number;
  start: number;
  duration: number;
  beginChannel: BeginChannelEvent;
  trigger?: AnyEvent;
}

export interface BaseCastEvent<T extends string> extends Event<T> {
  ability: Ability;
  absorb?: number;
  armor?: number;
  attackPower?: number;
  channel?: EndChannelEvent;
  classResources?: Array<ClassResources & { cost: number }>;
  facing?: number;
  hitPoints?: number;
  itemLevel?: number;
  mapID?: number;
  maxHitPoints?: number;
  resourceActor?: number;
  sourceID: number;
  sourceInstance?: number;
  sourceIsFriendly: boolean;
  spellPower?: number;
  target?: CastTarget;
  targetID?: number;
  targetInstance?: number;
  targetIsFriendly: boolean;
  x?: number;
  y?: number;

  // Added by the SpellResourceCost module if active
  rawResourceCost?: {
    [resourceType: number]: number;
  };
  resourceCost?: {
    [resourceType: number]: number;
  };
  // Added by the GlobalCooldown module
  globalCooldown?: GlobalCooldownEvent;
  // Added by any module, used in the timeline
  meta?: EventMeta;
}

export type CastEvent = BaseCastEvent<EventType.Cast>;
export type FreeCastEvent = BaseCastEvent<EventType.FreeCast>;
export type LeechEvent = BaseCastEvent<EventType.Leech>;

export type EmpowerStartEvent = BaseCastEvent<EventType.EmpowerStart>;
export interface EmpowerEndEvent extends BaseCastEvent<EventType.EmpowerEnd> {
  empowermentLevel: number;
}

export interface FilterCooldownInfoEvent extends BaseCastEvent<EventType.FilterCooldownInfo> {
  trigger: EventType;
}

export interface FilterBuffInfoEvent extends BuffEvent<EventType.FilterBuffInfo> {
  trigger: EventType;
}

export interface HealEvent extends Event<EventType.Heal> {
  /** Unique Identifier for the source. Nobody else will have this ID */
  sourceID: number;
  sourceInstance?: number;
  /** If the person who is doing the healing friendly */
  sourceIsFriendly: boolean;
  /** Unique Identifier for the target. Nobody else will have this ID */
  targetID: number;
  targetInstance?: number;
  /** Is the target you're healing a friendly */
  targetIsFriendly: boolean;
  /** The ability that is healing the target */
  ability: Ability;
  /** This describes if the spell Hit/Missed/Crit/etc. Look at {@link HIT_TYPES} all types of hits */
  hitType: number;
  /** The effective healing the event did */
  amount: number;
  /** The overheal the event did */
  overheal?: number;
  /** If the event is a tick of a HoT or HoT like object */
  tick?: boolean;
  resourceActor: ResourceActor;
  /** A list of resources on the TARGET */
  classResources: ClassResources[];
  /** Hit points of the target AFTER the heal is done if you want hp before you need to do (hitpoints - amount) */
  hitPoints: number;
  /** The max hitpoints of the target */
  maxHitPoints: number;
  /** How much attack power the target has */
  attackPower: number;
  /** How much Spell power the target has */
  spellPower: number;
  /** How much Armor the target has */
  armor: number;
  /** The current total absorb shields on the target */
  absorb: number;
  /** The amount of healing absorbed by a healing taken-debuff. */
  absorbed?: number;
  /** The x location of the player */
  x: number;
  /** The y location of the player */
  y: number;
  /** The direction the plaeyr is facing */
  facing: number;
  /** The map they are in. This is a unique ID for every zone in wow */
  mapID: number;
  /** The Item level of the target */
  itemLevel: number;
}

export interface BeaconHealEvent extends Omit<HealEvent, 'type'> {
  type: EventType.BeaconTransfer;
  originalHeal: HealEvent;
}

export interface BeaconTransferFailedEvent extends Omit<HealEvent, 'type'> {
  type: EventType.BeaconTransferFailed;
  timestamp: number;
}

export interface FeedHealEvent extends Omit<HealEvent, 'type'> {
  type: EventType.FeedHeal;
  feed: number;
}

export interface AbsorbedEvent extends Event<EventType.Absorbed> {
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  attacker?: CastTarget;
  attackerID?: number;
  attackerInstance?: number;
  attackerIsFriendly: boolean;
  amount: number;
  extraAbility: Ability;
}

export interface DamageEvent extends Event<EventType.Damage> {
  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceInstance?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
  ability: Ability;
  hitType: number;
  amount: number;
  absorbed?: number;
  resourceActor?: number;
  classResources?: ClassResources[];
  hitPoints?: number;
  maxHitPoints?: number;
  attackPower?: number;
  spellPower: number;
  armor?: number;
  absorb?: number;
  x?: number;
  y?: number;
  facing?: number;
  mapID?: number;
  itemLevel?: number;
  mitigated?: number;
  unmitigatedAmount?: number;
  tick?: boolean;
  overkill?: number;
  blocked?: number; // does this exist?
  subtractsFromSupportedActor?: boolean;
}

export interface BuffEvent<T extends string> extends Event<T> {
  ability: Ability;
  targetID: number;
  targetInstance?: number;
  targetIsFriendly: boolean;
  sourceID?: number;
  sourceIsFriendly: boolean;
  sourceInstance?: number;
}

export interface ApplyBuffEvent extends BuffEvent<EventType.ApplyBuff> {
  // confirmed that not all applybuff events contain a sourceID; e.g. wind rush from totem
  absorb?: number;
  __fromCombatantinfo?: boolean;
}

export interface ApplyDebuffEvent extends BuffEvent<EventType.ApplyDebuff> {
  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  absorb?: number;
  __fromCombatantinfo?: boolean;
}

export interface RemoveBuffEvent extends BuffEvent<EventType.RemoveBuff> {
  sourceID: number;
  absorb?: number;
}

export interface RemoveDebuffEvent extends BuffEvent<EventType.RemoveDebuff> {
  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  absorb?: number;
}

export interface ApplyBuffStackEvent extends BuffEvent<EventType.ApplyBuffStack> {
  sourceID: number;
  stack: number;
}

export interface ApplyDebuffStackEvent extends BuffEvent<EventType.ApplyDebuffStack> {
  sourceID: number;
  stack: number;
}

export interface RemoveBuffStackEvent extends BuffEvent<EventType.RemoveBuffStack> {
  sourceID: number;
  stack: number;
}

export interface ChangeBuffStackEvent extends BuffEvent<EventType.ChangeBuffStack> {
  end?: number;
  isDebuff?: boolean;
  newStacks: number;
  oldStacks: number;
  sourceID: number;
  stack?: number;
  stackHistory: {
    stacks: number;
    timestamp: number;
  };
  stacks: number;
  stacksGained: number;
  start: number;
  trigger: {
    end?: number;
    isDebuff?: boolean;
    prepull: boolean;
    sourceID: number;
    sourceIsFriendly: boolean;
    stacks: number;
    start: number;
    targetID: number;
    targetIsFriendly: boolean;
    timestamp: number;
    type: string;
  };
}

export interface ChangeDebuffStackEvent extends Omit<ChangeBuffStackEvent, 'type'> {
  type: EventType.ChangeDebuffStack;
}

export interface RemoveDebuffStackEvent extends BuffEvent<EventType.RemoveDebuffStack> {
  sourceID: number;
  stack: number;
}

export interface RefreshBuffEvent extends BuffEvent<EventType.RefreshBuff> {
  absorb?: number;
  source?: CastTarget;
}

export interface RefreshDebuffEvent extends BuffEvent<EventType.RefreshDebuff> {
  source?: CastTarget;
}

/**
 * Extra attacks, like Windfury totem.
 *
 * Example: https://www.warcraftlogs.com/reports/YPpMjNnXBxTyKfRa/#fight=1&source=9
 */
export interface ExtraAttacksEvent extends Event<EventType.ExtraAttacks> {
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  sourceMarker?: number;
  targetID: number;
  targetIsFriendly: boolean;
  targetMarker?: number;
  fight: number;
  extraAttacks: number;
}

export interface ResourceChangeEvent extends Event<EventType.ResourceChange> {
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  /** The id for the resource. See the RESOURCE_TYPES file for all available resource types. */
  resourceChangeType: number;
  /** The amount of resource gained. This includes any wasted gain, see `waste`. */
  resourceChange: number;
  /** The amount of wasted resource gain (overcapped). */
  waste: number;
  otherResourceChange: number; // defaults to 0?
  /** Shows whether the source or the target is being referred to by
   *  the classResources, hitPoints, etc. See {@link ResourceActor}. */
  resourceActor: ResourceActor;
  /** A list of resources on either the source or target, depending on resourceActor choice. */
  classResources: ClassResources[];
  hitPoints: number;
  maxHitPoints: number;
  attackPower: number;
  spellPower: number;
  armor: number;
  x: number;
  y: number;
  facing: number;
  mapID: number;
  itemLevel: number;
}

export interface DrainEvent extends Event<EventType.Drain> {
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  resourceChange: number;
  resourceChangeType: number;
  otherResourceChange: number;
  /** Shows whether the source or the target is being referred to by
   *  the classResources, hitPoints, etc. See {@link ResourceActor}. */
  resourceActor: ResourceActor;
  /** A list of resources on either the source or target, depending on resourceActor choice. */
  classResources: ClassResources[];
  hitPoints: number;
  maxHitPoints: number;
  attackPower: number;
  spellPower: number;
  armor: number;
  absorb: number;
  x: number;
  y: number;
  facing: number;
  mapID: number;
  itemLevel: number;
}

export interface InterruptEvent extends Event<EventType.Interrupt> {
  ability: Ability;
  extraAbility: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
}

export interface DeathEvent extends Event<EventType.Death> {
  killingAbility?: Ability;
  source: CastTarget;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
}

export interface AuraBrokenEvent extends Event<EventType.AuraBroken> {
  ability: Ability;
  extraAbility: Ability;
  isBuff: boolean;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
}

export interface ResurrectEvent extends Event<EventType.Resurrect> {
  ability?: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
}

export interface SummonEvent extends Event<EventType.Summon> {
  sourceID: number;
  sourceIsFriendly: boolean;
  target: PetInfo;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
  ability: Ability;
}

export interface GlobalCooldownEvent extends Event<EventType.GlobalCooldown> {
  ability: Ability;
  duration: number;
  sourceID: number;
  targetID: number;
  targetIsFriendly: boolean;
  timestamp: number;
  trigger: CastEvent | BeginChannelEvent;
  __fabricated: true;
}

export interface AutoAttackCooldownEvent extends Event<EventType.AutoAttackCooldown> {
  ability: Ability;
  duration: number;
  haste: number;
  attackSpeed: number;
  sourceID: number;
  targetID: number;
  timestamp: number;
  trigger: CastEvent | BeginChannelEvent;
  __fabricated: true;
}

export interface FightEndEvent extends Event<EventType.FightEnd> {
  timestamp: number;
  __fabricated: true;
}

export interface UpdateSpellUsableEvent extends Event<EventType.UpdateSpellUsable> {
  ability: Omit<Ability, 'type'>; // TODO should be able to get full ability
  /** The kind of update to spell usability this represents. */
  updateType: UpdateSpellUsableType;
  /** If the spell is on cooldown *after* the event */
  isOnCooldown: boolean;
  /** If the spell is available *after* the event */
  isAvailable: boolean;
  /** How many charges are available *after* the event */
  chargesAvailable: number;
  /** The maximum number of charges for the spell */
  maxCharges: number;

  /** The timestamp this cooldown began - always the timestamp of the most recent BeginCooldown
   *  for this ability, and if this is a BeginCooldown it will be the same as this event's timestamp.
   *  Note this is the overall beginning, *not* the beginning of the most recent charge's cooldown. */
  overallStartTimestamp: number;
  /** The timestamp the cooldown of this charge began - always the timestamp of the most recent
   *  BeginCooldown or RestoreCharge for this ability. If this is a BeginCooldown it will be the
   *  same as the event's timestamp. */
  chargeStartTimestamp: number;
  /** The timestamp the next charge is expected to be restored, based on current conditions.
   *  For a spell without charges, this is the expected time of the cooldown's end. (for an
   *  EndCooldown updateType, it will be the actual time of the cooldown's end - this event's timestamp)
   *  Expectation is based on the current haste / modRate / buffs - for dynamic cooldowns
   *  the actual recharge time may be earlier *or* later. */
  expectedRechargeTimestamp: number;
  /** The expected time it will take for a full charge to recover, based on current conditions.
   *  This is *not* the time from the current timestamp expected, but the time from charge start
   *  to finish. Expectation is based on the current haste / modRate / buffs - for dynamic cooldowns
   *  the actual recharge time may be earlier *or* later. */
  expectedRechargeDuration: number;

  /** The time after an ability's cooldown ends that the player has to wait in GCD before
   *  being able to cast the spell. Useful for making the spell utilization numbers more fair
   *  when a GCD spell resets another spell's cooldown.
   *  Only filled in for EndCooldown updateType. */
  timeWaitingOnGCD?: number;

  /** In practice will always be the selected player - included to make filtering easier */
  sourceID: number;
  /** In practice will always be true - included to make filtering easier */
  sourceIsFriendly: boolean;
  /** In practice will always be the selected player - included to make filtering easier */
  targetID: number;
  /** In practice will always be true - included to make filtering easier */
  targetIsFriendly: boolean;

  __fabricated: true;
}

/**
 * The reasons for an UpdateSpellUsableEvent.
 */
export enum UpdateSpellUsableType {
  /** The spell wasn't on cooldown but now is (the first charge was used) */
  BeginCooldown = 'BeginCooldown',
  /** The spell was on cooldown but now isn't (the last charge was restored) */
  EndCooldown = 'EndCooldown',
  /** A charge beyond the first was used (spell was on cooldown and still is).
   *  When the first charge is used, it will be indicated with a BeginCooldown type
   *  *instead of* this type. Spells without charges will never have an update with this type. */
  UseCharge = 'UseCharge',
  /** A charge before the last was restored (spell was on cooldown and still is).
   *  When the last charge is restored, it will be indicated with an EndCooldown type
   *  *instead of* this type. Spells without charges will never have an update with this type. */
  RestoreCharge = 'RestoreCharge',
}

export interface MaxChargesIncreasedEvent extends Event<EventType.MaxChargesIncreased> {
  /** The ID of the spell that's changing FIXME ability event instead? */
  spellId: number;
  /** The number of charges we're increasing by */
  by: number;

  __fabricated: true;
}

export interface MaxChargesDecreasedEvent extends Event<EventType.MaxChargesDecreased> {
  /** The ID of the spell that's changing FIXME ability event instead? */
  spellId: number;
  /** The number of charges we're decreasing by */
  by: number;

  __fabricated: true;
}

interface Stats {
  agility: number;
  armor: number;
  avoidance: number;
  crit: number;
  haste: number;
  intellect: number;
  leech: number;
  mastery: number;
  speed: number;
  stamina: number;
  strength: number;
  versatility: number;
}

export interface ChangeStatsEvent extends Event<EventType.ChangeStats> {
  sourceID: number;
  targetID: number;
  targetIsFriendly: true;
  trigger: AnyEvent;
  after: Stats;
  before: Stats;
  delta: Stats;
}

export interface ChangeHasteEvent extends Event<EventType.ChangeHaste> {
  oldHaste: number;
  newHaste: number;
}

export interface DispelEvent extends Event<EventType.Dispel> {
  ability: Ability; // The ability used to dispel
  extraAbility: Ability; // The ability that was dispelled
  isBuff: number;
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
}

interface BasePhaseEvent<T extends string> extends Event<T> {
  phase: PhaseConfig;
  __fabricated: true;
}

export interface SpendResourceEvent extends Event<EventType.SpendResource> {
  sourceID: number;
  resourceChange: number;
  resourceChangeType: number;
  ability: Ability;
  __fabricated: true;
}

export interface CreateEvent extends Event<EventType.Create> {
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
  target: CastTarget;
}

export interface SpellstealEvent extends Event<EventType.Spellsteal> {
  ability: Ability;
  extraAbility: Ability;
  fight: number;
  isBuff: boolean;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
}

export interface BeaconAppliedEvent extends Event<EventType.BeaconApplied> {
  trigger: ApplyBuffEvent;
}

export interface BeaconRemovedEvent extends Event<EventType.BeaconRemoved> {
  trigger: RemoveBuffEvent;
}

export type PhaseEvent = BasePhaseEvent<EventType.PhaseStart | EventType.PhaseEnd>;

export type PhaseStartEvent = BasePhaseEvent<EventType.PhaseStart>;

export type PhaseEndEvent = BasePhaseEvent<EventType.PhaseEnd>;

export interface Item {
  id: number;
  quality: number;
  icon: string;
  itemLevel: number;
  bonusIDs?: number | number[];
  effectID?: number;
  permanentEnchant?: number;
  temporaryEnchant?: number;
  /**
   * An enchant that provides an activatable ability.
   *
   * Only seen it used on Cata Engineering "enchants".
   */
  onUseEnchant?: number;
  gems?: Gem[];
  setID?: number;

  /**
   * Added while parsing gear of the combatant if item is part of a set.
   * Contains all equiped items ids that have the same @setID
   * Used for wowhead tooltip.
   */
  setItemIDs?: number[];
}

interface Gem {
  id: number;
  itemLevel: number;
  icon: string;
}

export interface Buff {
  source: number;
  ability: number;
  stacks: number;
  icon: string;
  name?: string;
}

export interface Covenant {
  name: string;
  description: string;
  id: number;
  spellID: number;
  icon: string;
}

export interface Soulbind {
  name: string;
  id: number;
  covenantID: number;
  garrisonTalentTreeId: number;
  capstoneTraitID: number;
}

/**
 * A talent entry from the log.
 *
 * Note: this is *different* from the Talent type for spells.
 */
export interface TalentEntry {
  id: number;
  nodeID: number;
  spellID: number;
  rank: number;
  icon?: string;
  spellType?: number;
}

export interface CombatantInfoEvent extends Event<EventType.CombatantInfo> {
  player: PlayerInfo;
  expansion: 'wotlk' | 'tbc' | 'shadowlands' | 'dragonflight' | string;
  pin: string;
  sourceID: number;
  gear: Item[];
  auras: Buff[];
  faction: number;
  specID: number;
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  dodge: number;
  parry: number;
  block: number;
  armor: number;
  critMelee: number;
  critRanged: number;
  critSpell: number;
  speed: number;
  leech: number;
  hasteMelee: number;
  hasteRanged: number;
  hasteSpell: number;
  avoidance: number;
  mastery: number;
  versatilityDamageDone: number;
  versatilityHealingDone: number;
  versatilityDamageReduction: number;
  talentTree: TalentEntry[];
  talents: Spell[];
  pvpTalents: Spell[];
  /**
   * @deprecated
   */
  covenantID?: number;
  /**
   * @deprecated
   */
  soulbindID?: number;
  /**
   * Represents expansion specific traits
   * Legion: Artifact Traits
   * BFA: Azerite
   * Shadowlands: Soulbinds
   */
  customPowerSet?: any[]; // will be copied into field with better name / type depending on expansion
  /**
   * Represents expansion specific traits
   * BFA: Essences
   * Shadowlands: Conduits
   */
  secondaryCustomPowerSet?: any[]; // will be copied into field with better name / type depending on expansion
  /**
   * Represents expansion specific traits
   * Shadowlands: Anima Powers
   */
  tertiaryCustomPowerSet?: any[]; // will be copied into field with better name / type depending on expansion
  error?: any; //TODO: Verify, is this a bool? string?
}

const Events = {
  /**
   * BEWARE: These events/properties are NOT COMPLETE. See the Event log for a
   * full list of available props and events.
   *
   * Generic props:
   * - timestamp: the timestamp of the event, relative to log start
   * - type: the event type, you should generally not use this and properly
   * separate event listeners.
   * - sourceID: who initiated the event
   * - sourceIsFriendly: whether the source was friendly to the selected player
   * - targetID: who was affected by the event
   * - targetIsFriendly: whether the target was friendly to the selected
   * player. BEWARE: @Any dps classes: make sure if you do a damage statistic
   * that you do NOT include friendly fire to other players (such as from Aura
   * of Sacrifice). This does not gain any damage bonuses.
   * - ability: object of the ability/spell involved. Shape: { name, guid,
   * type: I believe this is the magic school type, abilityIcon }
   * - resourceActor:
   * - classResources: array of resources (mana, energy, etc)
   * - hitPoints: for healing these are the hitpoints AFTER the event's
   * modifications are applied, for other events it might be before? you should
   * check to make sure for damage, energize and such events
   * - maxHitPoints: this max amount of hitpoints of the target
   * - attackPower:
   * - spellPower:
   * - x: x location on the map. See
   * paladin/holy/modules/features/MasteryEffectiveness for an example module
   * that uses this data.
   * - y: y location on the map
   * - facing: the direction the player is facing
   * - sourceMarker:
   * - targetMarker:
   * - mapID:
   * - itemLevel:
   */

  /**
   * This event is called for events where the player, a player pet or a target
   * of the player/player pet dealt or took damage. Event specific props:
   * - amount: effective damage
   * - absorbed: damage absorbed by a buff on the target (e.g.
   * https://www.wowhead.com/spell=269279/resounding-protection). This should
   * generally be considered effective damage.
   * - overkill: if the target died, this is the amount of damage that exceeded
   * their remaining health
   * - hitType:
   * - mitigated:
   * - unmitigatedAmount:
   * - tick:
   *
   * NOTE: Do not use this event to track absorb-healing (e.g. by a spell such
   * as Resounding Protection). Use the `absorbed` event instead.
   * @returns {EventFilter}
   */
  get damage() {
    return new EventFilter(EventType.Damage);
  },
  /**
   * This event is called for events where the player, a player pet or a target
   * of the player/player pet was healed. Event specific props:
   * - amount: effective healing
   * - absorbed: healing absorbed by a debuff on the target (e.g.
   * https://www.wowhead.com/spell=233263/embrace-of-the-eclipse). This should
   * generally be considered effective healing.
   * - overheal: overhealing
   * @returns {EventFilter}
   */
  get heal() {
    return new EventFilter(EventType.Heal);
  },
  /**
   * Triggered in addition to the regular heal event whenever a heal is
   * absorbed. Can be used to determine what buff or debuff was absorbing the
   * healing. NOTE: This should only be used if you need to know **which
   * ability soaked the healing**. If you want to track the amount of absorbed
   * healing by a spell, use the `absorb` prop of the `heal` event.
   * @returns {EventFilter}
   */
  get healabsorbed() {
    return new EventFilter(EventType.HealAbsorbed);
  },
  /**
   * This event is called for events where the player, a player pet or a target
   * of the player/player pet was healed. Event specific props:
   * - ability: The ability responsible for absorbed damage (i.e. the shield)
   * - amount: effective damage absorbed
   * - attackerID:
   * - attackerIsFriendly:
   * - extraAbility: The damage ability that was absorbed
   * @returns {EventFilter}
   */
  get absorbed() {
    return new EventFilter(EventType.Absorbed);
  },
  /**
   * This event is called when the player begins casting an ability that has a
   * cast time. This is also called for some channeled abilities, but not
   * everyone. This is NOT cast for most instant abilities.
   * @returns {EventFilter}
   */
  get begincast() {
    return new EventFilter(EventType.BeginCast);
  },
  /**
   * This event is called when the player successfully cast an ability.
   * BEWARE: Blizzard also sometimes uses this event type for mechanics and
   * spell ticks or bolts. This can even occur in between a begincast and cast
   * finish!
   * @returns {EventFilter}
   */
  get cast() {
    return new EventFilter(EventType.Cast);
  },
  /**
   * Event specific props:
   * - absorb: If the buff can absorb damage, the size of the shield.
   * @returns {EventFilter}
   */
  get applybuff() {
    return new EventFilter(EventType.ApplyBuff);
  },
  /**
   * Event specific props:
   * - absorb: If the buff can absorb healing (maybe there are debuffs that
   * absorb damage too?), this reflects the size of the (healing) absorb.
   * @returns {EventFilter}
   */
  get applydebuff() {
    return new EventFilter(EventType.ApplyDebuff);
  },
  get applybuffstack() {
    return new EventFilter(EventType.ApplyBuffStack);
  },
  get changebuffstack() {
    return new EventFilter(EventType.ChangeBuffStack);
  },
  get changedebuffstack() {
    return new EventFilter(EventType.ChangeDebuffStack);
  },
  get applydebuffstack() {
    return new EventFilter(EventType.ApplyDebuffStack);
  },
  /**
   * Event specific props:
   * - stack
   * @returns {EventFilter}
   */
  get removebuffstack() {
    return new EventFilter(EventType.RemoveBuffStack);
  },
  /**
   * Event specific props:
   * - stack
   * @returns {EventFilter}
   */
  get removedebuffstack() {
    return new EventFilter(EventType.RemoveDebuffStack);
  },
  get refreshbuff() {
    return new EventFilter(EventType.RefreshBuff);
  },
  get refreshdebuff() {
    return new EventFilter(EventType.RefreshDebuff);
  },
  /**
   * Event specific props:
   * - absorb: If the buff could absorb damage, the size of the shield
   * remaining. This is UNUSED/WASTED damage absorb.
   * @returns {EventFilter}
   */
  get removebuff() {
    return new EventFilter(EventType.RemoveBuff);
  },
  /**
   * Event specific props:
   * - absorb: If the buff could absorb healing (maybe there are debuffs that
   * absorb damage too?), this reflects the size of the (healing) absorb.
   * @returns {EventFilter}
   */
  get removedebuff() {
    return new EventFilter(EventType.RemoveDebuff);
  },
  get dispel() {
    return new EventFilter(EventType.Dispel);
  },
  get summon() {
    return new EventFilter(EventType.Summon);
  },
  get resourcechange() {
    return new EventFilter(EventType.ResourceChange);
  },
  get drain() {
    return new EventFilter(EventType.Drain);
  },
  get interrupt() {
    return new EventFilter(EventType.Interrupt);
  },
  get death() {
    return new EventFilter(EventType.Death);
  },
  get resurrect() {
    return new EventFilter(EventType.Resurrect);
  },
  get fightend() {
    return new EventFilter(EventType.FightEnd);
  },
  get phasestart() {
    return new EventFilter(EventType.PhaseStart);
  },
  get phaseend() {
    return new EventFilter(EventType.PhaseEnd);
  },
  get instakill() {
    return new EventFilter(EventType.Instakill);
  },
  get prefiltercd() {
    return new EventFilter(EventType.FilterCooldownInfo);
  },
  get prefilterbuff() {
    return new EventFilter(EventType.FilterBuffInfo);
  },
  get GlobalCooldown() {
    return new EventFilter(EventType.GlobalCooldown);
  },
  get UpdateSpellUsable() {
    return new EventFilter(EventType.UpdateSpellUsable);
  },
  get MaxChargesIncreased() {
    return new EventFilter(EventType.MaxChargesIncreased);
  },
  get MaxChargesDescreased() {
    return new EventFilter(EventType.MaxChargesDecreased);
  },
  get BeginChannel() {
    return new EventFilter(EventType.BeginChannel);
  },
  get EndChannel() {
    return new EventFilter(EventType.EndChannel);
  },
  get ChangeStats() {
    return new EventFilter(EventType.ChangeStats);
  },
  get ChangeHaste() {
    return new EventFilter(EventType.ChangeHaste);
  },
  get SpendResource() {
    return new EventFilter(EventType.SpendResource);
  },
  get beacontransfer() {
    return new EventFilter(EventType.BeaconTransfer);
  },
  get BeaconTransferFailed() {
    return new EventFilter(EventType.BeaconTransferFailed);
  },
  get BeaconApplied() {
    return new EventFilter(EventType.BeaconApplied);
  },
  get BeaconRemoved() {
    return new EventFilter(EventType.BeaconRemoved);
  },
  get feedheal() {
    return new EventFilter(EventType.FeedHeal);
  },
  get any() {
    return new EventFilter(EventType.Event);
  },
  get test() {
    return new EventFilter(EventType.Test);
  },
  get create() {
    return new EventFilter(EventType.Create);
  },
  get spellsteal() {
    return new EventFilter(EventType.Spellsteal);
  },
  get empowerStart() {
    return new EventFilter(EventType.EmpowerStart);
  },
  get empowerEnd() {
    return new EventFilter(EventType.EmpowerEnd);
  },
  get leech() {
    return new EventFilter(EventType.Leech);
  },
  get extraAttacks() {
    return new EventFilter(EventType.ExtraAttacks);
  },
};

export default Events;
