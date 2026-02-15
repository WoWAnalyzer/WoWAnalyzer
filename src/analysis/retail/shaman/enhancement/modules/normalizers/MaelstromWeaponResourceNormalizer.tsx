import {
  AddRelatedEvent,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasAbility,
  HasRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import {
  MAELSTROM_WEAPON_LINK,
  MAELSTROM_WEAPON_LINK_REVERSE,
  MAELSTROM_WEAPON_SOURCE,
  NormalizerOrder,
} from './constants';
import {
  MAELSTROM_ABILITIES,
  SPEND_EVENT_TYPES,
  GAIN_EVENT_TYPES,
  PERIODIC_SPELLS,
  MAELSTROM_SPENDER_SPELLIDS,
} from './resourceNormalizer/constants';
import { SearchDirection, MaelstromAbilityType } from './resourceNormalizer/enums';
import {
  lookAhead,
  lookBehind,
  sourceCheck,
  buildEnergizeEvent,
  linkEnergizeEvent,
  eventTypeAndSpellMatch,
  getMaelstromClassResources,
  startPeriodicGain,
  getSpellId as getMaelstromAbilitySpellId,
} from './resourceNormalizer/functions';
import {
  MaelstromAbility,
  SearchResult,
  ActivePeriodicGainEffect,
  SearchFunctions,
} from './resourceNormalizer/types';

const DEBUG = false;

const SPEND_EVENT_PLACEHOLDER_COST = -1;

/**
 * This EventsNormalizer has two main objectives:
 * 1. Change all maeslstrom `applybuff`, `applybuffstack`, and `refreshbuff` events into a single `resourcechange`
 * event that captures all resource gains from an individual source, such as the one maelstrom stack from Elemental Assault
 * and Lightning Strikes, the variable no. of stacks from Thunder Capacitor (anywhere from 1-10), and the periodic gains from
 * Static Accumulation on regular intervals that don't typically log events.
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
  private readonly searchFunctions: SearchFunctions = {
    [SearchDirection.ForwardsOnly]: (...args) => lookAhead(...args),
    [SearchDirection.BackwardsOnly]: (...args) => lookBehind(...args),
    [SearchDirection.ForwardsFirst]: (...args) => lookAhead(...args) ?? lookBehind(...args),
    [SearchDirection.BackwardsFirst]: (...args) => lookBehind(...args) ?? lookAhead(...args),
  };

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
     * Static Accumulation generates maelstrom weapon stacks at fixed intervals, but does not have
     * other events at the relevant timestamps, so this function first finds all applybuff and removebuff
     * events, then fabricates a resourechange event at each expected interval.
     */
    events = this._generatePeriodicGainEvents(events, skip);

    // Ensure Static Accumulation (periodic, fabricated tick events) is processed before any
    // other builder abilities so its stack gains are claimed first.
    const abilityKeys = Object.keys(MAELSTROM_ABILITIES);
    const orderedAbilityKeys = [
      'SPENDERS',
      'STATIC_ACCUMULATION',
      ...abilityKeys.filter((k) => k !== 'SPENDERS' && k !== 'STATIC_ACCUMULATION'),
    ];

    orderedAbilityKeys.forEach((key) => {
      const ability: MaelstromAbility =
        MAELSTROM_ABILITIES[key as keyof typeof MAELSTROM_ABILITIES];
      if (!(ability.enabled === undefined || ability.enabled(this.selectedCombatant))) {
        return;
      }

      // This guarantees later checks can assume maximum is a number
      ability.maximum =
        typeof ability.maximum === 'function'
          ? ability.maximum(this.selectedCombatant)
          : (ability.maximum ?? 1);

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
          sourceCheck(event, this.selectedCombatant.id)
        ) {
          // use the specified search to find related maelstrom weapon buff events
          // For multi-direction searches, only log requiresExact failures on the final attempt.
          let searchResult: SearchResult | undefined;
          if (ability.updateExistingEvent && ability.requiresExact) {
            switch (ability.searchDirection) {
              case SearchDirection.ForwardsOnly: {
                searchResult = lookAhead(ability, index, events, skip, this.maxSpend);
                break;
              }
              case SearchDirection.BackwardsOnly: {
                searchResult = lookBehind(ability, index, events, skip, this.maxSpend);
                break;
              }
              case SearchDirection.ForwardsFirst: {
                const forward = lookAhead(ability, index, events, skip, this.maxSpend);
                if (forward) {
                  searchResult = forward;
                  break;
                }
                searchResult = lookBehind(ability, index, events, skip, this.maxSpend);
                break;
              }
              case SearchDirection.BackwardsFirst: {
                const backward = lookBehind(ability, index, events, skip, this.maxSpend);
                if (backward) {
                  searchResult = backward;
                  break;
                }
                searchResult = lookAhead(ability, index, events, skip, this.maxSpend);
                break;
              }
            }
          } else {
            searchResult = this.searchFunctions[ability.searchDirection](
              ability,
              index,
              events,
              skip,
              this.maxSpend,
            );
          }

          if (!searchResult) {
            continue;
          }

          const foundEvents = searchResult.events;
          if (ability.type === undefined || ability.type === MaelstromAbilityType.Builder) {
            // get the spell id to use for the resourcechange event
            const spellId = getMaelstromAbilitySpellId(ability, event)!;
            // build a resource change event unless the current event is already a resource change
            const resourcChangeEvent: ResourceChangeEvent =
              event.type === EventType.ResourceChange
                ? event
                : buildEnergizeEvent(spellId, this.selectedCombatant.id);
            // set the timestamp to the timestamp of the first maelstrom weapon gain
            resourcChangeEvent.timestamp = foundEvents[0].timestamp;
            // the resource changed by the number of maelstrom weapon buff events
            resourcChangeEvent.resourceChange = foundEvents.length;
            // link the new/existing resourcechange event to the maelstrom weapon buff events
            linkEnergizeEvent(resourcChangeEvent, ...foundEvents);

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
            const cr = getMaelstromClassResources(event, this.maxResource);
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
                const periodicResourceChange = buildEnergizeEvent(
                  activePeriodicEffect.spellIdOverride ?? activePeriodicEffect.spellId,
                  this.selectedCombatant.id,
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
      const initial = buildEnergizeEvent(SPELLS.MAELSTROM_WEAPON_BUFF, this.selectedCombatant.id);
      initial.timestamp = 0;
      initial.resourceChange = value;
      linkEnergizeEvent(initial, event);
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
          case EventType.ApplyBuff:
            return 0;
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
    events.forEach((event, index) => {
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

        // failsafe in case a resourcechange was somehow created with nothing related to it
        if (buffs.length === 0) {
          return;
        }

        current += event.resourceChange;
        event.waste = Math.max(current - this.maxResource, 0);
        current = Math.min(current, this.maxResource);

        // add (or update) a classResource event with the current resource value. no cost is associated with energize events/gain.
        const resource = getMaelstromClassResources(event, this.maxResource);
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
                : this.maxResource;
          const expectedWaste = buffs.filter((b) => b.type === EventType.RefreshBuff);
          if (current !== expectedCurrent || event.waste !== expectedWaste.length) {
            const fromEvent = GetRelatedEvent(event, MAELSTROM_WEAPON_SOURCE);
            console.log(
              `${event.timestamp} (${this.owner.formatTimestamp(event.timestamp, 3)}): expected maelstrom: ${expectedCurrent}/${expectedWaste.length}, calculated: ${current}/${event.waste}`,
              fromEvent,
              event,
              lastBuff,
              ...expectedWaste,
            );
          }
        }
      } else if (
        (event.type === EventType.Cast || event.type === EventType.FreeCast) &&
        MAELSTROM_SPENDER_SPELLIDS.includes(event.ability.guid)
      ) {
        // get the classResource associated with the cast
        const cr = getMaelstromClassResources(event, this.maxResource);
        // if the cost=0 it has just been created, as it was set to a placeholder value of -1
        if (cr.cost !== 0) {
          const buff = GetRelatedEvent<RemoveBuffEvent | RemoveBuffStackEvent>(
            event,
            MAELSTROM_WEAPON_LINK,
            (e) => SPEND_EVENT_TYPES.includes(e.type),
          );

          let cost = current - cr.amount;

          cr.cost = cost;
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
}

export default MaelstromWeaponResourceNormalizer;
