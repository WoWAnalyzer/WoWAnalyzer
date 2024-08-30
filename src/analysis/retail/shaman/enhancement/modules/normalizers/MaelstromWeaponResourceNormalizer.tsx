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
  GetRelatedEvent,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
  HasSource,
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
import Combatant from 'parser/core/Combatant';

enum MaelstromAbilityType {
  Builder = 1,
  Spender = 2,
}

enum BufferMs {
  Disabled = -1,
  OnSameTimestamp = 0,
  MinimumDamageBuffer = 5,
  Cast = 20,
  Ticks = 40,
  Damage = 55,
  SpendBackward = 25,
  PrimordialWave = 100,
  StaticAccumulation = 185,
}

enum SearchDirection {
  ForwardsOnly,
  BackwardsOnly,
  ForwardsFirst,
  BackwardsFirst,
}

enum MatchMode {
  MatchFirst,
  MatchLast,
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

interface MaelstromAbility {
  spellId: number | number[];
  forwardBufferMs?: number;
  backwardsBufferMs?: number;
  minimumBuffer?: number;
  linkFromEventType: EventType | EventType[];
  linkToEventType: EventType | EventType[];
  enabled?: ((c: Combatant) => boolean) | undefined;
  maximum?: ((combatant: Combatant) => number) | number | undefined;
  requiresExact?: boolean;
  type?: MaelstromAbilityType;
  spellIdOverride?: number | SpellOverride[];
  searchDirection: SearchDirection;
  matchMode?: MatchMode;
  updateExistingEvent?: boolean;
}

interface SpellOverride {
  replaceWithSpellId: number;
  spellId: number | number[];
}

interface PeriodicGainEffect {
  /** event ability guid */
  spellId: number;
  frequencyMs: number;
  /** replace resource gains with this */
  spellIdOverride?: number | undefined;
}

interface ActivePeriodicGainEffect extends PeriodicGainEffect {
  nextExpectedGain: number;
  end: number;
}

interface SearchResult {
  index: number;
  events: AnyEvent[];
}
class MaelstromWeaponResourceNormalizer extends EventsNormalizer {
  private readonly maxResource: number;
  private readonly maxSpend: number;

  private readonly searchFunctions = {
    [SearchDirection.ForwardsOnly]: (...args) => this._lookAhead(...args),
    [SearchDirection.BackwardsOnly]: (...args) => this._lookBehind(...args),
    [SearchDirection.ForwardsFirst]: (...args) =>
      this._lookAhead(...args) ?? this._lookBehind(...args),
    [SearchDirection.BackwardsFirst]: (...args) =>
      this._lookBehind(...args) ?? this._lookAhead(...args),
  } satisfies Record<
    SearchDirection,
    (
      ability: MaelstromAbility,
      index: number,
      events: AnyEvent[],
      skip: Set<AnyEvent>,
    ) => SearchResult | undefined
  >;

  constructor(options: Options) {
    super(options);
    this.priority = NormalizerOrder.MaelstromWeaponResourceNormalizer;

    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.RAGING_MAELSTROM_TALENT) ? 10 : 5;
    this.maxSpend = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT) ? 10 : 5;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const skip = new Set<AnyEvent>();

    // pre-process gains from periodic sources such as feral spirit and static accumulation's passive
    events = this._normalizePeriodicGains(events, skip);

