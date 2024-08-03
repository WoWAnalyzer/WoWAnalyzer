import {
  Ability,
  AbilityEvent,
  AddRelatedEvent,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  BaseCastEvent,
  ClassResources,
  Event,
  EventType,
  HasAbility,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ResourceActor,
  ResourceChangeEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Combatant from 'parser/core/Combatant';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import typedKeys from 'common/typedKeys';
import { NormalizerOrder } from './constants';
import Abilities from 'parser/core/modules/Abilities';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

enum MaelstromAbilityType {
  Builder = 1,
  Spender = 2,
  Both = 3,
}

enum BufferMs {
  Disabled = -1,
  None = 0,
  Cast = 5,
  Damage = 30,
  Spender = 50,
  PrimordialWave = 100,
}

const MAXIMUM_MAELSTROM_PER_EVENT = {
  [TALENTS.STORM_SWELL_TALENT.id]: 3,
  [TALENTS.SUPERCHARGE_TALENT.id]: 3,
  [TALENTS.STATIC_ACCUMULATION_TALENT.id]: 10,
}

const DEBUG = true;

interface MaelstromRelatedAbility {
  spell: Spell | Spell[];
  forwardBufferMs?: number;
  backwardsBufferMs?: number;
  eventType?: EventType | EventType[];
  enabled?: ((combatant: Combatant) => boolean) | boolean | undefined;
  maximum?: ((combatant: Combatant) => number) | number | undefined;
  type?: ((combatant: Combatant) => MaelstromAbilityType) | MaelstromAbilityType;
  alternateSpell?: Spell;
}

interface PeriodicGainEffect {
  spellId: number,
  frequencyMs: number,
  immediateGain: boolean,
  maxGainPerInterval: number,
  alternateSpellId?: number | undefined,
}
interface ActivePeriodicGainEffect extends Omit<PeriodicGainEffect, 'immediateGain'> {
  nextExpectedGain: number,  
}

// type MaelstromEvent = ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent | RemoveBuffEvent | RemoveBuffStackEvent;
type GainEventType = ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent;
type SpendEventType = RemoveBuffEvent | RemoveBuffStackEvent;

class MaelstromAbility {
  private readonly combatant!: Combatant;

  constructor(combatant: Combatant, spell: MaelstromRelatedAbility) {
    this.combatant = combatant;
    if (typeof spell.spell === "object" && spell.alternateSpell === undefined && spell.type === MaelstromAbilityType.Builder) {
      throw new Error("When supplying an array of spells, alternateSpell must be defined");      
    }    
    Object.assign(this, spell);
  }

  spell!: Spell | Spell[];
  eventType: EventType = EventType.Damage;
  forwardBufferMs: MaelstromRelatedAbility['forwardBufferMs'];
  backwardsBufferMs: MaelstromRelatedAbility['backwardsBufferMs'] = -1;
  alternateSpell: MaelstromRelatedAbility['alternateSpell'];  

  get primarySpell(): number {
    // only valid for builder types
    if (this.alternateSpell) {
      return this.alternateSpell.id;
    } else {
      return (this.spell as Spell).id;
    }
  }

  _type: MaelstromRelatedAbility['type'];
  get type() {
    if (typeof this._type === 'function') {
      return this._type.call(this, this.combatant);
    }
    return this._type ?? MaelstromAbilityType.Builder;
  }
  set type(value) {
    this._type = value;
  }

  _condition: MaelstromRelatedAbility['enabled'];
  get enabled() {
    if (typeof this._condition === 'function') {
      return this._condition.call(this, this.combatant);
    }
    return this._condition ?? true;
  }
  set enabled(value) {
    this._condition = value;
  }

  _maximum: MaelstromRelatedAbility['maximum'];
  get maximum() {
    if (typeof this._maximum === 'function') {
      return this._maximum.call(this, this.combatant);
    }
    return this._maximum ?? MAXIMUM_MAELSTROM_PER_EVENT[this.primarySpell] ?? 1;
  }
  set maximum(value) {
    this._maximum = value;
  }

  get isBuilder() {
    return (this.type & MaelstromAbilityType.Builder) === MaelstromAbilityType.Builder;
  }

  get isSpender() {
    return (this.type & MaelstromAbilityType.Spender) === MaelstromAbilityType.Spender;
  }
}

class MaelstromWeaponResourceNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    abilities: Abilities
  }
  private readonly abilities!: Abilities;
  private readonly resourceRelatedEvents: MaelstromAbility[];
  private readonly maxResource: number;
  private readonly maxSpend: number;
  private fixedEvents: AnyEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.priority = NormalizerOrder.MaelstromWeaponResourceNormalizer;

    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.RAGING_MAELSTROM_TALENT) ? 10 : 5
    this.maxSpend = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT) ? 10 : 5

    this.resourceRelatedEvents = this.loadAbilities()
      .map((config) => new MaelstromAbility(this.selectedCombatant, config))
      .filter((ability) => ability.enabled);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {    
    let currentMaelstrom = 0;
    // let lastMissingDetailEvent : ResourceChangeEventMissingProperties | null;
    const activePeriodicEffects: Record<number, ActivePeriodicGainEffect> = {};
    const processedMaelstromEvents = new Set<AnyEvent>();

    events.forEach((event: AnyEvent, index: number) => {      
      this.fixedEvents.push(event);

      if (HasAbility(event)) {
        // handle current periodic maelstrom gain effects
        const periodicEffect = this.periodicSpells.find(p => p.spellId === event.ability.guid);        
        if (periodicEffect) {
          if (event.type === EventType.ApplyBuff) {
            activePeriodicEffects[periodicEffect.spellId] = startPeriodicGain(event, periodicEffect);            
          }
          if (event.type === EventType.RemoveBuff) {
            delete activePeriodicEffects[periodicEffect.spellId];
          }
        }

        // if this is a gain and there is a periodic effect active, 
        if (isGain(event) && !processedMaelstromEvents.has(event)) {
          const activeEffects = typedKeys(activePeriodicEffects).filter(i => Math.abs(activePeriodicEffects[i].nextExpectedGain - event.timestamp) < 25).map(i => activePeriodicEffects[i]);
          let handled = false;
          activeEffects.forEach(activeEffect => {            
            if (!handled) {
              currentMaelstrom = this.buildEnergizeEvent(activeEffect.alternateSpellId ?? activeEffect.spellId, currentMaelstrom, 1, 1, event.timestamp, event);                
              activeEffect.nextExpectedGain = event.timestamp + activeEffect.frequencyMs;
              processedMaelstromEvents.add(event);
              handled = true;
            }
          });   
          // if an active effect 
          if (handled) {
            return;     
          }          
        }
        const abilities = this.getAbilityForEvent(event.ability.guid).filter((ability) => eventTypesMatch(ability, event));
        if (abilities.length > 0) {
          abilities.forEach((ability) => {            
            const foundEvents: Record<number, SpendEventType | GainEventType> = {};

            for (let i = index + 1; i < events.length; i += 1) {
              const forwardEvent = events[i];
              if (timestampCheck(forwardEvent, event, ability.forwardBufferMs ?? 0)) {
                break;
              }              
              if (isMaelstromEvent(forwardEvent)) {
                if (processedMaelstromEvents.has(forwardEvent)) {
                  continue;
                }
                foundEvents[i] = forwardEvent;
              }
            }

            for (let i = index - 1; i >= 0; i -= 1) {
              const backwardsEvent = events[i];
              if (timestampCheck(event, backwardsEvent, ability.backwardsBufferMs ?? 0)) {
                break;
              }              
              if (isMaelstromEvent(backwardsEvent)) {
                if (processedMaelstromEvents.has(backwardsEvent)) {
                  continue;
                }
                foundEvents[i] = backwardsEvent;
              }
            }            

            let orderedEvents = typedKeys(foundEvents).sort().map((i) => foundEvents[i]);
            if (orderedEvents.length === 0) {
              return;
            }

            if ((ability.type & MaelstromAbilityType.Spender) === MaelstromAbilityType.Spender && event.type === EventType.Cast) {
              const spend = orderedEvents.find(isSpend);
              if (spend === undefined) {
                return;
              }
              let cost = Math.min(this.maxSpend, currentMaelstrom);
              if (spend?.type === EventType.RemoveBuffStack) {
                cost = currentMaelstrom - spend.stack;
              }
              
              const cr = getMaelstromClassResources(event, this.maxResource)!;
              cr.amount = cost;
              cr.cost = cost;
              currentMaelstrom -= cost;
              processedMaelstromEvents.add(spend);
            }

            if ((ability.type & MaelstromAbilityType.Builder) === MaelstromAbilityType.Builder) {
              const spendEventIndex = orderedEvents.findIndex(e => e.type === EventType.RemoveBuff || e.type === EventType.RemoveBuffStack);
              if (spendEventIndex >= 0) {
                orderedEvents = orderedEvents.filter((_, i) => i > spendEventIndex);
              }
              currentMaelstrom = this.buildEnergizeEvent(ability.primarySpell, currentMaelstrom, ability.maximum, orderedEvents.filter(isGain).length, event.timestamp, ...orderedEvents);              
              orderedEvents.forEach(e => processedMaelstromEvents.add(e));
            }            
          })
        }
      }            
    });

    return DEBUG ? this.fixedEvents : this.fixedEvents.filter(f => !isMaelstromEvent(f));
  }

  private buildEnergizeEvent(spell: number | Spell, current: number, maximum: number, gain: number, timestamp: number, ...linkToEvent: AnyEvent[]): number {    
    const change = Math.min(maximum, gain);                
    current += change;
    const resourceChange: ResourceChangeEvent = {
      ability: spellToAbility(spell)!,
      type: EventType.ResourceChange,
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
      resourceChangeType: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      resourceChange: change,
      waste: Math.max(0, current - this.maxResource),
      otherResourceChange: 0,
      resourceActor: ResourceActor.Source,
      __modified: true,
      // don't care about these values
      classResources: [],
      hitPoints: 0,
      maxHitPoints: 0,
      attackPower: 0,
      spellPower: 0,
      armor: 0,
      x: 0,
      y: 0,
      facing: 0,
      mapID: 0,
      itemLevel: 0,
      timestamp: timestamp
    };

    linkToEvent.forEach((linkedEvent) => AddRelatedEvent(resourceChange, 'maelstrom-resource-link', linkedEvent));
    // insert before event that generated it
    this.fixedEvents.push(resourceChange);
    return Math.min(this.maxResource, current);
  }  

  private getAbilityForEvent(spellId: number) {
    return this.resourceRelatedEvents.filter(b => spellsMatch(b, spellId)) ?? [];
  }

  private periodicSpells: PeriodicGainEffect[] = [
    { spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id, frequencyMs: 3000, immediateGain: true, maxGainPerInterval: 1 },
    { spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id, frequencyMs: 1000, immediateGain: false, maxGainPerInterval: this.selectedCombatant.getTalentRank(TALENTS.STATIC_ACCUMULATION_TALENT) }
  ];

  private loadAbilities(): MaelstromRelatedAbility[] {
    return [
      {
        spell: SPELLS.MELEE,
        forwardBufferMs: BufferMs.Damage
      },
      {
        spell: SPELLS.WINDFURY_ATTACK,
        forwardBufferMs: BufferMs.Damage
      },
      {
        spell:TALENTS.ICE_STRIKE_TALENT,
        forwardBufferMs: BufferMs.Damage
      },
      {
        spell: TALENTS.LAVA_LASH_TALENT,
        forwardBufferMs: BufferMs.Damage
      },
      // Stormstrike mh and oh hits should reattribute to Stormstrike cast
      {
        spell: [SPELLS.STORMSTRIKE_DAMAGE, SPELLS.STORMSTRIKE_DAMAGE_OFFHAND],
        alternateSpell: TALENTS.STORMSTRIKE_TALENT,
        forwardBufferMs: BufferMs.Damage
      },
      // Windstrike mh and oh hits should reattribute to Stormstrike cast
      {
        spell: [SPELLS.WINDSTRIKE_DAMAGE, SPELLS.WINDSTRIKE_DAMAGE_OFFHAND],
        enabled: [TALENTS.ASCENDANCE_ENHANCEMENT_TALENT, TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT].some((talent) => this.selectedCombatant.hasTalent(talent)),
        alternateSpell: TALENTS.STORMSTRIKE_TALENT,
        forwardBufferMs: BufferMs.Damage
      },
      // Windstrike casts should reattribute to Stormstrike cast
      {
        spell: SPELLS.WINDSTRIKE_CAST,
        eventType: EventType.Cast,
        enabled: this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT) && [TALENTS.ASCENDANCE_ENHANCEMENT_TALENT, TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT].some((talent) => this.selectedCombatant.hasTalent(talent)),
        alternateSpell: TALENTS.STORMSTRIKE_TALENT,
        forwardBufferMs: BufferMs.Cast
      },
      // Elemental Assault for Stormstrike & Lava Lash
      {
        spell: [TALENTS.STORMSTRIKE_TALENT],
        eventType: EventType.Cast,
        enabled: this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
        alternateSpell: TALENTS.ELEMENTAL_ASSAULT_TALENT,
        forwardBufferMs: BufferMs.Cast
      },
      {
        spell: [TALENTS.ICE_STRIKE_TALENT],
        eventType: EventType.Cast,
        enabled: this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
        alternateSpell: TALENTS.ELEMENTAL_ASSAULT_TALENT,
        forwardBufferMs: BufferMs.Cast
      },
      {
        spell: [TALENTS.LAVA_LASH_TALENT],
        eventType: EventType.Cast,
        enabled: this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
        alternateSpell: TALENTS.ELEMENTAL_ASSAULT_TALENT,
        forwardBufferMs: BufferMs.Cast
      },      
      {
        spell: TALENTS.ICE_STRIKE_TALENT,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT), //[TALENTS.SWIRLING_MAELSTROM_TALENT, TALENTS.ELEMENTAL_ASSAULT_TALENT].some((talent) => this.selectedCombatant.hasTalent(talent)),
        maximum: 1, //Number(this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT)) + Number(this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT)),
        eventType: EventType.Cast,
        alternateSpell: TALENTS.SWIRLING_MAELSTROM_TALENT,
        forwardBufferMs: BufferMs.Cast
      },
      {
        spell: TALENTS.CRASH_LIGHTNING_TALENT,
        enabled: this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT),
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits
      },
      {
        spell: SPELLS.CRASH_LIGHTNING_BUFF,
        enabled: this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT),
        alternateSpell: TALENTS.CRASH_LIGHTNING_TALENT,
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits
      },
      {
        spell: TALENTS.DOOM_WINDS_TALENT,
        enabled: this.selectedCombatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        forwardBufferMs: BufferMs.Damage
      },
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT),
        eventType: EventType.Cast,
        backwardsBufferMs: BufferMs.Cast,
        alternateSpell: TALENTS.SWIRLING_MAELSTROM_TALENT
      },
      {
        spell: TALENTS.SUNDERING_TALENT,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SUNDERING_TALENT),
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits
      },
      {
        spell: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT,
        eventType: EventType.Cast,
        forwardBufferMs: BufferMs.None,
        backwardsBufferMs: BufferMs.PrimordialWave,
        maximum: 5 * this.selectedCombatant.getTalentRank(TALENTS.PRIMAL_MAELSTROM_TALENT),
      },
      {
        spell: [SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT, SPELLS.TEMPEST_CAST, TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT, TALENTS.LAVA_BURST_TALENT, SPELLS.HEALING_SURGE, TALENTS.CHAIN_HEAL_TALENT],
        type: MaelstromAbilityType.Spender,
        eventType: EventType.Cast,
        forwardBufferMs: BufferMs.None,
        backwardsBufferMs: BufferMs.Cast
      },
      {
        spell: [SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT],
        type: MaelstromAbilityType.Builder,
        enabled: this.selectedCombatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT),
        maximum: this.maxSpend,
        eventType: EventType.Cast,
        forwardBufferMs: BufferMs.Spender,
        alternateSpell: TALENTS.STATIC_ACCUMULATION_TALENT,
      },      
      {
        spell: [SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT, SPELLS.TEMPEST_CAST],
        type: MaelstromAbilityType.Builder,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SUPERCHARGE_TALENT),
        maximum: 3,
        eventType: EventType.Cast,
        forwardBufferMs: BufferMs.Spender,
        alternateSpell: TALENTS.SUPERCHARGE_TALENT,
      },      
      {
        spell: SPELLS.TEMPEST_CAST,
        type: MaelstromAbilityType.Spender,
        eventType: EventType.Cast,
        alternateSpell: TALENTS.TEMPEST_TALENT,
        backwardsBufferMs: BufferMs.Cast,
      },
      {
        spell: SPELLS.TEMPEST_CAST,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SUPERCHARGE_TALENT),
        eventType: EventType.Cast,
        alternateSpell: TALENTS.SUPERCHARGE_TALENT,
        maximum: 3,
        forwardBufferMs: BufferMs.Damage,
      },
      {
        spell: SPELLS.TEMPEST_CAST,
        enabled: this.selectedCombatant.hasTalent(TALENTS.STORM_SWELL_TALENT),
        eventType: EventType.Damage,
        alternateSpell: TALENTS.STORM_SWELL_TALENT,
        backwardsBufferMs: BufferMs.Cast,
        forwardBufferMs: BufferMs.Disabled,         
      },
    ]
  }
}

