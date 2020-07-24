import React from 'react';

import { captureException } from 'common/errorLogger';
import { SECOND_POTIONS } from 'parser/shared/modules/items/PrePotion';
import Fight from 'parser/core/Fight';
import { EventType, Event, PhaseEvent, CastEvent, ApplyBuffStackEvent, ApplyDebuffStackEvent, RemoveBuffStackEvent, RemoveDebuffStackEvent, ApplyBuffEvent, RemoveBuffEvent, ApplyDebuffEvent, RemoveDebuffEvent, FilterCooldownInfoEvent } from 'parser/core/Events';

import { EventsParseError } from './EventParser';
import { SELECTION_ALL_PHASES } from './PhaseParser';

const TIME_AVAILABLE = console.time && console.timeEnd;
const bench = (id: string) => TIME_AVAILABLE && console.time(id);
const benchEnd = (id: string) => TIME_AVAILABLE && console.timeEnd(id);

//returns whether e2 follows e and the events are associated
const eventFollows = (e: BuffEvent | StackEvent, e2: BuffEvent | StackEvent) =>
  e2.timestamp > e.timestamp
  && (e2.ability && e.ability ? e2.ability.guid === e.ability.guid : !e2.ability && !e.ability) //if both have an ability, its ID needs to match, otherwise neither can have an ability
  && e2.sourceID === e.sourceID
  && e2.targetID === e.targetID;

interface Props {
  fight: Fight,
  filter: Filter,
  phase: string,
  phaseinstance: number,
  bossPhaseEvents: PhaseEvent[],
  events: Event<any>[],
  children: (isLoading: boolean, events?: Event<any>[], fight?: any) => any,
}

interface State {
  isLoading: boolean,
  events?: Event<any>[],
  fight?: Fight,
}

interface Filter {
  start: number;
  end: number;
}

class TimeEventFilter extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.parse();
  }

  //compare filters if both are defined, otherwise to shallow reference copy to avoid rerendering when filter is clicked without changing the timestamps
  filterDiffers(filter1: Filter, filter2: Filter) {
    //if both filters are identical (shallow)
    if (filter1 === filter2) {
      return false;
    }
    //if both are defined, compare start and end
    if (filter1 && filter2) {
      return filter1.start !== filter2.start || filter1.end !== filter2.end;
    }
    //filters aren't equal
    return true;
  }

  componentDidUpdate(prevProps: Props) {
    const changed = this.props.bossPhaseEvents !== prevProps.bossPhaseEvents
      || this.props.fight !== prevProps.fight
      || this.filterDiffers(this.props.filter, prevProps.filter);

    if (changed) {
      this.setState({
        isLoading: true,
      });
      // noinspection JSIgnoredPromiseFromCall
      this.parse();
    }
  }

  makeEvents() {
    const { bossPhaseEvents, events, filter } = this.props;
    if (!filter) {
      return { start: this.props.fight.start_time, events: bossPhaseEvents ? [...bossPhaseEvents, ...events] : events, end: this.props.fight.end_time };
    }
    return { start: filter.start, events: filterEvents(events, filter.start, filter.end), end: filter.end };
  }

  async parse() {
    try {
      bench("time filter");
      const eventFilter = this.makeEvents();
      benchEnd("time filter");
      this.setState({
        events: eventFilter.events,
        fight: {
          ...this.props.fight,
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          offset_time: eventFilter.start - this.props.fight.start_time, //time between time filter start and fight start (for e.g. timeline)
          original_end_time: this.props.fight.end_time,
          filtered: (eventFilter.start !== this.props.fight.start_time || eventFilter.end !== this.props.fight.end_time),
          ...(this.props.phase !== SELECTION_ALL_PHASES && { phase: this.props.phase, instance: this.props.phaseinstance || 0 }), //if phase is selected, add it to the fight object
        },
        isLoading: false,
      });
    } catch (err) {
      captureException(err);
      throw new EventsParseError(err);
    }

  }

  render() {
    return this.props.children(this.state.isLoading, this.state.events, this.state.fight);
  }

}

