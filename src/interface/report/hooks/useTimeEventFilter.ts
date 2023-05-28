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
import { SELECTION_ALL_PHASES } from './usePhases';

const bench = (id: string) => console.time(id);
const benchEnd = (id: string) => console.timeEnd(id);

//returns whether e2 follows e and the events are associated
const eventFollows = (e: BuffEvent | StackEvent, e2: BuffEvent | StackEvent) =>
  e2.timestamp > e.timestamp &&
  (e2.ability && e.ability ? e2.ability.guid === e.ability.guid : !e2.ability && !e.ability) && //if both have an ability, its ID needs to match, otherwise neither can have an ability
  e2.sourceID === e.sourceID &&
  e2.targetID === e.targetID;

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

//filter prephase events to just the events outside the time period that "matter" to make statistics more accurate (e.g. buffs and cooldowns)
type StackEvent =
  | ApplyBuffStackEvent
  | ApplyDebuffStackEvent
  | RemoveBuffStackEvent
  | RemoveDebuffStackEvent;
type BuffEvent = ApplyBuffEvent | ApplyDebuffEvent | RemoveBuffEvent | RemoveDebuffEvent;
type CastRelevantEvent = CastEvent | FilterCooldownInfoEvent;
function findRelevantPreFilterEvents(events: AnyEvent[]) {
  const buffEvents: BuffEvent[] = []; //(de)buff apply events for (de)buffs that stay active going into the time period
  const stackEvents: StackEvent[] = []; //stack events related to the above buff events that happen after the buff is applied
  const castEvents: CastRelevantEvent[] = []; //latest cast event of each cast by player for cooldown tracking

  const buffIsMarkedActive = (e: BuffEvent) =>
    buffEvents.find(
      (e2) =>
        e.ability.guid === e2.ability.guid &&
        e.targetID === e2.targetID &&
        e.sourceID === e2.targetID,
    ) !== undefined;
  const buffIsRemoved = (e: BuffEvent, buffRelevantEvents: AnyEvent[]) =>
    buffRelevantEvents.find(
      (e2) => e2.type === e.type.replace('apply', 'remove') && eventFollows(e, e2 as BuffEvent),
    ) !== undefined;
  const castHappenedLater = (e: CastEvent) =>
    castEvents.find((e2) => e.ability.guid === e2.ability.guid && e.sourceID === e2.sourceID) !==
    undefined;

  events.forEach((e, index) => {
    switch (e.type) {
      case EventType.ApplyBuff:
      case EventType.ApplyDebuff:
        //if buff isn't already confirmed as "staying active"
        if (!buffIsMarkedActive(e as BuffEvent)) {
          //look only at buffs that happen after the apply event (since we traverse in reverse order)
          const buffRelevantEvents = events.slice(0, index);
          //if no remove is found following the apply event, mark the buff as "staying active"
          if (!buffIsRemoved(e as BuffEvent, buffRelevantEvents)) {
            buffEvents.push(e as BuffEvent);
            //find relevant stack information for active buff / debuff
            stackEvents.push(
              ...buffRelevantEvents.reverse().reduce((arr: StackEvent[], e2: AnyEvent) => {
                //traverse through all following stack events in chronological order
                if (eventFollows(e as BuffEvent, e2 as StackEvent)) {
                  //if stack is added, add the event to the end of the array
                  if (
                    e2.type === EventType.ApplyBuffStack ||
                    e2.type === EventType.ApplyDebuffStack
                  ) {
                    return [...arr, e2 as StackEvent];
                    //if stack is removed, remove first event from array
                  } else if (
                    e2.type === EventType.RemoveBuffStack ||
                    e2.type === EventType.RemoveDebuffStack
                  ) {
                    return arr.slice(0, 1);
                  }
                }
                return arr;
              }, []),
            );
          }
        }
        break;
      case EventType.RemoveBuff:
      case EventType.RemoveDebuff:
        if (COMBAT_POTIONS.includes((e as BuffEvent).ability.guid)) {
          buffEvents.push(e as BuffEvent);
        }
        break;
      case EventType.Cast:
        //only keep "latest" cast, override type to prevent > 100% uptime / efficiency
        //whitelist certain casts (like potions) to keep suggestions working
        if (
          COMBAT_POTIONS.includes((e as CastEvent).ability.guid) ||
          !castHappenedLater(e as CastEvent)
        ) {
          castEvents.push({
            ...(e as CastEvent),
            type: EventType.FilterCooldownInfo,
            trigger: e.type,
          });
        }
        break;
      default:
        break;
    }
  });

  return [...castEvents, ...buffEvents, ...stackEvents];
}

/**
 * Filters a list of events by a given timestamp while including relevant events happening before / after the filter.
 * Relevant events include relevant cooldowns, buffs, and casts in order to maintain integrity of e.g. cooldown information from outside of the filter
 * without tainting the accuracy of events within the filter by simply including "all" events.
 *
 * Pre-filter casts get assigned a new event type in order to not count as casts in the cast efficiency module while still being able to be tracked in the cooldowns module.
 * Pre-filter (de)buffs / (de)buff stacks (that persist into the filtered timestamp) get assigned to the starting timestamp of the filter
 *
 * @param {Array} events
 *  Array of events to filter
 * @param {number} start
 *  start timestamp to filter events by
 * @param {number} end
 *  end timestamp to filter events by
 *
 * @return {Array}
 *  List of filtered events
 */
export function filterEvents(events: AnyEvent[], start: number, end: number) {
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
  phase: string;
  phaseinstance: number;
  bossPhaseEvents: PhaseEvent[] | null;
  events: AnyEvent[] | null;
}

const useTimeEventFilter = ({
  bossPhaseEventsLoaded = false,
  fight,
  filter,
  phase,
  phaseinstance,
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
          ...(phase !== SELECTION_ALL_PHASES && {
            phase: phase,
            phaseinstance: phaseinstance || 0,
          }), //if phase is selected, add it to the fight object
        });
        setIsLoading(false);
      } catch (err) {
        captureException(err as Error);
        throw new EventsParseError(err as Error);
      }
    };

    setIsLoading(true);
    parse();
  }, [bossPhaseEventsLoaded, bossPhaseEvents, fight, filter, events, phase, phaseinstance]);

  return {
    isLoading,
    events: stateEvents,
    fight: stateFight,
  };
};

export default useTimeEventFilter;