    /* process each active maelstrom related ability. unfortunately this required one parse per configuration,
     * but multiple spells can be grouped when they relate to the same generator or spender */
    typedKeys(MAELSTROM_ABILITIES).forEach((key) => {
      const ability: MaelstromAbility = MAELSTROM_ABILITIES[key];
      if (!(ability.enabled === undefined || ability.enabled(this.selectedCombatant))) {
        return;
      }

      // ensure maximum is a number
      ability.maximum =
        typeof ability.maximum === 'function'
          ? ability.maximum(this.selectedCombatant)
          : ability.maximum ?? 1;

      for (let index = 0; index < events.length; index += 1) {
        const event = events[index];

        // only interested in ability events
        if (
          HasAbility(event) &&
          eventTypeAndSpellMatch(ability.spellId, ability.linkFromEventType, event) &&
          this._sourceCheck(event)
        ) {
          const spellId = getSpellId(ability, event)!;
          const searchResult = this.searchFunctions[ability.searchDirection](
            ability,
            index,
            events,
            skip,
          );

          if (!searchResult) {
            continue;
          }

          const foundEvents = searchResult.events;
          if (
            ability.type !==
            MaelstromAbilityType.Spender /* MaelstromAbility.Type.Builder | undefined */
          ) {
            const resourcChangeEvent: ResourceChangeEvent =
              event.type === EventType.ResourceChange ? event : this._buildEnergizeEvent(spellId);
            resourcChangeEvent.timestamp = foundEvents[0].timestamp;
            resourcChangeEvent.resourceChange = foundEvents.length;
            this._linkEnergizeEvent(resourcChangeEvent, ...foundEvents);

            const isExisting = resourcChangeEvent === event;
            if (isExisting && ability.updateExistingEvent) {
              const moveToIndex = searchResult.index - 1;
              if (moveToIndex > index) {
                const moved = events.splice(index + 1, moveToIndex - index);
                events.splice(index, 0, ...moved);
              } else if (moveToIndex < index) {
                const moved = events.splice(moveToIndex + 1, index - moveToIndex - 1);
                events.splice(moveToIndex + moved.length, 0, ...moved);
              }
            } else if (!isExisting) {
              AddRelatedEvent(resourcChangeEvent, `${MAELSTROM_WEAPON}-source`, event);
              events.splice(searchResult.index, 0, resourcChangeEvent);
            }

            foundEvents.forEach((e) => {
              skip.add(e);
            });
          }

          if (ability.type === MaelstromAbilityType.Spender) {
            if (event.type !== EventType.Cast && event.type !== EventType.FreeCast) {
              continue;
            }
            const spend = foundEvents.find((e) => SPEND_EVENT_TYPES.includes(e.type)) as
              | RemoveBuffEvent
              | RemoveBuffStackEvent
              | undefined;
            if (spend === undefined) {
              continue;
            }
            // this just ensures the class resource object exists on the cast event
            const cr = getMaelstromClassResources(event as CastEvent, this.maxResource);
            cr.amount = spend.type === EventType.RemoveBuff ? 0 : spend.stack;

            if (HasRelatedEvent(spend, MAELSTROM_WEAPON)) {
              console.error('Already has a related spend event', spend, foundEvents);
            }

            AddRelatedEvent(event, MAELSTROM_WEAPON, spend);
            AddRelatedEvent(spend, `${MAELSTROM_WEAPON}-reverse`, event);

            skip.add(spend);
          }
        }
      }
    });

    this._doResourceCalculations(events);

