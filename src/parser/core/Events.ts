import React from 'react';

import { END_EVENT_TYPE } from 'parser/shared/normalizers/FightEnd';
import {
  PHASE_START_EVENT_TYPE,
  PHASE_END_EVENT_TYPE,
} from 'common/fabricateBossPhaseEvents';
import {
  PRE_FILTER_BUFF_EVENT_TYPE,
  PRE_FILTER_COOLDOWN_EVENT_TYPE,
} from 'interface/report/TimeEventFilter';
import EventFilter from './EventFilter';

enum EventType {
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

  // Fabricated:
  GlobalCooldown = 'globalcooldown',
  BeginChannel = 'beginchannel',
}

interface Ability {
  name: string;
  guid: number;
  type: number;
  abilityIcon: string;
}
interface ClassResources {
  amount: number;
  max: number;
  type: number;
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
export interface CastEvent extends Event {
  type: EventType.Cast;
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
  globalCooldown: {
    ability: Ability;
    duration: number;
    sourceID: number;
    targetID: number;
    timestamp: number;
    trigger: CastEvent;
    type: EventType.GlobalCooldown;
    __fabricated: true;
  };
  // Added by any module, used in the timeline
  meta?: {
    isInefficientCast?: boolean;
    inefficientCastReason?: React.ReactNode;
  };
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
  absorb: number;
  x: number;
  y: number;
  facing: number;
  mapID: number;
  itemLevel: number;
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
export interface BuffEvent {}
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
export interface ApplyBuffStackEvent extends Event {
  type: EventType.ApplyBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface ApplyDebuffStackEvent extends Event {
  type: EventType.ApplyDebuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RemoveBuffStack extends Event {
  type: EventType.RemoveBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RemoveDebuffStack extends Event {
  type: EventType.RemoveBuffStack;

  sourceID: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
  stack: number;
}
export interface RefreshBuffEvent extends Event {
  type: EventType.RefreshBuff;

  source?: { name: 'Environment'; id: -1; guid: 0; type: 'NPC'; icon: 'NPC' };
  sourceID?: number;
  sourceIsFriendly: boolean;
  targetID: number;
  targetIsFriendly: boolean;
  ability: Ability;
}
export interface RefreshDebuffEvent extends Event {
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
    return new EventFilter(END_EVENT_TYPE);
  },
  get phasestart() {
    return new EventFilter(PHASE_START_EVENT_TYPE);
  },
  get phaseend() {
    return new EventFilter(PHASE_END_EVENT_TYPE);
  },
  get prefiltercd() {
    return new EventFilter(PRE_FILTER_COOLDOWN_EVENT_TYPE);
  },
  get prefilterbuff() {
    return new EventFilter(PRE_FILTER_BUFF_EVENT_TYPE);
  },
};

export default Events;
