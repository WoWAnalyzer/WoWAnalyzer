import React from 'react';
import PropTypes from 'prop-types';

import { captureException } from 'common/errorLogger';

import { EventsParseError } from './EventParser';
import { SELECTION_ALL_PHASES } from './PhaseParser';

export const PRE_FILTER_COOLDOWN_EVENT_TYPE = "filter_cooldown_info";

const TIME_AVAILABLE = console.time && console.timeEnd;
const bench = id => TIME_AVAILABLE && console.time(id);
const benchEnd = id => TIME_AVAILABLE && console.timeEnd(id);

//returns whether e2 follows e and the events are associated
const eventFollows = (e, e2) =>
  e2.timestamp > e.timestamp
  && e2.ability.guid === e.ability.guid
  && e2.sourceID === e.sourceID
  && e2.targetID === e.targetID;

class TimeEventFilter extends React.PureComponent {
  static propTypes = {
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    filter: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }),
    phase: PropTypes.string,
    bossPhaseEvents: PropTypes.array,
    events: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
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
  filterDiffers(filter1, filter2){
    //if both filters are identical (shallow)
    if(filter1 === filter2){
      return false;
    }
    //if both are defined, compare start and end
    if(filter1 && filter2){
      return filter1.start !== filter2.start || filter1.end !== filter2.end;
    }
    //filters aren't equal
    return true;
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
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
    if(!filter){
      return {start: this.props.fight.start_time, events: bossPhaseEvents ? [...bossPhaseEvents, ...events] : events, end: this.props.fight.end_time};
    }
    const phaseEvents = events.filter(event =>
        event.timestamp >= filter.start
        && event.timestamp <= filter.end
      );

    const prePhaseEvents = this.findRelevantPreFilterEvents(events.filter(event => event.timestamp < filter.start).reverse())
    .sort((a,b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      prepull: true, //pretend previous events were "prepull"
      ...(e.type !== PRE_FILTER_COOLDOWN_EVENT_TYPE ? {timestamp: filter.start} : {__fabricated: true}), //override existing timestamps to the start of the time period to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));
    return {start: filter.start, events: [...prePhaseEvents, ...phaseEvents], end: filter.end};
  }

  //filter prephase events to just the events outside the time period that "matter" to make statistics more accurate (e.g. buffs and cooldowns)
  findRelevantPreFilterEvents(events){
    bench("time filter");
    const buffEvents = []; //(de)buff apply events for (de)buffs that stay active going into the time period
    const stackEvents = []; //stack events related to the above buff events that happen after the buff is applied
    const castEvents = []; //latest cast event of each cast by player for cooldown tracking

    const buffIsMarkedActive = (e) => buffEvents.find(e2 => e.ability.guid === e2.ability.guid && e.targetID === e2.targetID && e.sourceID === e2.targetID) !== undefined;
    const buffIsRemoved = (e, buffRelevantEvents) => buffRelevantEvents.find(e2 => e2.type === e.type.replace("apply", "remove") && eventFollows(e, e2)) !== undefined;
    const castHappenedLater = (e) => castEvents.find(e2 => e.ability.guid === e2.ability.guid && e.sourceID === e2.sourceID) !== undefined;

    events.forEach((e, index) => {
      switch(e.type){
        case "applybuff":
        case "applydebuff":
          //if buff isn't already confirmed as "staying active"
          if(!buffIsMarkedActive(e)){
            //look only at buffs that happen after the apply event (since we traverse in reverse order)
            const buffRelevantEvents = events.slice(0, index);
            //if no remove is found following the apply event, mark the buff as "staying active"
            if(!buffIsRemoved(e, buffRelevantEvents)){
              buffEvents.push(e);
              //find relevant stack information for active buff / debuff
              stackEvents.push(...buffRelevantEvents.reverse().reduce((arr, e2) => {
                //traverse through all following stack events in chronological order
                if(eventFollows(e,e2)){
                  //if stack is added, add the event to the end of the array
                  if(e2.type === "applybuffstack" || e2.type === "applydebuffstack"){
                    return [...arr, e2];
                  //if stack is removed, remove first event from array
                  }else if(e2.type === "removebuffstack" || e2.type === "removedebuffstack"){
                    return arr.slice(0,1);
                  }
                }
                return arr;
              }, []));
            }
          }
          break;
        case "cast":
          //only keep "latest" cast, override type to prevent > 100% uptime / efficiency
          if(!castHappenedLater(e)){
            castEvents.push({...e, type: PRE_FILTER_COOLDOWN_EVENT_TYPE});
          }
          break;
        default:
          break;
      }
    });
    benchEnd("time filter");
    return [...castEvents, ...buffEvents, ...stackEvents];
  }

  async parse() {
    try {
      const eventFilter = this.makeEvents();
      this.setState({
        events: eventFilter.events,
        fight: {
          ...this.props.fight,
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          offset_time: eventFilter.start - this.props.fight.start_time, //time between time filter start and fight start (for e.g. timeline)
          original_end_time: this.props.fight.end_time,
          filtered: (eventFilter.start !== this.props.fight.start_time || eventFilter.end !== this.props.fight.end_time),
          ...(this.props.phase !== SELECTION_ALL_PHASES && {phase: this.props.phase}), //if phase is selected, add it to the fight object
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

export default TimeEventFilter;
