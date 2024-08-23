import {
  Ability,
  AbilityEvent,
  AddRelatedEvent,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  BaseCastEvent,
  CastEvent,
  ClassResources,
  EventType,
  GetRelatedEvents,
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
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import typedKeys from 'common/typedKeys';
import { NormalizerOrder } from './constants';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

enum MaelstromAbilityType {
  Builder = 1,
  Spender = 2,
}

enum BufferMs {
  Disabled = -1,
  None = 0,
  MinimumDamageBuffer = 5,
  Cast = 20,
  Damage = 40,
  SpendForward = 50,
  SpendBackward = 25,
  PrimordialWave = 100,
  StaticAccumulation = 130,
}

const MAXIMUM_MAELSTROM_PER_EVENT = {
  [TALENTS.STORM_SWELL_TALENT.id]: 3,
  [TALENTS.SUPERCHARGE_TALENT.id]: 3,
  [TALENTS.STATIC_ACCUMULATION_TALENT.id]: 10,
};

const GAIN_EVENT_TYPES = [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff];
const SPEND_EVENT_TYPES = [EventType.RemoveBuff, EventType.RemoveBuffStack];

const DEBUG = true;
const MAELSTROM_WEAPON = 'maelstrom-weapon';

interface MaelstromRelatedAbility {
  spell: number | number[];
  forwardBufferMs?: number;
  backwardsBufferMs?: number;
  minimumBuffer?: number;
  linkFromEventType: EventType | EventType[];
  linkToEventType: EventType | EventType[];
  enabled?: boolean | undefined;
  maximum?: number;
  type?: MaelstromAbilityType;
  alternateSpellId?: number;
  useTimestampFromAbility?: boolean;
  name?: string;
}

interface PeriodicGainEffect {
  spellId: number;
  frequencyMs: number;
  maxGainPerInterval: number;
  alternateSpellId?: number | undefined;
}
interface ActivePeriodicGainEffect extends PeriodicGainEffect {
  nextExpectedGain: number;
  intervalGains: AnyEvent[];
}

class MaelstromAbility implements MaelstromRelatedAbility {
  constructor(spell: MaelstromRelatedAbility) {
    if (
      typeof spell.spell === 'object' &&
      spell.alternateSpellId === undefined &&
      spell.type === MaelstromAbilityType.Builder
    ) {
      throw new Error('When supplying an array of spells, alternateSpell must be defined');
    }
    Object.assign(this, spell);

    if (!this.name) {
      this.name = (
        Array.isArray(this.spell)
          ? this.spell.map((s) => maybeGetTalentOrSpell(s))
          : [maybeGetTalentOrSpell(this.spell)]
      )
        .map((a) => a?.name)
        .join(' / ');
    }
  }

  spell!: number | number[];
  linkFromEventType!: MaelstromRelatedAbility['linkFromEventType'];
  linkToEventType!: MaelstromRelatedAbility['linkToEventType'];
  forwardBufferMs: MaelstromRelatedAbility['forwardBufferMs'];
  backwardsBufferMs: MaelstromRelatedAbility['backwardsBufferMs'];
  minimumBuffer: MaelstromRelatedAbility['minimumBuffer'];
  alternateSpellId: MaelstromRelatedAbility['alternateSpellId'];
  enabled: MaelstromRelatedAbility['enabled'] = true;
  type: MaelstromAbilityType = MaelstromAbilityType.Builder;
  maximum: number = 1;
  useTimestampFromAbility: MaelstromRelatedAbility['useTimestampFromAbility'] = false;
  name: MaelstromRelatedAbility['name'];

  get primarySpell(): number {
    // only valid for builder types
    if (this.alternateSpellId) {
      return this.alternateSpellId;
    } else {
      return this.spell as number;
    }
  }

  get isBuilder() {
    return this.type === MaelstromAbilityType.Builder;
  }

  get isSpender() {
    return this.type === MaelstromAbilityType.Spender;
  }
}

class MaelstromWeaponResourceNormalizer extends EventsNormalizer {
  private readonly maxResource: number;
  private readonly maxSpend: number;

  constructor(options: Options) {
    super(options);
    this.priority = NormalizerOrder.MaelstromWeaponResourceNormalizer;

    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.RAGING_MAELSTROM_TALENT) ? 10 : 5;
    this.maxSpend = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT) ? 10 : 5;
  }

  /**
   * Find any periodic gains, such as feral spirit and the passive generation from Static Accumulation
   */
  private normalizePeriodicGains(
    events: AnyEvent[],
    resourceChangeAddedCallback: (linkedEvents: AnyEvent[]) => void,
  ): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    const activePeriodicEffects: Record<number, ActivePeriodicGainEffect> = {};

    events.forEach((event: AnyEvent) => {
      fixedEvents.push(event);
      if (HasAbility(event)) {
        // handle current periodic maelstrom gain effects
        const periodicEffect = this.periodicSpells.find((p) => p.spellId === event.ability.guid);
        if (periodicEffect) {
          if (event.type === EventType.ApplyBuff) {
            activePeriodicEffects[periodicEffect.spellId] = startPeriodicGain(
              event,
              periodicEffect,
            );
          }
          if (event.type === EventType.RemoveBuff) {
            delete activePeriodicEffects[periodicEffect.spellId];
          }
        }

        // if this is a gain and there is a periodic effect active,
        if (GAIN_EVENT_TYPES.includes(event.type)) {
          const activeEffects = typedKeys(activePeriodicEffects)
            .filter(
              (i) => Math.abs(activePeriodicEffects[i].nextExpectedGain - event.timestamp) < 25,
            )
            .map((i) => activePeriodicEffects[i]);
          let handled = false;
          activeEffects.forEach((activeEffect) => {
            if (!handled) {
              activeEffect.intervalGains.push(event);
              if (activeEffect.intervalGains.length >= activeEffect.maxGainPerInterval) {
                const resourceChange = this.buildEnergizeEvent(
                  activeEffect.alternateSpellId ?? activeEffect.spellId,
                  activeEffect.intervalGains.length,
                  activeEffect.intervalGains[0].timestamp,
                  ...activeEffect.intervalGains,
                );
                fixedEvents.push(resourceChange);
                resourceChangeAddedCallback(activeEffect.intervalGains);

                activeEffect.intervalGains = [];
                activeEffect.nextExpectedGain = event.timestamp + activeEffect.frequencyMs;
              }
              handled = true;
            }
          });
        }
      }
    });

    return fixedEvents;
  }

  /** For debugging purposes only */
  private processEvent<T extends string>(
    processed: any,
    ability: MaelstromAbility,
    event: AbilityEvent<T>,
    events: AnyEvent[],
  ) {
    const name = ability.isSpender
      ? event.ability.name
      : maybeGetTalentOrSpell(ability.primarySpell)?.name ?? ability.name!;
    const type = MaelstromAbilityType[ability.type];
    const timestamp = this.owner.formatTimestamp(event.timestamp, 3);

    const abilityObj = (processed[name] ??= {});
    const abilityEvent = (abilityObj[event.type] ??= {});
    const abilityEventType = (abilityEvent[type] ??= { count: 0 });
    const abilityList = (abilityEventType[timestamp] ??= []);

    abilityEventType.count += 1;
    abilityList.push(...events);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const skip = new Set<AnyEvent>();
    const processed: any = {};

    // pre-process gains from periodic sources such as feral spirit and static accumulation's passive
    events = this.normalizePeriodicGains(events, (processedPeriodicGains) => {
      processedPeriodicGains.forEach((event) => skip.add(event));
    });

    const abilities = this.loadAbilities()
      .filter((config) => config.enabled ?? true)
      .map((config) => new MaelstromAbility(config));

    /* process each active maelstrom related ability. unfortunately this required one parse per configuration,
     * but multiple spells can be grouped when they relate to the same generator or spender */

    // TODO: support multiple spells within a single iteration
    abilities.forEach((ability) => {
      const fixedEvents: AnyEvent[] = [];

      events.forEach((event: AnyEvent, index: number) => {
        fixedEvents.push(event);

        // only interested in ability events
        if (
          HasAbility(event) &&
          eventTypeAndSpellMatch(ability.spell, ability.linkFromEventType, event)
        ) {
          // events never "cross boundaries", either all will be before or all will be after.
          const foundEvents =
            this.lookBehind(ability, index, events, skip) ??
            this.lookAhead(ability, index, events, skip);

          DEBUG && this.processEvent(processed, ability, event, foundEvents ?? []);

          if (!foundEvents) {
            return;
          }

          if (ability.isBuilder) {
            const timestamp = ability.useTimestampFromAbility
              ? event.timestamp
              : foundEvents[0].timestamp;
            const resourcChangeEvent = this.buildEnergizeEvent(
              ability.primarySpell,
              foundEvents.length,
              timestamp,
              ...foundEvents,
            );

            fixedEvents.push(resourcChangeEvent);
            foundEvents.forEach((e) => {
              skip.add(e);
            });
          }

          if (ability.isSpender) {
            const spend = foundEvents.find((e) => SPEND_EVENT_TYPES.includes(e.type)) as
              | RemoveBuffEvent
              | RemoveBuffStackEvent
              | undefined;
            if (spend === undefined) {
              return;
            }
            // this just ensures the class resource object exists on the cast event
            const cr = getMaelstromClassResources(event as CastEvent, this.maxResource);
            cr.amount = spend.type === EventType.RemoveBuff ? 0 : spend.stack;

            AddRelatedEvent(spend, MAELSTROM_WEAPON, event);
            AddRelatedEvent(event, MAELSTROM_WEAPON, spend);
            skip.add(spend);
          }
        }
      });

      events = fixedEvents;
    });

    DEBUG && console.info('processed events', processed);

    // final pass, calculate resource amounts and apply gains/losses
    let current = 0;
    events.forEach((event) => {
      if (
        event.type === EventType.ResourceChange &&
        event.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id
      ) {
        const buffs = GetRelatedEvents<ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent>(
          event,
          MAELSTROM_WEAPON,
        );
        const lastBuff = buffs.at(-1)!;

        current += event.resourceChange;
        event.waste = Math.max(current - this.maxResource, 0);
        current = Math.min(current, this.maxResource);

        const expectedCurrent =
          lastBuff.type === EventType.ApplyBuff
            ? 1
            : lastBuff.type === EventType.ApplyBuffStack
              ? lastBuff.stack
              : 10;
        const expectedWaste = buffs.filter((b) => b.type === EventType.RefreshBuff).length;
        if (DEBUG) {
          if (current !== expectedCurrent || event.waste !== expectedWaste) {
            console.log(
              `${this.owner.formatTimestamp(event.timestamp, 3)} (${event.timestamp}) - expected ${expectedCurrent} stacks and ${expectedWaste} waste, but got ${current}/${event.waste}`,
              event,
            );
          }
        }

        current = expectedCurrent;
        event.waste = expectedWaste;
      } else if (event.type === EventType.Cast) {
        const cr = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
        if (cr) {
          const buffs = GetRelatedEvents<RemoveBuffEvent | RemoveBuffStackEvent>(
            event,
            MAELSTROM_WEAPON,
          );
          if (DEBUG && buffs.length !== 1) {
            throw Error(
              `Multiple linked spend events at ${this.owner.formatTimestamp(event.timestamp, 3)}`,
            );
          }
          const expectedCost =
            buffs[0].type === EventType.RemoveBuff ? current : current - buffs[0].stack;

          cr.cost = current - cr.amount;
          if (cr.cost !== expectedCost) {
            DEBUG &&
              console.error(
                `${this.owner.formatTimestamp(event.timestamp, 3)} (${event.timestamp}) - expected cost ${expectedCost} but was ${cr.cost}`,
                event,
                buffs,
              );
            cr.cost = expectedCost;
          }
          current -= cr.cost;
        }
      }
    });

    if (!DEBUG) {
      return events.filter(
        (event) =>
          (HasAbility(event) &&
            event.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id &&
            [...GAIN_EVENT_TYPES, ...SPEND_EVENT_TYPES].includes(event.type)) ||
          (event.type === EventType.ResourceChange &&
            event.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id),
      );
    }

    return events;
  }

  /**
   * Search backwards through {@link arr} from the {@link currentIndex} for an ability
   * that matches {@link ability}
   * @param ability the {@link MaelstromAbility} to find matches for
   * @param currentIndex current position of the index through {@link arr}
   * @param arr events being normalized
   * @param skipTheseEvents any event present in this {@link Set} of events is assumed to have already been associated with a resource gain/spend event
   * @returns related maelstrom buff events
   */
  private lookBehind(
    ability: MaelstromAbility,
    currentIndex: number,
    arr: AnyEvent[],
    skipTheseEvents: Set<AnyEvent>,
  ) {
    const result: AnyEvent[] = [];

    const event = arr[currentIndex];
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      if (result.length === ability.maximum) {
        break;
      }

      const backwardsEvent = arr[index];
      if (timestampCheck(event, backwardsEvent, ability.backwardsBufferMs ?? 0)) {
        break;
      }
      if (Math.abs(event.timestamp - backwardsEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
        continue;
      }
      if (
        eventTypeAndSpellMatch(
          SPELLS.MAELSTROM_WEAPON_BUFF.id,
          ability.linkToEventType,
          backwardsEvent,
        )
      ) {
        if (skipTheseEvents.has(backwardsEvent)) {
          continue;
        }
        result.splice(0, 0, backwardsEvent);
      }
    }

    if (ability.maximum < 0) {
      return result.length > 0 && result.length <= this.maxSpend ? result : undefined;
    }
    return result.length === ability.maximum ? result : undefined;
  }

  /**
   * Search forward through {@link arr} from the {@link currentIndex} for an ability
   * that matches {@link ability}
   * @param ability the {@link MaelstromAbility} to find matches for
   * @param currentIndex current position of the index through {@link arr}
   * @param arr events being normalized
   * @param skipTheseEvents any event present in this {@link Set} of events is assumed to have already been associated with a resource gain/spend event
   * @returns related maelstrom buff events, or undefined if an unexpected number of events are found
   */
  private lookAhead(
    ability: MaelstromAbility,
    currentIndex: number,
    arr: AnyEvent[],
    skipTheseEvents: Set<AnyEvent>,
  ) {
    const result: AnyEvent[] = [];

    const event = arr[currentIndex];
    for (let index = currentIndex + 1; index < arr.length; index += 1) {
      if (result.length === ability.maximum) {
        break;
      }

      const forwardEvent = arr[index];
      if (timestampCheck(forwardEvent, event, ability.forwardBufferMs ?? 0)) {
        break;
      }
      if (Math.abs(event.timestamp - forwardEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
        continue;
      }
      if (
        eventTypeAndSpellMatch(
          SPELLS.MAELSTROM_WEAPON_BUFF.id,
          ability.linkToEventType,
          forwardEvent,
        )
      ) {
        if (skipTheseEvents.has(forwardEvent)) {
          continue;
        }
        result.push(forwardEvent);
      }
    }

    if (ability.maximum < 0) {
      return result.length > 0 && result.length <= this.maxSpend ? result : undefined;
    }
    return result.length === ability.maximum ? result : undefined;
  }

  private buildEnergizeEvent(
    spell: number | Spell,
    gain: number,
    timestamp: number,
    ...linkToEvent: AnyEvent[]
  ): ResourceChangeEvent {
    const resourceChange: ResourceChangeEvent = {
      ability: spellToAbility(spell)!,
      type: EventType.ResourceChange,
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
      resourceChangeType: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      resourceChange: gain,
      waste: 0,
      otherResourceChange: 0,
      resourceActor: ResourceActor.Source,
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
      timestamp: timestamp,
    };

    linkToEvent.forEach((linkedEvent) => {
      linkedEvent.__modified = true;
      // add a link and reverse link
      AddRelatedEvent(linkedEvent, MAELSTROM_WEAPON, resourceChange);
      AddRelatedEvent(resourceChange, MAELSTROM_WEAPON, linkedEvent);
    });
    return resourceChange;
  }

  private readonly periodicSpells: PeriodicGainEffect[] = [
    {
      spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
      frequencyMs: 3000,
      maxGainPerInterval: 1,
      alternateSpellId: TALENTS.FERAL_SPIRIT_TALENT.id,
    },
    {
      spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
      frequencyMs: 1000,
      maxGainPerInterval: this.selectedCombatant.getTalentRank(TALENTS.STATIC_ACCUMULATION_TALENT),
      alternateSpellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
    },
  ];

  private loadAbilities(): MaelstromRelatedAbility[] {
    // this list should be ordered by priority, with items at the end being the last to have a chance to catch a resource gain/spend
    return [
      {
        name: 'Maelstrom spenders',
        spell: [
          SPELLS.LIGHTNING_BOLT.id,
          TALENTS.CHAIN_LIGHTNING_TALENT.id,
          SPELLS.TEMPEST_CAST.id,
          TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
          TALENTS.LAVA_BURST_TALENT.id,
          SPELLS.HEALING_SURGE.id,
          TALENTS.CHAIN_HEAL_TALENT.id,
          TALENTS.LAVA_BURST_TALENT.id,
        ],
        type: MaelstromAbilityType.Spender,
        linkFromEventType: EventType.Cast,
        forwardBufferMs: BufferMs.SpendForward,
        backwardsBufferMs: BufferMs.SpendBackward,
        linkToEventType: SPEND_EVENT_TYPES,
      },
      {
        name: 'Static accumulation',
        spell: [
          SPELLS.LIGHTNING_BOLT.id,
          TALENTS.CHAIN_LIGHTNING_TALENT.id,
          SPELLS.TEMPEST_CAST.id,
        ],
        type: MaelstromAbilityType.Builder,
        enabled: this.selectedCombatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT),
        maximum: -1,
        linkFromEventType: EventType.Cast,
        forwardBufferMs: BufferMs.StaticAccumulation,
        alternateSpellId: TALENTS.STATIC_ACCUMULATION_TALENT.id,
        minimumBuffer: 50,
        useTimestampFromAbility: false,
        linkToEventType: GAIN_EVENT_TYPES,
      },
      {
        spell: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
        alternateSpellId: TALENTS.FERAL_SPIRIT_TALENT.id,
        linkFromEventType: GAIN_EVENT_TYPES,
        linkToEventType: GAIN_EVENT_TYPES,
        forwardBufferMs: BufferMs.Cast,
      },
      {
        name: 'Storm Swell',
        spell: SPELLS.TEMPEST_CAST.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.STORM_SWELL_TALENT),
        linkFromEventType: EventType.Damage,
        alternateSpellId: TALENTS.STORM_SWELL_TALENT.id,
        maximum: MAXIMUM_MAELSTROM_PER_EVENT[TALENTS.STORM_SWELL_TALENT.id],
        backwardsBufferMs: 25,
        forwardBufferMs: 1,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: [
          SPELLS.LIGHTNING_BOLT.id,
          TALENTS.CHAIN_LIGHTNING_TALENT.id,
          SPELLS.TEMPEST_CAST.id,
          TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        ],
        type: MaelstromAbilityType.Builder,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SUPERCHARGE_TALENT),
        maximum: MAXIMUM_MAELSTROM_PER_EVENT[TALENTS.SUPERCHARGE_TALENT.id],
        linkFromEventType: EventType.Cast,
        forwardBufferMs: BufferMs.SpendForward,
        alternateSpellId: TALENTS.SUPERCHARGE_TALENT.id,
        minimumBuffer: 10,
        linkToEventType: GAIN_EVENT_TYPES,
      },

      // Swirling maelstrom has higher priority than Elemental Assault, as the later can be a chance if 1 of 2 talents invested
      {
        spell: [TALENTS.ICE_STRIKE_TALENT.id, TALENTS.FROST_SHOCK_TALENT.id],
        enabled: this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT),
        linkFromEventType: EventType.Cast,
        alternateSpellId: TALENTS.SWIRLING_MAELSTROM_TALENT.id,
        forwardBufferMs: BufferMs.Cast,
        backwardsBufferMs: 2,
        linkToEventType: GAIN_EVENT_TYPES,
      },
      // Elemental Assault for Stormstrike & Lava Lash
      {
        spell: [
          TALENTS.STORMSTRIKE_TALENT.id,
          SPELLS.WINDSTRIKE_CAST.id,
          TALENTS.LAVA_LASH_TALENT.id,
          TALENTS.ICE_STRIKE_TALENT.id,
        ],
        linkFromEventType: EventType.Cast,
        enabled: this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
        alternateSpellId: TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
        forwardBufferMs: BufferMs.Cast * 2,
        linkToEventType: GAIN_EVENT_TYPES,
      },
      {
        spell: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
        linkFromEventType: EventType.Cast,
        forwardBufferMs: BufferMs.None,
        backwardsBufferMs: BufferMs.PrimordialWave,
        maximum: 5 * this.selectedCombatant.getTalentRank(TALENTS.PRIMAL_MAELSTROM_TALENT),
        linkToEventType: GAIN_EVENT_TYPES,
      },
      // Melee weapon attacks have a lower priority than other cast and special interaction damage events

      {
        spell: [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id], // Stormstrike mh and oh hits should reattribute to Stormstrike cast
        alternateSpellId: TALENTS.STORMSTRIKE_TALENT.id,
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: [SPELLS.WINDSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id], // Windstrike mh and oh hits should reattribute to Stormstrike cast
        enabled: [
          TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
          TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT,
        ].some((talent) => this.selectedCombatant.hasTalent(talent)),
        alternateSpellId: TALENTS.STORMSTRIKE_TALENT.id,
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: TALENTS.ICE_STRIKE_TALENT.id,
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        minimumBuffer: BufferMs.MinimumDamageBuffer,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: TALENTS.LAVA_LASH_TALENT.id,
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        minimumBuffer: BufferMs.MinimumDamageBuffer,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: TALENTS.CRASH_LIGHTNING_TALENT.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT),
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits,
        linkFromEventType: EventType.Damage,
        maximum: 20,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: SPELLS.CRASH_LIGHTNING_BUFF.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT),
        alternateSpellId: TALENTS.CRASH_LIGHTNING_TALENT.id,
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits,
        linkFromEventType: EventType.Damage,
        maximum: 20,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: TALENTS.DOOM_WINDS_TALENT.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.DOOM_WINDS_TALENT),
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: TALENTS.SUNDERING_TALENT.id,
        enabled: this.selectedCombatant.hasTalent(TALENTS.SUNDERING_TALENT),
        forwardBufferMs: BufferMs.Damage * 2, // longer buffer due to multiple possible hits,
        linkFromEventType: EventType.Damage,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: SPELLS.WINDFURY_ATTACK.id,
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        minimumBuffer: BufferMs.MinimumDamageBuffer,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
      },
      {
        spell: [SPELLS.MELEE.id, SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
        forwardBufferMs: BufferMs.Damage,
        linkFromEventType: EventType.Damage,
        minimumBuffer: BufferMs.MinimumDamageBuffer,
        linkToEventType: GAIN_EVENT_TYPES,
        useTimestampFromAbility: true,
        alternateSpellId: SPELLS.MELEE.id,
      },
      {
        name: 'Unknown source',
        spell: SPELLS.MAELSTROM_WEAPON_BUFF.id,
        forwardBufferMs: 0,
        backwardsBufferMs: 0,
        linkToEventType: GAIN_EVENT_TYPES,
        linkFromEventType: GAIN_EVENT_TYPES,
      },
    ];
  }
}