    return events;
  }

  /**
   * Find any periodic gains, such as feral spirit and the passive generation from Static Accumulation
   */
  private _normalizePeriodicGains(events: AnyEvent[], skip: Set<AnyEvent>): AnyEvent[] {
    const activePeriodicEffects: Record<number, ActivePeriodicGainEffect> = {};

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];

      if (HasAbility(event)) {
        const periodicEffect = PERIODIC_SPELLS.find(
          (effect) => effect.spellId === event.ability.guid,
        );
        if (periodicEffect) {
          if (event.type === EventType.ApplyBuff) {
            const activePeriodicEffect = startPeriodicGain(event, periodicEffect);
            activePeriodicEffects[periodicEffect.spellId] = activePeriodicEffect;

            // got the effect, now find the removal
            for (let forwardIndex = index + 1; forwardIndex < events.length; forwardIndex += 1) {
              const forwardEvent = events[forwardIndex];
              if (
                forwardEvent.type === EventType.RemoveBuff &&
                forwardEvent.ability.guid === periodicEffect.spellId
              ) {
                activePeriodicEffect.end = forwardEvent.timestamp;
                break;
              }
            }

            // if no event found by the end, set to the last event timestamp
            if (activePeriodicEffect.end === 0) {
              activePeriodicEffect.end = events.at(-1)!.timestamp;
            }

            for (let forwardIndex = index + 1; forwardIndex < events.length; forwardIndex += 1) {
              const forwardEvent = events[forwardIndex];
              if (forwardEvent.timestamp > activePeriodicEffect.nextExpectedGain) {
                const periodicResourceChange = this._buildEnergizeEvent(
                  activePeriodicEffect.spellIdOverride ?? activePeriodicEffect.spellId,
                );
                periodicResourceChange.timestamp = activePeriodicEffect.nextExpectedGain;
                events.splice(forwardIndex, 0, periodicResourceChange);
                activePeriodicEffect.nextExpectedGain += activePeriodicEffect.frequencyMs;
                if (activePeriodicEffect.nextExpectedGain > activePeriodicEffect.end) {
                  break;
                }
              }
            }
          }
          if (event.type === EventType.RemoveBuff) {
            delete activePeriodicEffects[periodicEffect.spellId];
          }
        }
      }
    }

    return events;
  }

  private _doResourceCalculations(events: AnyEvent[]) {
    let current = 0;
    events.forEach((event) => {
      if (
        event.type === EventType.ResourceChange &&
        event.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id
      ) {
        const buffs = GetRelatedEvents<ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent>(
          event,
          MAELSTROM_WEAPON,
          (e) => GAIN_EVENT_TYPES.includes(e.type),
        );
        const fromEvent = GetRelatedEvent(event, `${MAELSTROM_WEAPON}-source`);

        if (buffs.length === 0) {
          return;
        }
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
        const expectedWaste = buffs.filter((b) => b.type === EventType.RefreshBuff);
        if (DEBUG) {
          if (current !== expectedCurrent || event.waste !== expectedWaste.length) {
            console.log(
              `${event.timestamp} (${this.owner.formatTimestamp(event.timestamp, 3)}): expected maelstrom: ${expectedCurrent}/${expectedWaste.length}, calculated: ${current}/${event.waste}`,
              fromEvent,
              event,
              lastBuff,
              ...expectedWaste,
            );
          }
        }

        current = expectedCurrent;
        event.waste = expectedWaste.length;
      } else if (event.type === EventType.Cast) {
        const cr = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
        if (cr) {
          const buffs = GetRelatedEvents<RemoveBuffEvent | RemoveBuffStackEvent>(
            event,
            MAELSTROM_WEAPON,
            (e) => SPEND_EVENT_TYPES.includes(e.type),
          );
          if (DEBUG && buffs.length !== 1) {
            console.error(
              `Multiple linked spend events at ${this.owner.formatTimestamp(event.timestamp, 3)}`,
              event,
              buffs,
            );
          }
          const expectedCost =
            buffs[0].type === EventType.RemoveBuff ? current : current - buffs[0].stack;

          cr.cost = current - cr.amount;
          if (cr.cost !== expectedCost) {
            DEBUG &&
              console.log(
                `${this.owner.formatTimestamp(event.timestamp, 3)}: expected maelstrom spent: ${expectedCost}, actual: ${cr.cost}`,
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
  }

  private _sourceCheck(event: AnyEvent): boolean {
    return HasSource(event) && event.sourceID === this.selectedCombatant.id;
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
  private _lookBehind(
    ability: MaelstromAbility,
    currentIndex: number,
    arr: AnyEvent[],
    skipTheseEvents: Set<AnyEvent>,
  ): SearchResult | undefined {
    const event = arr[currentIndex];

    const matches: SearchResult[] = [];
    let current: SearchResult = { index: 0, events: [] };
    matches.push(current);

    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      const backwardsEvent = arr[index];
      if (timestampCheck(event, backwardsEvent, ability.backwardsBufferMs ?? 0)) {
        break;
      }
      if (Math.abs(event.timestamp - backwardsEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
        continue;
      }
      if (
        current.events.length > 0 &&
        !eventTypeAndSpellMatch(
          SPELLS.MAELSTROM_WEAPON_BUFF.id,
          ability.linkToEventType,
          backwardsEvent,
        )
      ) {
        if (
          backwardsEvent.type === EventType.ResourceChange &&
          backwardsEvent.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id &&
          backwardsEvent.resourceChange === 0
        ) {
          continue;
        }
        current = { index: 0, events: [] };
        matches.push(current);
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
        current.index = index;
        current.events.splice(0, 0, backwardsEvent);
      }
    }

    if (matches.length > 0) {
      // apply matching rules to each group
      const results: (SearchResult | undefined)[] = matches.map((m) => {
        const events = m.events;
        if ((ability.maximum as number) < 0) {
          return events.length > 0 && events.length <= this.maxSpend ? m : undefined;
        }

        // select no. of events from end
        const truncatedEvents =
          ability.matchMode === MatchMode.MatchFirst
            ? events.slice(-(ability.maximum as number))
            : events.slice(0, ability.maximum as number);
        if (ability.requiresExact && truncatedEvents.length !== ability.maximum) {
          return undefined;
        }
        if (truncatedEvents.length > 0) {
          return { index: m.index, events: truncatedEvents };
        }

        return undefined;
      });

      return results
        .filter((r) => r !== undefined)
        .sort((a, _) => a.events[0].timestamp - event.timestamp)
        .at(0);
    }
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
  private _lookAhead(
    ability: MaelstromAbility,
    currentIndex: number,
    arr: AnyEvent[],
    skipTheseEvents: Set<AnyEvent>,
  ): SearchResult | undefined {
    const event = arr[currentIndex];

    const matches: SearchResult[] = [];
    let current: SearchResult = { index: 0, events: [] };
    matches.push(current);

    for (let index = currentIndex + 1; index < arr.length; index += 1) {
      const forwardEvent = arr[index];
      if (timestampCheck(forwardEvent, event, ability.forwardBufferMs ?? 0)) {
        break;
      }
      if (Math.abs(event.timestamp - forwardEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
        continue;
      }
      if (
        current.events.length > 0 &&
        !eventTypeAndSpellMatch(
          SPELLS.MAELSTROM_WEAPON_BUFF.id,
          ability.linkToEventType,
          forwardEvent,
        )
      ) {
        if (
          forwardEvent.type === EventType.ResourceChange &&
          forwardEvent.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id &&
          forwardEvent.resourceChange === 0
        ) {
          continue;
        }
        current = { index: 0, events: [] };
        matches.push(current);
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
        current.index = current.index === 0 ? index : current.index;
        current.events.push(forwardEvent);
      }
    }

    if (matches.length > 0) {
      // apply matching rules to each group
      const results: (SearchResult | undefined)[] = matches.map((m) => {
        const events = m.events;
        if ((ability.maximum as number) < 0) {
          return events.length > 0 && events.length <= this.maxSpend ? m : undefined;
        }

        // select no. of events from end
        const truncatedEvents =
          ability.matchMode === MatchMode.MatchFirst
            ? events.slice(0, ability.maximum as number)
            : events.slice(-(ability.maximum as number));
        if (ability.requiresExact && truncatedEvents.length !== ability.maximum) {
          return undefined;
        }
        if (truncatedEvents.length > 0) {
          return { index: m.index, events: truncatedEvents };
        }

        return undefined;
      });

      return results
        .filter((r) => r !== undefined)
        .sort((a, _) => a.events[0].timestamp - event.timestamp)
        .at(0);
    }
  }

  /**
   * Creates a {@link ResourceChangeEvent} from the given spell, and optionally links the event to an array of {@link AnyEvent}
   * @param spell spellId or {@link Spell} object
   * @param gain amount of resources gained
   * @param timestamp timestamp for the event
   * @param linkToEvent array of {@link AnyEvent} to link to the returned {@link ResourceChangeEvent}
   * @returns a {@link ResourceChangeEvent}
   */
  private _buildEnergizeEvent(spell: number | Spell): ResourceChangeEvent {
    const resourceChange: ResourceChangeEvent = {
      ability: spellToAbility(spell)!,
      type: EventType.ResourceChange,
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
      resourceChangeType: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      resourceChange: 0,
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
      /** timestamp will be updated when this is associated with maelstrom stacks */
      timestamp: 0,
    };

    return resourceChange;
  }

  private _linkEnergizeEvent(event: ResourceChangeEvent, ...linkToEvent: AnyEvent[]) {
    linkToEvent.forEach((linkedEvent) => {
      AddRelatedEvent(event, MAELSTROM_WEAPON, linkedEvent);
      AddRelatedEvent(linkedEvent, `${MAELSTROM_WEAPON}-reverse`, event);
    });
  }
}

const MAELSTROM_ABILITIES = {
  SPENDERS: {
    spellId: [
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
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.Damage,
    backwardsBufferMs: BufferMs.SpendBackward,
    linkToEventType: SPEND_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
  },
  STORM_SWELL: {
    spellId: SPELLS.TEMPEST_CAST.id,
    enabled: (c) => c.hasTalent(TALENTS.STORM_SWELL_TALENT),
    linkFromEventType: EventType.Damage,
    spellIdOverride: TALENTS.STORM_SWELL_TALENT.id,
    maximum: MAXIMUM_MAELSTROM_PER_EVENT[TALENTS.STORM_SWELL_TALENT.id],
    requiresExact: true,
    backwardsBufferMs: 5,
    forwardBufferMs: 5,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    matchMode: MatchMode.MatchLast,
  },
  SUPERCHARGE: {
    spellId: [
      SPELLS.LIGHTNING_BOLT.id,
      TALENTS.CHAIN_LIGHTNING_TALENT.id,
      SPELLS.TEMPEST_CAST.id,
      /**
       * Currently any maelstrom spender can proc supercharge, once bug is fixed remove any abilities below this comment
       */
      TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
      SPELLS.HEALING_SURGE.id,
      TALENTS.LAVA_BURST_TALENT.id,
    ],
    type: MaelstromAbilityType.Builder,
    enabled: (c) => c.hasTalent(TALENTS.SUPERCHARGE_TALENT),
    maximum: MAXIMUM_MAELSTROM_PER_EVENT[TALENTS.SUPERCHARGE_TALENT.id],
    requiresExact: true,
    linkFromEventType: EventType.Cast,
    forwardBufferMs: BufferMs.Damage,
    spellIdOverride: TALENTS.SUPERCHARGE_TALENT.id,
    minimumBuffer: 0,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
  },
  STATIC_ACCUMULATION: {
    spellId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id, SPELLS.TEMPEST_CAST.id],
    type: MaelstromAbilityType.Builder,
    enabled: (c) => c.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT),
    maximum: -1,
    linkFromEventType: EventType.Cast,
    forwardBufferMs: BufferMs.StaticAccumulation,
    spellIdOverride: TALENTS.STATIC_ACCUMULATION_TALENT.id,
    minimumBuffer: 50,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
  },
  // Swirling maelstrom has higher priority than Elemental Assault, as the later can be a chance if 1 of 2 talents invested
  SWIRLING_MAELSTROM: {
    spellId: [TALENTS.ICE_STRIKE_TALENT.id, TALENTS.FROST_SHOCK_TALENT.id],
    enabled: (c) => c.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT),
    linkFromEventType: EventType.Cast,
    spellIdOverride: TALENTS.SWIRLING_MAELSTROM_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    backwardsBufferMs: 5, // backwards buffer seems to only occur for frost shock
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    matchMode: MatchMode.MatchFirst,
  },
  ELEMENTAL_ASSAULT: {
    spellId: [
      TALENTS.STORMSTRIKE_TALENT.id,
      SPELLS.WINDSTRIKE_CAST.id,
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.ICE_STRIKE_TALENT.id,
    ],
    linkFromEventType: EventType.Cast,
    enabled: (c) => c.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
    spellIdOverride: TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  PRIMORDIAL_WAVE: {
    spellId: TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
    linkFromEventType: EventType.Cast,
    forwardBufferMs: BufferMs.OnSameTimestamp,
    backwardsBufferMs: BufferMs.PrimordialWave,
    maximum: (c) => c.getTalentRank(TALENTS.PRIMAL_MAELSTROM_TALENT) * 5,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.BackwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  ASCENDANCE_PERIODIC_GAIN: {
    spellId: [TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id],
    linkFromEventType: [EventType.ResourceChange, ...GAIN_EVENT_TYPES],
    linkToEventType: GAIN_EVENT_TYPES,
    forwardBufferMs: BufferMs.Ticks,
    backwardsBufferMs: BufferMs.Ticks,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: (c) => c.getTalentRank(TALENTS.STATIC_ACCUMULATION_TALENT),
    requiresExact: true,
    updateExistingEvent: true,
  },
  FERAL_SPIRIT_PERIODIC_GAIN: {
    spellId: [SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id, TALENTS.FERAL_SPIRIT_TALENT.id],
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
    linkFromEventType: [EventType.ResourceChange, ...GAIN_EVENT_TYPES],
    linkToEventType: GAIN_EVENT_TYPES,
    forwardBufferMs: BufferMs.Ticks,
    backwardsBufferMs: BufferMs.Ticks,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: 1,
    requiresExact: true,
    updateExistingEvent: true,
  },
  // Melee weapon attacks have a lower priority than other cast and special interaction damage events
  STORMSTRIKE: {
    spellId: [
      SPELLS.STORMSTRIKE_DAMAGE.id,
      SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id,
      SPELLS.WINDSTRIKE_DAMAGE.id,
      SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id,
    ],
    spellIdOverride: TALENTS.STORMSTRIKE_TALENT.id,
    forwardBufferMs: BufferMs.Damage,
    linkFromEventType: EventType.Damage,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  MELEE_WEAPON_ATTACK: {
    // anything classified as a melee hit goes here
    spellId: [
      TALENTS.ICE_STRIKE_TALENT.id,
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      SPELLS.CRASH_LIGHTNING_BUFF.id,
      TALENTS.DOOM_WINDS_TALENT.id,
      TALENTS.SUNDERING_TALENT.id,
      SPELLS.WINDFURY_ATTACK.id,
      SPELLS.MELEE.id,
      SPELLS.WINDLASH.id,
      SPELLS.WINDLASH_OFFHAND.id,
    ],
    spellIdOverride: [
      {
        replaceWithSpellId: SPELLS.MELEE.id,
        spellId: [SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
      },
      {
        replaceWithSpellId: TALENTS.CRASH_LIGHTNING_TALENT.id,
        spellId: SPELLS.CRASH_LIGHTNING_BUFF.id,
      },
    ],
    forwardBufferMs: BufferMs.Damage,
    linkFromEventType: EventType.Damage,
    minimumBuffer: BufferMs.MinimumDamageBuffer,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  UNKNOWN: {
    spellId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
    forwardBufferMs: 0,
    backwardsBufferMs: BufferMs.Disabled,
    linkToEventType: GAIN_EVENT_TYPES,
    linkFromEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
  },
} satisfies Record<string, MaelstromAbility>;

const PERIODIC_SPELLS: PeriodicGainEffect[] = [
  {
    spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
    frequencyMs: 3000,
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
  },
  {
    spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
    frequencyMs: 1000,
    spellIdOverride: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
  },
];

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
    end: 0,
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

function timestampCheck(a: AnyEvent, b: AnyEvent, bufferMs: number) {
  return a.timestamp - b.timestamp > bufferMs;
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

function getSpellId<T extends string>(
  ability: MaelstromAbility,
  event: AbilityEvent<T>,
): number | undefined {
  if (ability.spellIdOverride) {
    if (typeof ability.spellIdOverride === 'number') {
      return ability.spellIdOverride;
    }

    const spellOverride = ability.spellIdOverride.find((override) => {
      if (typeof override.spellId === 'number') {
        return override.spellId === event.ability.guid;
      }
      return override.spellId.includes(event.ability.guid);
    });

    // if no replacement is set, just use the exsting event ability id
    return spellOverride?.replaceWithSpellId ?? event.ability.guid;
  }
  if (typeof ability.spellId === 'number') {
    return ability.spellId === event.ability.guid ? ability.spellId : undefined;
  }
  return ability.spellId.find((s) => s === event.ability.guid);
}

export default MaelstromWeaponResourceNormalizer;