function findRelevantPostFilterEvents(events: Event<any>[]) {
  return events.filter((e: Event<any>) => e.type === EventType.Cast && SECOND_POTIONS.includes((e as CastEvent).ability.guid)).map(e => ({ ...e, type: EventType.FilterCooldownInfo, trigger: e.type }));
}

//filter prephase events to just the events outside the time period that "matter" to make statistics more accurate (e.g. buffs and cooldowns)
type StackEvent = ApplyBuffStackEvent | ApplyDebuffStackEvent | RemoveBuffStackEvent | RemoveDebuffStackEvent;
type BuffEvent = ApplyBuffEvent | ApplyDebuffEvent | RemoveBuffEvent | RemoveDebuffEvent;
type CastRelevantEvent = CastEvent | FilterCooldownInfoEvent;
function findRelevantPreFilterEvents(events: Event<any>[]) {
  const buffEvents: BuffEvent[] = []; //(de)buff apply events for (de)buffs that stay active going into the time period
  const stackEvents: StackEvent[] = []; //stack events related to the above buff events that happen after the buff is applied
  const castEvents: CastRelevantEvent[] = []; //latest cast event of each cast by player for cooldown tracking

  const buffIsMarkedActive = (e: BuffEvent) => buffEvents.find(e2 => e.ability.guid === e2.ability.guid && e.targetID === e2.targetID && e.sourceID === e2.targetID) !== undefined;
  const buffIsRemoved = (e: BuffEvent, buffRelevantEvents: Event<any>[]) => buffRelevantEvents.find(e2 => e2.type === e.type.replace("apply", "remove") && eventFollows(e, e2 as BuffEvent)) !== undefined;
  const castHappenedLater = (e: CastEvent) => castEvents.find(e2 => e.ability.guid === e2.ability.guid && e.sourceID === e2.sourceID) !== undefined;

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
            stackEvents.push(...buffRelevantEvents.reverse().reduce((arr: StackEvent[], e2: Event<any>) => {
              //traverse through all following stack events in chronological order
              if (eventFollows(e as BuffEvent, e2 as StackEvent)) {
                //if stack is added, add the event to the end of the array
                if (e2.type === EventType.ApplyBuffStack || e2.type === EventType.ApplyDebuffStack) {
                  return [...arr, e2 as StackEvent];
                  //if stack is removed, remove first event from array
                } else if (e2.type === EventType.RemoveBuffStack || e2.type === EventType.RemoveDebuffStack) {
                  return arr.slice(0, 1);
                }
              }
              return arr;
            }, []));
          }
        }
        break;
      case EventType.RemoveBuff:
      case EventType.RemoveDebuff:
        if (SECOND_POTIONS.includes((e as BuffEvent).ability.guid)) {
          buffEvents.push(e as BuffEvent);
        }
        break;
      case EventType.Cast:
        //only keep "latest" cast, override type to prevent > 100% uptime / efficiency
        //whitelist certain casts (like potions) to keep suggestions working
        if (SECOND_POTIONS.includes((e as CastEvent).ability.guid) || !castHappenedLater(e as CastEvent)) {
          castEvents.push({ ...(e as CastEvent), type: EventType.FilterCooldownInfo, trigger: e.type });
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
export function filterEvents(events: Event<any>[], start: number, end: number) {
  const phaseEvents = events.filter(event =>
    event.timestamp >= start
    && event.timestamp <= end,
  );

  const preFilterEvents = findRelevantPreFilterEvents(events.filter(event => event.timestamp < start).reverse())
    .sort((a, b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      prepull: true, //pretend previous events were "prepull"
      ...(e.type !== EventType.FilterCooldownInfo && e.type !== EventType.Cast && SECOND_POTIONS.includes(e.ability.guid) && { type: EventType.FilterBuffInfo, trigger: e.type }),
      ...(e.type !== EventType.FilterCooldownInfo && !SECOND_POTIONS.includes(e.ability.guid) ? { timestamp: start } : { __fabricated: true }), //override existing timestamps to the start of the time period to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));
  const postFilterEvents = findRelevantPostFilterEvents(events.filter(event => event.timestamp > end))
    .sort((a, b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      timestamp: end,
    }));
  return [...preFilterEvents, ...phaseEvents, ...postFilterEvents];
}

export default TimeEventFilter;
