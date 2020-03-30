import React from 'react';
import { PhaseConfig } from 'raids';

import EventFilter from './EventFilter';

export enum EventType {
  Heal = 'heal',
  HealAbsorbed = 'healabsorbed',
  Absorbed = 'absorbed',
  Damage = 'damage',
  BeginCast = 'begincast',
  Cast = 'cast',
  ApplyBuff = 'applybuff',
  ApplyDebuff = 'applydebuff',
  ApplyBuffStack = 'applybuffstack',
  ApplyDebuffStack = 'applydebuffstack',
  RemoveBuffStack = 'removebuffstack',
  RemoveDebuffStack = 'removedebuffstack',
  RefreshBuff = 'refreshbuff',
  RefreshDebuff = 'refreshdebuff',
  RemoveBuff = 'removebuff',
  RemoveDebuff = 'removedebuff',
  Summon = 'summon',
  Energize = 'energize',
  Interrupt = 'interrupt',
  Death = 'death',
  Resurrect = 'resurrect',
  CombatantInfo = 'combatantinfo',

  // Fabricated:
  FightEnd = 'fightend',
  GlobalCooldown = 'globalcooldown',
  BeginChannel = 'beginchannel',
  EndChannel = 'endchannel',
  UpdateSpellUsable = 'updatespellusable',
  BeaconTransfer = 'beacontransfer',
  ChangeStats = 'changestats',

  // Phases:
  PhaseStart = 'phasestart',
  PhaseEnd = 'phaseend',

  // Time Filtering:
  FilterCooldownInfo = 'filtercooldowninfo',
  FilterBuffInfo = 'filterbuffinfo',
}

export interface Ability {
  name: string;
  guid: number;
  type: number;
  abilityIcon: string;
}
export interface ClassResources {
  amount: number;
  max: number;
  type: number;
}
// TODO: Find a good place for this
export enum Class {
  DemonHunter = 'DemonHunter',
  DeathKnight = 'DeathKnight',
  Druid = 'Druid',
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

export interface Event {
  type: EventType;
  timestamp: number;
}
export interface BeginCastEvent extends Event {
  type: EventType.BeginCast;

  ability: Ability;
  castEvent: CastEvent;
  channel: {
    type: 'beginchannel';
    timestamp: 858735;
    ability: Ability;
    sourceID: number;
    isCancelled: boolean;
  };
  isCancelled: boolean;
  sourceID: number;
  sourceIsFriendly: boolean;
  target: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  targetIsFriendly: boolean;
}
export interface BeginChannelEvent extends Event {
  type: EventType.BeginChannel;
  ability: Ability;
  sourceID: number;
  isCancelled: boolean;
}
export interface EndChannelEvent extends Event {
  type: EventType.EndChannel;
  ability: Ability;
  sourceID: number;
  start: number;
  duration: number;
  beginChannel: BeginChannelEvent;
}
export interface CastEvent extends Event {
  type: EventType.Cast | EventType.FilterCooldownInfo;
  ability: Ability;
  absorb?: number;
  armor?: number;
  attackPower?: number;
  classResources?: Array<
    ClassResources & {
      cost: number;
    }
  >;
  facing?: number;
  hitPoints?: number;
  itemLevel?: number;
  mapID?: number;
  maxHitPoints?: number;
  resourceActor?: number;
  sourceID: number;
  sourceIsFriendly: boolean;
  spellPower?: number;
  target?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  targetID?: number;
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
  globalCooldown: GlobalCooldownEvent;
  // Added by any module, used in the timeline
  meta?: {
    isInefficientCast?: boolean;
    inefficientCastReason?: React.ReactNode;
  };
}
export interface FilterCooldownInfoEvent extends CastEvent{
  type: EventType.FilterCooldownInfo;

