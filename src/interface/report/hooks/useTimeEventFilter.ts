import { captureException } from 'common/errorLogger';
import {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  CastEvent,
  EventType,
  FilterBuffInfoEvent,
  FilterCooldownInfoEvent,
  PhaseEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  RemoveDebuffEvent,
  RemoveDebuffStackEvent,
} from 'parser/core/Events';
import Fight, { WCLFight } from 'parser/core/Fight';
import { COMBAT_POTIONS } from 'parser/retail/modules/items/PotionChecker';
import { useEffect, useState } from 'react';

import { EventsParseError } from './useEventParser';

const bench = (id: string) => console.time(id);
const benchEnd = (id: string) => console.timeEnd(id);

function findRelevantPostFilterEvents(events: AnyEvent[]) {
  return events
    .filter(
      (e): e is CastEvent =>
        e.type === EventType.Cast && COMBAT_POTIONS.includes((e as CastEvent).ability.guid),
    )
    .map(
      (e): FilterCooldownInfoEvent => ({
        ...e,
        type: EventType.FilterCooldownInfo,
        trigger: e.type,
      }),
    );
}

/**
 * Simple helper to track buffs that have been seen in the event list.
 *
 * Note that we do not distinguish between buffs and debuffs. Each ability is only ever a buff or a debuff, so we don't need to care about both.
 */
class BuffSet {
  private buffs: Map<string, Set<number>> = new Map();

  private static eventKey(event: BuffEvent): string {
    return `${event.sourceID}-${event.sourceInstance ?? 0}-${event.targetID}-${event.targetInstance ?? 0}`;
  }

  private abilitySet(event: BuffEvent): Set<number> {
    const key = BuffSet.eventKey(event);
    if (!this.buffs.has(key)) {
      this.buffs.set(key, new Set());
    }

    return this.buffs.get(key)!;
  }

  public add(event: BuffEvent) {
    this.abilitySet(event).add(event.ability.guid);
  }

  public has(event: BuffEvent): boolean {
    return this.abilitySet(event).has(event.ability.guid);
  }
}

//filter prephase events to just the events outside the time period that "matter" to make statistics more accurate (e.g. buffs and cooldowns)
type StackEvent =
  | ApplyBuffStackEvent
  | ApplyDebuffStackEvent
  | RemoveBuffStackEvent
  | RemoveDebuffStackEvent;
type BuffEvent =
  | ApplyBuffEvent
  | ApplyDebuffEvent
  | RemoveBuffEvent
  | RemoveDebuffEvent
  | ApplyBuffStackEvent
  | RemoveBuffStackEvent
  | ApplyDebuffStackEvent
  | RemoveDebuffStackEvent;
type CastRelevantEvent = CastEvent | FilterCooldownInfoEvent;
function findRelevantPreFilterEvents(events: AnyEvent[]) {
  const buffEvents: BuffEvent[] = []; //(de)buff apply events for (de)buffs that stay active going into the time period
  const stackEvents: StackEvent[] = []; //stack events related to the above buff events that happen after the buff is applied
  const castEvents: CastRelevantEvent[] = []; //latest cast event of each cast by player for cooldown tracking

  const seenAuras = new BuffSet();
  const seenCasts = new Set();

  // events are processed in reverse order
  for (const event of events) {
    switch (event.type) {
      case EventType.RemoveBuff:
      case EventType.RemoveDebuff:
        if (COMBAT_POTIONS.includes(event.ability.guid)) {
          buffEvents.push(event);
        }
        seenAuras.add(event);
        break;
      case EventType.ApplyBuff:
      case EventType.ApplyDebuff:
        // note: intentionally omitting refreshes. they often immediately follow a stack change and add no info that is relevant for pre-pull events.
        if (seenAuras.has(event)) {
          continue;
        }
        seenAuras.add(event);
        buffEvents.push(event);
        break;
      case EventType.ApplyBuffStack:
      case EventType.RemoveBuffStack:
      case EventType.ApplyDebuffStack:
      case EventType.RemoveDebuffStack:
        if (seenAuras.has(event)) {
          continue;
        }
        // note: stack events don't add to seenAuras
        stackEvents.push(event);
        break;
      case EventType.Cast:
        if (!COMBAT_POTIONS.includes(event.ability.guid) && seenCasts.has(event.ability.guid)) {
          continue;
        }
        seenCasts.add(event.ability.guid);
        castEvents.push({
          ...event,
          type: EventType.FilterCooldownInfo,
          trigger: event.type,
        });
        break;
    }
  }

  return [...castEvents, ...buffEvents, ...stackEvents];
}