function getMaelstromClassResources<T extends string>(event: BaseCastEvent<T>, max: number) {
  event.classResources ??= [];
  const index = event.classResources.findIndex((cr) => cr.type === RESOURCE_TYPES.MAELSTROM_WEAPON.id);
  const classResource: ClassResources & { cost: number } = index >= 0 ? event.classResources[index] : {
    amount: 0,
    max: max,
    type: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
    cost: 0
  };
  if (index < 0) {
    event.classResources.push(classResource!);
  }
  return classResource;
}

function startPeriodicGain(startEvent: ApplyBuffEvent, conditions: PeriodicGainEffect): ActivePeriodicGainEffect {
  return {
    ...conditions,      
    nextExpectedGain: startEvent.timestamp + (conditions.immediateGain ? 0 : conditions.frequencyMs),
  }
}

function getSpell(ability: MaelstromAbility, spellId: number) {
  if (ability.alternateSpell) {
    return ability.alternateSpell;
  }
  if (Array.isArray(ability.spell)) {
    return ability.spell.find(s => s.id === spellId);
  }
  return ability.spell;
}

function spellToAbility(spell: Spell | number) : Ability | undefined {
  if (typeof spell === "number") {
    spell = maybeGetTalentOrSpell(spell)!;
  }
  if (typeof spell === "undefined"){
    return undefined;
  }
  return {
    guid: spell.id,
    name: spell.name,
    abilityIcon: `${spell.icon}.jpg`,
    type: 0
  }  
}

function isGain(event: AnyEvent): event is GainEventType {
  return (event as GainEventType).ability !== undefined && (event as GainEventType).ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id;
}

function isSpend(event: AnyEvent): event is SpendEventType {
  return (event as SpendEventType).ability !== undefined && (event as SpendEventType).ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id;
}

function isMaelstromEvent(event: AnyEvent): event is SpendEventType | GainEventType {
  if ((event as SpendEventType | GainEventType).ability !== undefined && HasAbility(event) && event.type !== EventType.ResourceChange) {
    return event.ability!.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id;
  }
  return false;
}

function timestampCheck(A: AnyEvent, B: AnyEvent, bufferMs: number) {
  return (A.timestamp - B.timestamp) > bufferMs;
}

function spellsMatch(ability: MaelstromAbility, spellId: number): boolean {
  if (Array.isArray(ability.spell)) {
    return ability.spell.some(s => s.id === spellId);
  }
  return spellId === ability.spell.id;
}

function eventTypesMatch(ability: MaelstromAbility, event: AnyEvent) {
  if (Array.isArray(ability.eventType)) {
    return ability.eventType.some(s => s === event.type);
  }
  return ability.eventType === event.type
}

export default MaelstromWeaponResourceNormalizer;
