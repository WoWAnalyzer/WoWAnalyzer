import {
  Ability,
  AbilityEvent,
  AddRelatedEvent,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  BaseCastEvent,
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
import {
  MAELSTROM_WEAPON_LINK,
  MAELSTROM_WEAPON_LINK_REVERSE,
  MAELSTROM_WEAPON_SOURCE,
  NormalizerOrder,
} from './constants';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import Combatant from 'parser/core/Combatant';

const DEBUG = false;

const GAIN_EVENT_TYPES = [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff];
const SPEND_EVENT_TYPES = [EventType.RemoveBuff, EventType.RemoveBuffStack];

const SPEND_EVENT_PLACEHOLDER_COST = -1;

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

/**
 * When maelstrom gains, MatchFirst will select from the beginning of the found events
 * while MatchLast will select from the end. Most relevant for maelstrom gains where total is fixed
 * and often overlaps with other gains
 */
enum MatchMode {
  MatchFirst,
  MatchLast,
}

/**
 * Maelstrom gained from these sources are capped at the values provided
 */
const MAXIMUM_MAELSTROM_PER_EVENT = {
  [TALENTS.SUPERCHARGE_TALENT.id]: 2,
  [TALENTS.STATIC_ACCUMULATION_TALENT.id]: 10,
};

/**
 * The specification of an ability that either generates maelstrom weapon stacks or consumes them.
 */
interface MaelstromAbility {
  /** REQUIRED The ability id or ids of the events that can generate or spend maelstrom weapon stacks */
  spellId: number | number[];
  /** The spell id or {@link SpellOverride} array to use instead of the value in {@link spellId}.
   *  Example use cases are Tempest damage generating 3 maelstrom stacks from the talent Storm Swell */
  spellIdOverride?: number | SpellOverride[];
  /** REQUIRED The type or types of events that can generate or spend maelstrom weapon stacks {@link spellId} */
  linkFromEventType: EventType | EventType[];
  /** REQUIRED One of {@link GAIN_EVENT_TYPES} or {@link SPEND_EVENT_TYPES}, depending on the value of {@link type} */
  linkToEventType: EventType | EventType[];
  /** If defined, this predicate will be called with the selected combatant if the combatant has the required talents or abilties.
   * Defaults to true when omitted */
  enabled?: ((c: Combatant) => boolean) | undefined;
  /** If defined, this ability can spend or generate at most the given number of maelstrom weapon stacks.
   * Defaults to 1 when omitted */
  maximum?: ((combatant: Combatant) => number) | number | undefined;
  /** The maximum allowed timestamp difference *forward in time between the from and to events.
   * Defaults 0 ms when omitted. Some events may appear on the same timestamp but backwards in the list, so use
   * {@link BufferMs.Disabled} to disable forward searching entirely */
  forwardBufferMs?: number;
  /** The maximum allowed timestamp difference *backwards in time between the from and to events.
   * Defaults 0 ms when omitted. Some events may appear on the same timestamp but backwards in the list, so use
   * {@link BufferMs.Disabled} to disable backwards searching entirely */
  backwardsBufferMs?: number;
  /** The minimum allowed timestamp difference between the from and to events, both forward and backwards.
   * Some refund sources never occur before a minimum period, so this can be useful to prevent incorrect matches.
   * An example is the refunds from Static Accumulation and Supercharge. The former has a minimum 50ms delay, while the latter
   * occurs much faster.
   * Defaults to 0 ms when omitted*/
  minimumBuffer?: number;
  /** If defined, this ability requires an exact match, such as Supercharge requiring exactly 3 maelstrom weapon stack events in a row.
   * Defaults to false when omitted
   */
  requiresExact?: boolean;
  /** One of {@link MaelstromAbilityType.Spender} or {@link MaelstromAbilityType.Builder}.
   * Defaults to {@link MaelstromAbilityType.Spender} when omitted */
  type?: MaelstromAbilityType;
  /** REQUIRED The searching pattern to use. Many abilities have distinct patterns they follow, and this is used to define how to look for
   * related maelstrom weapon stack events. */
  searchDirection: SearchDirection;
  /** The matching mode to use. In cases where there are multiple possible matches, this value determines how the events should be selected
   * from a list of possible candidates. */
  matchMode?: MatchMode;
  /** If defined, a matching {@link linkFromEventType} will be reordered to to the first {@link linkToEventType} match,
   * and its timestamp will be updated accordingly.
   * Defaults to false when omitted */
  updateExistingEvent?: boolean;
}

interface SpellOverride {
  /** spell id or ids that will match an event's ability guid */
  spellId: number | number[];
  /** the spell id to use instead of the events ability guid */
  replaceWithSpellId: number;
}

/** The specification of an ability that generates maelstrom weapon stacks
 * at a set frequency but unrelated to other combatlog events.
 * Currently the only two sources are:
 * - Feral Spirit: Generates 1 maelstrom weapon stack every 3 seconds
 * - Ascendance with the Static Accumulation talent: Generates 1/2 stacks per second (depending on talent rank)
 */
interface PeriodicGainEffect {
  /** spell id of the initial ability that starts this periodic gain effect */
  spellId: number;
  /** interval in milliseconds between "ticks" */
  frequencyMs: number;
  /** spell id to use for `resourcechange` events */
  spellIdOverride: number;
}

/** Extends {@link PeriodicGainEffect} with details of an active occurance. */
interface ActivePeriodicGainEffect extends PeriodicGainEffect {
  /** The next time an instance of this periodic effect is expected to occur */
  nextExpectedGain: number;
  /** The timestamp when this effect ends */
  end: number;
}

/** The result of a call to lookAhead or lookBehind */
interface SearchResult {
  /** The index to be associated with a generated `resourchange` event, or the cost of a `cast` event.
   *  This has complex logic associated, depending on if its set by lookAhead or lookBehind.
   *  If the search is for a gain, will specify where the `resourchange` should be inserted
   *  in the returned events array.
   */
  index: number;
  /** The timestamp associated with the generated {@link ResourceChangeEvent} */
  timestamp: number;
  /** The maelstrom weapon stack events found by the search */
  events: AnyEvent[];
}

/**
 * This EventsNormalizer has two main objectives:
 * 1. Change all maeslstrom `applybuff`, `applybuffstack`, and `refreshbuff` events into a single `resourcechange`
 * event that captures all resource gains from an individual source, such as the two maelstrom stacks when
 * Ice Strike is cast when talented into Elemental Assault and Swirling Maelstrom, or the variable no. of stacks from
 * Static Accumulation (anywhere from 1-10).
 * 2. Find `removebuff` and `removebuffstack` events that relate to cast events for maestrom weapon eligible spells, and
 * set populate the `classResource` and `resourceCost` fields with the number of stacks consumed.
 *
 * The reason we do this is to simplify later analysis by enabling analyzers to look at cast events without needing
 * to also do calculations on Related events (from an EventLinkNormalizer).
 */
class MaelstromWeaponResourceNormalizer extends EventsNormalizer {
  private readonly maxResource: number;
  private readonly maxSpend: number;

  /** The four possible search functions mapped to the {@link SearchDirection} enum values */
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
    // maximum stack count of the maelstrom weapon buff
    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.RAGING_MAELSTROM_TALENT) ? 10 : 5;
    // maximum number of maelstrom weapon stacks that can be consumed at once
    this.maxSpend = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT) ? 10 : 5;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    /** Once a maelstrom weapon buff event has been associated with a resourchange (gain) or cast (spender),
     * add it to the set of events to skip for future checks. This prevents the same event being used twice
     * in calculations */
    const skip = new Set<AnyEvent>();

    /**
     * Feral Spirit and Ascendance generate maelstrom weapon stacks at fixed intervals, but do not have
     * other events at the relevant timestamps, so this function first finds all applybuff and removebuff
     * events, then fabricates a resourechange event at each expected interval.
     */
    events = this._generatePeriodicGainEvents(events, skip);

    typedKeys(MAELSTROM_ABILITIES).forEach((key) => {
      const ability: MaelstromAbility = MAELSTROM_ABILITIES[key];
      if (!(ability.enabled === undefined || ability.enabled(this.selectedCombatant))) {
        return;
      }

      // This guarantees later checks can assume maximum is a number
      ability.maximum =
        typeof ability.maximum === 'function'
          ? ability.maximum(this.selectedCombatant)
          : ability.maximum ?? 1;

      /**
       * loop through all events in order
       * NOTE: this uses a for loop intentionally. The array being iterated on will be modified,
       * and the forEach doesn't work well when items are inserted while iterating over the array. */
      for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        /**
         * check that
         * a) the event is an abiity event
         * b) the spell id and types match the expected values
         * c) the source of the event is the selected combatant
         */
        if (
          HasAbility(event) &&
          eventTypeAndSpellMatch(ability.spellId, ability.linkFromEventType, event) &&
          this._sourceCheck(event)
        ) {
          // use the specified search to find related maelstrom weapon buff events
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
          if (ability.type === undefined || ability.type === MaelstromAbilityType.Builder) {
            // get the spell id to use for the resourcechange event
            const spellId = getSpellId(ability, event)!;
            // build a resource change event unless the current event is already a resource change
            const resourcChangeEvent: ResourceChangeEvent =
              event.type === EventType.ResourceChange ? event : this._buildEnergizeEvent(spellId);
            // set the timestamp to the timestamp of the first maelstrom weapon gain
            resourcChangeEvent.timestamp = foundEvents[0].timestamp;
            // the resource changed by the number of maelstrom weapon buff events
            resourcChangeEvent.resourceChange = foundEvents.length;
            // link the new/existing resourcechange event to the maelstrom weapon buff events
            this._linkEnergizeEvent(resourcChangeEvent, ...foundEvents);

            const isExisting = resourcChangeEvent === event;
            if (isExisting && ability.updateExistingEvent) {
              /** If the current event is a resource change event, it was created by `_generatePeriodicGainEvents`.
               * When the event was inserted, it was put at the closest time to its interval, but now we want to update
               *  it to the actual time the maelstrom stacks where gained */
              const moveToIndex = searchResult.index - 1;
              if (moveToIndex > index) {
                const moved = events.splice(index + 1, moveToIndex - index);
                events.splice(index, 0, ...moved);
              } else if (moveToIndex < index) {
                const moved = events.splice(moveToIndex + 1, index - moveToIndex - 1);
                events.splice(moveToIndex + moved.length, 0, ...moved);
              }
            } else if (!isExisting) {
              // for new fabricated resourcechange events, insert them into the events list at the location returned by the search function
              AddRelatedEvent(resourcChangeEvent, MAELSTROM_WEAPON_SOURCE, event);
              events.splice(searchResult.index, 0, resourcChangeEvent);
            }

            // finally, mark all found events as handled so they don't get used again
            foundEvents.forEach((e) => {
              skip.add(e);
            });
          }

          if (ability.type === MaelstromAbilityType.Spender) {
            // not sure if this is actually needed, as the search function shouldn't return any results for non-cast events
            if (event.type !== EventType.Cast && event.type !== EventType.FreeCast) {
              continue;
            }

            /** again, probably unnecessary, but the events returned by the search function should
             *  contain a single `removebuff` or `removebuffstack` event. if no events are found, it shouldn't make it this far */
            const spend = foundEvents.find((e) => SPEND_EVENT_TYPES.includes(e.type)) as
              | RemoveBuffEvent
              | RemoveBuffStackEvent
              | undefined;
            if (spend === undefined) {
              continue;
            }

            // get a classResource object for this event
            const cr = this.getMaelstromClassResources(event);
            // This is the expected amount AFTER the event, a removebuff typically spends all and a removebuffstack event can spend up to 5 (but not all, otherwise it'd be a removebuff)
            cr.amount = spend.type === EventType.RemoveBuff ? 0 : spend.stack;
            // placeholder value to indicate it's a spend event
            cr.cost = SPEND_EVENT_PLACEHOLDER_COST;

            if (HasRelatedEvent(spend, MAELSTROM_WEAPON_LINK)) {
              console.error('Already has a related spend event', spend, foundEvents);
            }

            // add event link and reverse link from the cast (event) to the remove buff/stacks (spend)
            AddRelatedEvent(event, MAELSTROM_WEAPON_LINK, spend);
            AddRelatedEvent(spend, MAELSTROM_WEAPON_LINK_REVERSE, event);

            // finally, mark the spend event as handled so it doesn't get used again
            skip.add(spend);
          }
        }
      }
    });

    /** do one final pass of the events to calculate the gains, waste, and spent values.
     * return the events with all maelstrom weapon buff events removed */
    return this._doResourceCalculations(events);
  }

  /**
   * Find any periodic gains, such as feral spirit and the passive generation from Static Accumulation
   */
  private _generatePeriodicGainEvents(events: AnyEvent[], skip: Set<AnyEvent>): AnyEvent[] {
    const activePeriodicEffects: Record<number, ActivePeriodicGainEffect> = {};

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];

      if (HasAbility(event)) {
        const periodicEffect = PERIODIC_SPELLS.find(
          (effect) => effect.spellId === event.ability.guid,
        );
        if (periodicEffect) {
          if (event.type === EventType.ApplyBuff) {
            const activePeriodicEffect = startPeriodicGain(event.timestamp, periodicEffect);
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

  /**
   * Simulate a pre-pull normalizer to set the initial maelstrom value. Fabricates an event with the
   * initial value. Should almost always be 0 as stacks reset on pull.
   * @param events array of events
   * @returns Value of the first maelstrom weapon buff event
   */
  private _getInitialMaelstrom(events: AnyEvent[]) {
    const buildInitialMaelstromEvent = (value: number, event: AnyEvent) => {
      const initial = this._buildEnergizeEvent(SPELLS.MAELSTROM_WEAPON_BUFF);
      initial.timestamp = 0;
      initial.resourceChange = value;
      this._linkEnergizeEvent(initial, event);
      return initial;
    };

    // rather than using a prepull normalizer, look for the first maelstrom weapon buff event and set current
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (HasAbility(event) && event.ability.guid === SPELLS.MAELSTROM_WEAPON_BUFF.id) {
        if (!HasRelatedEvent(event, MAELSTROM_WEAPON_LINK_REVERSE)) {
          return 0;
        }
        switch (event.type) {
          case EventType.ApplyBuffStack:
          case EventType.RemoveBuffStack:
            events.splice(0, 0, buildInitialMaelstromEvent(event.stack, event));
            return event.stack;
          case EventType.RefreshBuff:
            events.splice(0, 0, buildInitialMaelstromEvent(this.maxResource, event));
            return this.maxResource;
          case EventType.RemoveBuff:
            events.splice(0, 0, buildInitialMaelstromEvent(0, event));
            return 0;
        }
      }
    }
    return 0;
  }

  /**
   * Do a pass over the events and calculate the amount of maelstrom spent on each event and maelstrom gained and wasted by each source
   * @param events pre-processed events with resourcechange events and cast events with resource costs, in place of maelstrom weapon buff events
   * @returns the events with maelstrom weapon buff removed
   */
  private _doResourceCalculations(events: AnyEvent[]) {
    // find the initial value, which should be zero in most cases
    let current: number = this._getInitialMaelstrom(events);
    events.forEach((event) => {
      // resourcechange events have been created for all gains, all thats needed here is to calculate the waste
      if (
        event.type === EventType.ResourceChange &&
        event.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id
      ) {
        // each fabricated resourcechange has been linked to the stacks gained
        const buffs = GetRelatedEvents<ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent>(
          event,
          MAELSTROM_WEAPON_LINK,
          (e) => GAIN_EVENT_TYPES.includes(e.type),
        );
        const fromEvent = GetRelatedEvent(event, MAELSTROM_WEAPON_SOURCE);

        // failsafe in case a resourcechange was somehow created with nothing related to it
        if (buffs.length === 0) {
          return;
        }

        current += event.resourceChange;
        event.waste = Math.max(current - this.maxResource, 0);
        current = Math.min(current, this.maxResource);

        // add (or update) a classResource event with the current resource value. no cost is associated with energize events/gain.
        const resource = this.getMaelstromClassResources(event);
        resource.amount = current;

        if (DEBUG) {
          const lastBuff = buffs.at(-1)!;
          /** Based on the event type of the last buff event found, we can add some validation for the current count.
           * this can be used to detect major faults in the logic, however as all of the calculations here are "best fit", we can't rely on this as the source of truth.
           * there are plenty of cases where multiple gains occur in quick succession and are linked "out of order", meaning current may look like 3 -> 5 -> 4 -> 6 (with the last value being accurate)
           * - applybuff: first stack gained so current = 1
           * - applybuffstack: current should be the stack count. sometimes due to the order events are detected this isn't true
           * - refreshbuff: when a gain would occur while at cap, indicates a waste and current = 5/10 depending on talent selection
           */
          const expectedCurrent =
            lastBuff.type === EventType.ApplyBuff
              ? 1
              : lastBuff.type === EventType.ApplyBuffStack
                ? lastBuff.stack
                : 10;
          const expectedWaste = buffs.filter((b) => b.type === EventType.RefreshBuff);
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
      } else if (event.type === EventType.Cast || event.type === EventType.FreeCast) {
        // get the classResource associated with the cast
        const cr = this.getMaelstromClassResources(event);
        // if the cost=0 it has just been created, as it was set to a placeholder value of -1
        if (cr.cost !== 0) {
          const buff = GetRelatedEvent<RemoveBuffEvent | RemoveBuffStackEvent>(
            event,
            MAELSTROM_WEAPON_LINK,
            (e) => SPEND_EVENT_TYPES.includes(e.type),
          );
          cr.cost = current - cr.amount;
          cr.amount = current;

          event.resourceCost ??= {};
          event.resourceCost[RESOURCE_TYPES.MAELSTROM_WEAPON.id] = cr.cost;

          // the expected cost is either all of the current stacks, or the current value minus the new stack count
          const expectedCost =
            buff!.type === EventType.RemoveBuff ? current : current - buff!.stack;
          // if the cost and expected costs don't align, force them to and optionally add debug info to the console
          if (cr.cost !== expectedCost) {
            DEBUG &&
              console.log(
                `${this.owner.formatTimestamp(event.timestamp, 3)}: expected maelstrom spent: ${expectedCost}, actual: ${cr.cost}`,
                event,
                buff,
              );
            cr.cost = expectedCost;
          }
          // subtract the cost from the current value
          current -= cr.cost;
        }
      }
    });

    // if not debugging remove all maelstrom weapon buff events
    if (!DEBUG) {
      return events.filter(
        (event) =>
          !HasAbility(event) ||
          event.ability.guid !== SPELLS.MAELSTROM_WEAPON_BUFF.id ||
          event.type === EventType.ResourceChange,
      );
    }
    return events;
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
    let current: SearchResult = { index: 0, timestamp: 0, events: [] };
    const matches: SearchResult[] = [current];

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
        current = { index: 0, timestamp: 0, events: [] };
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
        current.timestamp =
          backwardsEvent.timestamp > current.timestamp
            ? backwardsEvent.timestamp
            : current.timestamp; // whatever is closest to the timestamp of the current event
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
          return { index: m.index, timestamp: m.timestamp, events: truncatedEvents };
        }

        return undefined;
      });

      return results
        .filter((r) => r !== undefined)
        .sort((a, _) => event.timestamp - a!.timestamp)
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

    let current: SearchResult = { index: 0, timestamp: 0, events: [] };
    const matches: SearchResult[] = [current];

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
        current = { index: 0, timestamp: 0, events: [] };
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
        current.timestamp = current.timestamp === 0 ? forwardEvent.timestamp : current.timestamp;
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
          return { index: m.index, timestamp: m.timestamp, events: truncatedEvents };
        }

        return undefined;
      });

      return results
        .filter((r) => r !== undefined)
        .sort((a, _) => a!.timestamp - event.timestamp)
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
      timestamp: 0,
      type: EventType.ResourceChange,
      sourceID: this.selectedCombatant.id,
      targetID: this.selectedCombatant.id,
      ability: spellToAbility(spell)!,
      resourceChangeType: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      /** timestamp will be updated when this is associated with maelstrom stacks */
      resourceChange: 0,
      waste: 0,
      otherResourceChange: 0,
      resourceActor: ResourceActor.Source,
      sourceIsFriendly: true,
      targetIsFriendly: true,
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
    };

    return resourceChange;
  }

  private _linkEnergizeEvent(event: ResourceChangeEvent, ...linkToEvent: AnyEvent[]) {
    linkToEvent.forEach((linkedEvent) => {
      AddRelatedEvent(event, MAELSTROM_WEAPON_LINK, linkedEvent);
      AddRelatedEvent(linkedEvent, MAELSTROM_WEAPON_LINK_REVERSE, event);
    });
  }

  /**
   * For a given `cast` or `resourcechange` event, find or create a `ClassResource`
   * @param event the event needing a `classResource` value for Maelstrom Weapon
   * @returns a reference to the `ClassResource` object for the {@link event}
   */
  private getMaelstromClassResources<T extends string>(
    event: BaseCastEvent<T> | ResourceChangeEvent,
  ) {
    event.classResources ??= [];
    let resource = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    if (!resource) {
      resource = {
        amount: 0,
        max: this.maxResource,
        type: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      };
      event.classResources.push({
        ...resource,
        cost: 0,
      });
    }
    return getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id)!;
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
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.Damage,
    spellIdOverride: TALENTS.SUPERCHARGE_TALENT.id,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  STATIC_ACCUMULATION: {
    spellId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id, SPELLS.TEMPEST_CAST.id],
    type: MaelstromAbilityType.Builder,
    enabled: (c) => c.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT),
    maximum: -1,
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.StaticAccumulation,
    spellIdOverride: TALENTS.STATIC_ACCUMULATION_TALENT.id,
    minimumBuffer: 50,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  FERAL_SPIRIT_SUMMONED: {
    spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
    linkFromEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.BackwardsFirst,
    forwardBufferMs: 5,
    backwardsBufferMs: 5,
    maximum: 1,
    requiresExact: true,
  },
  VOLTAIC_BLAZE: {
    spellId: SPELLS.VOLTAIC_BLAZE_CAST.id, // TODO: Add voltaic blaze spell id
    linkFromEventType: EventType.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: 1,
    requiresExact: true,
  },
  // Swirling maelstrom has higher priority than Elemental Assault, as the later can be a chance if 1 of 2 talents invested
  SWIRLING_MAELSTROM: {
    spellId: [
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
      TALENTS.FROST_SHOCK_TALENT.id,
    ],
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
      SPELLS.STORMSTRIKE.id,
      SPELLS.WINDSTRIKE_CAST.id,
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
    ],
    linkFromEventType: EventType.Cast,
    enabled: (c) => c.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
    spellIdOverride: TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
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
    linkFromEventType: [EventType.ResourceChange],
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
    spellIdOverride: SPELLS.STORMSTRIKE.id,
    forwardBufferMs: BufferMs.Damage,
    linkFromEventType: EventType.Damage,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  MELEE_WEAPON_ATTACK: {
    // anything classified as a melee hit goes here
    spellId: [
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
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

/**
 * Specification of periodic gain effects.
 */
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

/**
 * Start a new instance of a periodic gain effect
 * @param start timestamp where the periodic gain started, i.e. buff was applied and *not* the first time the gain should occur
 * @param spec the specifications for this periodic gain effect
 * @returns {@link ActivePeriodicGainEffect}
 */
function startPeriodicGain(start: number, spec: PeriodicGainEffect): ActivePeriodicGainEffect {
  return {
    ...spec,
    nextExpectedGain: start + spec.frequencyMs,
    end: 0,
  };
}

/**
 * Converts the given spell value to an ability
 * @param spell a {@link Spell} object or number
 * @returns a new {@link Ability} or undefined if no spell or talent could be found
 */
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

/**
 * checks the event is an ability event with the same id as {@link spellId}
 */
function spellsMatch(ability: number | number[], spellId: number): boolean {
  if (Array.isArray(ability)) {
    return ability.some((s) => s === spellId);
  }
  return spellId === ability;
}

/**
 * checks the event type is one of the types specified by {@link eventType}
 */
function eventTypesMatch(eventType: EventType | EventType[], event: AnyEvent) {
  if (Array.isArray(eventType)) {
    return eventType.some((s) => s === event.type);
  }
  return eventType === event.type;
}

/**
 * Checks the event is an ability event with the same id as {@link spellId} and
 * the event type is one of the types specified by {@link eventType}.
 * Shorthand for {@link eventTypesMatch} and {@link spellsMatch}.
 */
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

/**
 * Gets the spell id to use for a `resourechange` event. The value returned is determined by
 * the configuration of {@link ability} and the ability id of {@link event}
 */
function getSpellId<T extends string>(
  ability: MaelstromAbility,
  event: AbilityEvent<T>,
): number | undefined {
  if (ability.spellIdOverride) {
    /**
     * if the ability spec has a spell override, use the specified value or calculate it
     * from the the SpellOverride spellId
     */
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