  trigger: EventType;
}
export interface HealEvent extends Event {
  type: EventType.Heal;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetInstance?: number;
  targetIsFriendly: boolean;
  ability: Ability;
  hitType: number;
  amount: number;
  overheal?: number;
  tick?: boolean;
  resourceActor: number;
  classResources: ClassResources[];
  hitPoints: number;
  maxHitPoints: number;
  attackPower: number;
  spellPower: number;
  armor: number;
  /** The current total absorb shields on the target I think? */
  absorb: number;
  /** The amount of healing absorbed by a healing taken-debuff. */
  absorbed?: number;
  x: number;
  y: number;
  facing: number;
  mapID: number;
  itemLevel: number;
}
export interface BeaconHealEvent extends Omit<HealEvent, 'type'> {
  type: EventType.BeaconTransfer,
  originalHeal: HealEvent,
}
export interface AbsorbedEvent extends Event {
  type: EventType.Absorbed;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  attacker?: {
    name: 'Environment';
    id: -1;
    guid: 0;
    type: 'NPC';
    icon: 'NPC';
  };
  attackerID?: number;
  attackerIsFriendly: boolean;
  amount: number;
  extraAbility: Ability;
}
export interface DamageEvent extends Event {
  type: EventType.Damage;

  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: true;
  targetID: number;
  targetInstance: number,
  targetIsFriendly: false;
  ability: Ability;
  hitType: number;
  amount: number;
  absorbed: number;
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
}
export interface BuffEvent extends Event {}
export interface ApplyBuffEvent extends BuffEvent {
  type: EventType.ApplyBuff;
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  targetInstance?: number;
  absorb?: number;
}
export interface ApplyDebuffEvent extends BuffEvent {
  type: EventType.ApplyDebuff;
  ability: Ability;
  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  targetInstance?: number;
  absorb?: number;
}
export interface RemoveBuffEvent extends BuffEvent {
  type: EventType.RemoveBuff;
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  targetInstance?: number;
  absorb?: number;
}
export interface RemoveDebuffEvent extends BuffEvent {
  type: EventType.RemoveDebuff;
  ability: Ability;
  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  absorb?: number;
}
export interface ApplyBuffStackEvent extends BuffEvent {
  type: EventType.ApplyBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface ApplyDebuffStackEvent extends BuffEvent {
  type: EventType.ApplyDebuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RemoveBuffStackEvent extends BuffEvent {
  type: EventType.RemoveBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RemoveDebuffStackEvent extends BuffEvent {
  type: EventType.RemoveBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RefreshBuffEvent extends BuffEvent {
  type: EventType.RefreshBuff;

  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
}
export interface RefreshDebuffEvent extends BuffEvent {
  type: EventType.RefreshBuff;

  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
}
export interface EnergizeEvent extends Event {
  type: EventType.Energize;
  ability: Ability;
  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  resourceChange: number;
  resourceChangeType: number;
  otherResourceChange: number;
  waste: number;
  resourceActor: number;
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
export interface DeathEvent extends Event {
  type: EventType.Death;
  source: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
}
export interface SummonEvent extends Event {
  type: EventType.Summon;
  sourceID: number;
  sourceIsFriendly: boolean;
  target: {
    name: string;
    id: number;
    guid: number;
    type: string;
    petOwner: number;
    icon: string;
  };
  targetID: number;
  targetInstance: number;
  targetIsFriendly: boolean;
  ability: Ability;
}

export interface GlobalCooldownEvent extends Event {
  type: EventType.GlobalCooldown;
  ability: Ability;
  duration: number;
  sourceID: number;
  targetID: number;
  timestamp: number;
  trigger: CastEvent;
  __fabricated: true;
}
export interface FightEndEvent extends Event {
  type: EventType.FightEnd;
  timestamp: number;
  __fabricated: true;
}
export interface UpdateSpellUsableEvent extends Event {
  type: EventType.UpdateSpellUsable;
  ability: Ability;
  name: string
  trigger: 'begincooldown' | 'endcooldown' | 'refreshcooldown' | 'addcooldowncharge' | 'restorecharge';
  isOnCooldown: boolean
  isAvailable: boolean
  chargesAvailable: number
  maxCharges: number
  timePassed: number
  sourceID: number
  targetID: number

  start: number;
  end?: number;
  expectedDuration: number;
  totalReductionTime: number;

  // Added by SpellHistory
  timeWaitingOnGCD?: number;

  __fabricated: true;
}

export interface Stats {
  agility: number
  armor: number
  avoidance: number
  crit: number
  haste: number
  intellect: number
  leech: number
  mastery: number
  speed: number
  stamina: number
  strength: number
  versatility: number
}

export interface ChangeStatsEvent extends Event {
  targetID: number
  trigger: any
  after: Stats
  before: Stats
  delta: Stats
}

export interface PhaseEvent extends Event {
  phase: PhaseConfig;
  __fabricated: true;
}

export interface PhaseStartEvent extends PhaseEvent {
  type: EventType.PhaseStart;
}

export interface PhaseEndEvent extends PhaseEvent {
  type: EventType.PhaseEnd;
}

export interface Item {
  id: number;
  quality: number;
  icon: string;
  itemLevel: number;
  bonusIDs?: number[];
  permanentEnchant?: number;
  gems?: Array<Gem>;
}

export interface Gem {
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

export interface Trait {
  traitID: number;
  rank: number;
  spellID: number;
  icon: string;
  slot: number;
  isMajor: boolean;
}

export interface CombatantInfoEvent extends Event {
  type: EventType.CombatantInfo;
  pin: string;
  sourceID: number;
  gear: Array<Item>;
  auras: Array<Buff>;
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
  talents: [
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
  ];
  pvpTalents: Array<{ id: number; icon: string }>;
  artifact: Array<{
    traitID: number;
    rank: number;
    spellID: number;
    icon: string;
    slot: number;
    isMajor: false;
  }>;
  heartOfAzeroth: Array<Trait>;
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
  get summon() {
    return new EventFilter(EventType.Summon);
  },
  get energize() {
    return new EventFilter(EventType.Energize);
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
  get BeginChannel() {
    return new EventFilter(EventType.BeginChannel);
  },
  get EndChannel() {
    return new EventFilter(EventType.EndChannel);
  },
  get ChangeStats() {
    return new EventFilter(EventType.ChangeStats);
  },
};

export default Events;