function getMaelstromClassResources<T extends string>(event: BaseCastEvent<T>, max: number) {
  event.classResources ??= [];
  const index = event.classResources.findIndex(
    (cr) => cr.type === RESOURCE_TYPES.MAELSTROM_WEAPON.id,
  );
  const classResource: ClassResources & { cost: number } =
    index >= 0
      ? event.classResources[index]
      : {
          amount: 0,
          max: max,
          type: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
          cost: 0,
        };
  if (index < 0) {
    event.classResources.push(classResource!);
  }
  return classResource;
}

function startPeriodicGain(
  startEvent: ApplyBuffEvent,
  conditions: PeriodicGainEffect,
): ActivePeriodicGainEffect {
  return {
    ...conditions,
    nextExpectedGain: startEvent.timestamp + conditions.frequencyMs,
    intervalGains: [],
  };
}

function spellToAbility(spell: Spell | number): Ability | undefined {
  if (typeof spell === 'number') {
    spell = maybeGetTalentOrSpell(spell)!;
  }
  if (typeof spell === 'undefined') {
    return undefined;
  }
  return {
    guid: spell.id,
    name: spell.name,
    abilityIcon: `${spell.icon}.jpg`,
    type: 0,
  };
}

function timestampCheck(A: AnyEvent, B: AnyEvent, bufferMs: number) {
  return A.timestamp - B.timestamp > bufferMs;
}

function spellsMatch(ability: number | number[], spellId: number): boolean {
  if (Array.isArray(ability)) {
    return ability.some((s) => s === spellId);
  }
  return spellId === ability;
}

function eventTypesMatch(eventType: EventType | EventType[], event: AnyEvent) {
  if (Array.isArray(eventType)) {
    return eventType.some((s) => s === event.type);
  }
  return eventType === event.type;
}

function eventTypeAndSpellMatch(
  spellId: number | number[],
  eventType: EventType | EventType[],
  event: AnyEvent,
) {
  return (
    HasAbility(event) &&
    spellsMatch(spellId, event.ability.guid) &&
    eventTypesMatch(eventType, event)
  );
}

export default MaelstromWeaponResourceNormalizer;