/**
 * Filters a list of events by a given timestamp while including relevant events happening before / after the filter.
 * Relevant events include relevant cooldowns, buffs, and casts in order to maintain integrity of e.g. cooldown information from outside of the filter
 * without tainting the accuracy of events within the filter by simply including "all" events.
 *
 * Pre-filter casts get assigned a new event type in order to not count as casts in the cast efficiency module while still being able to be tracked in the cooldowns module.
 * Pre-filter (de)buffs / (de)buff stacks (that persist into the filtered timestamp) get assigned to the starting timestamp of the filter
 */
function filterEvents(events: AnyEvent[], start: number, end: number) {
  function createFilterBuffInfoEvent(e: BuffEvent | StackEvent): FilterBuffInfoEvent {
    return {
      ...e,
      type: EventType.FilterBuffInfo,
      trigger: e.type,
    };
  }

  const phaseEvents = events.filter((event) => event.timestamp >= start && event.timestamp <= end);

  const preFilterEvents = findRelevantPreFilterEvents(
    events.filter((event) => event.timestamp < start).reverse(),
  )
    .sort((a, b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map((e) => ({
      prepull: true, //pretend previous events were "prepull"
      ...(e.type !== EventType.FilterCooldownInfo &&
      e.type !== EventType.Cast &&
      COMBAT_POTIONS.includes(e.ability.guid)
        ? createFilterBuffInfoEvent(e)
        : e),
      ...(e.type !== EventType.FilterCooldownInfo && !COMBAT_POTIONS.includes(e.ability.guid)
        ? { timestamp: start }
        : { __fabricated: true }), //override existing timestamps to the start of the time period to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));

  const postFilterEvents = findRelevantPostFilterEvents(
    events.filter((event) => event.timestamp > end),
  )
    .sort((a, b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map((e): typeof e => ({
      ...e,
      timestamp: end,
    }));

  return [...preFilterEvents, ...phaseEvents, ...postFilterEvents];
}

export interface Filter {
  start: number;
  end: number;
}

interface Config {
  bossPhaseEventsLoaded: boolean;
  fight: WCLFight;
  filter: Filter;
  phase: number;
  bossPhaseEvents: PhaseEvent[] | null;
  events: AnyEvent[] | null;
}

const useTimeEventFilter = ({
  bossPhaseEventsLoaded = false,
  fight,
  filter,
  bossPhaseEvents,
  events,
}: Config) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stateEvents, setStateEvents] = useState<AnyEvent[] | undefined>(undefined);
  const [stateFight, setStateFight] = useState<Fight | undefined>(undefined);

  useEffect(() => {
    if (!bossPhaseEventsLoaded || events == null) {
      return;
    }

    const makeEvents = (): {
      start: number;
      events: AnyEvent[];
      end: number;
    } => {
      if (!filter) {
        return {
          start: fight.start_time,
          events: bossPhaseEvents ? [...bossPhaseEvents, ...events] : events,
          end: fight.end_time,
        };
      }

      return {
        start: filter.start,
        events: filterEvents(events, filter.start, filter.end),
        end: filter.end,
      };
    };

    const parse = async () => {
      try {
        bench('time filter');
        const eventFilter = makeEvents();
        benchEnd('time filter');
        setStateEvents(eventFilter.events);
        setStateFight({
          ...fight,
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          offset_time: eventFilter.start - fight.start_time, //time between time filter start and fight start (for e.g. timeline)
          original_end_time: fight.end_time,
          filtered: eventFilter.start !== fight.start_time || eventFilter.end !== fight.end_time,
        });
        setIsLoading(false);
      } catch (err) {
        captureException(err as Error);
        throw new EventsParseError(err as Error);
      }
    };

    // flip back to loading when these values change. eslint is unhappy about this.

    setIsLoading(true);
    parse();
  }, [bossPhaseEventsLoaded, bossPhaseEvents, fight, filter, events]);

  return {
    isLoading,
    events: stateEvents,
    fight: stateFight,
  };
};

export default useTimeEventFilter;
