import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';
import { findByBossId } from 'raids';

import { EventsParseError } from './EventParser';

export const SELECTION_ALL_PHASES = "ALL";
export const PREPHASE_CAST_EVENT_TYPE = "phase_cast";

const TIME_AVAILABLE = console.time && console.timeEnd;
const bench = id => TIME_AVAILABLE && console.time(id);
const benchEnd = id => TIME_AVAILABLE && console.timeEnd(id);

//returns whether e2 follows e and the events are associated
const eventFollows = (e, e2) =>
  e2.timestamp > e.timestamp
  && e2.ability.guid === e.ability.guid
  && e2.sourceID === e.sourceID
  && e2.targetID === e.targetID;

class PhaseParser extends React.PureComponent {
  static propTypes = {
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    phase: PropTypes.string.isRequired,
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
  componentDidUpdate(prevProps, prevState, prevContext) {
    const phasesChanged = this.props.bossPhaseEvents !== prevProps.bossPhaseEvents || this.props.fight !== prevProps.fight;
    const eventsChanged = this.props.phase !== prevProps.phase || this.props.events !== prevProps.events;
    if (phasesChanged || eventsChanged) {
      this.setState({
        isLoading: true,
      });
      // noinspection JSIgnoredPromiseFromCall
      this.parse(phasesChanged);
    }
  }

  makePhases(){
    const { bossPhaseEvents, fight } = this.props;
    if(!bossPhaseEvents){
      return null;
    }
    const phaseStarts = [...new Set(bossPhaseEvents.filter(e => e.type === PHASE_START_EVENT_TYPE).map(e => e.phase.key))]; //distinct phase starts
    const phaseEnds = [...new Set(bossPhaseEvents.filter(e => e.type === PHASE_END_EVENT_TYPE).map(e => e.phase.key))]; //distinct phase ends
    const phaseKeys = phaseStarts.filter(e => phaseEnds.includes(e)); //only include phases that contain start and end event
    const bossPhases = findByBossId(fight.boss).fight.phases;
    return Object.keys(bossPhases)
    .filter(e => phaseKeys.includes(e)) //only include boss phases that have a valid phase key
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: bossPhases[key],
      };
    }, {});
  }

  makeEvents(phases) {
    const { bossPhaseEvents, events, phase } = this.props;
    if(!(bossPhaseEvents instanceof Array)
      || !(Object.keys(phases).includes(phase))
      || phase === SELECTION_ALL_PHASES
    ){
      return {start: this.props.fight.start_time, events: bossPhaseEvents ? [...bossPhaseEvents, ...events] : events, end: this.props.fight.end_time};
    }
    const startEvent = bossPhaseEvents.find(e => e.type === PHASE_START_EVENT_TYPE && e.phase.key === phase);
    const endEvent = bossPhaseEvents.find(e => e.type === PHASE_END_EVENT_TYPE && e.phase.key === phase);
    const phaseEvents = events.filter(event =>
        event.timestamp >= startEvent.timestamp
        && event.timestamp <= endEvent.timestamp
      );

    const prePhaseEvents = this.findRelevantPrePhaseEvents(events.filter(event => event.timestamp < startEvent.timestamp).reverse())
    .sort((a,b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      prepull: true, //pretend previous phases were "prepull"
      ...(e.type !== PREPHASE_CAST_EVENT_TYPE ? {timestamp: startEvent.timestamp} : {__fabricated: true}), //override existing timestamps to the start of the phase to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));
    return {start: startEvent.timestamp, events: [...prePhaseEvents, startEvent, ...phaseEvents, endEvent], end: endEvent.timestamp};
  }

  //filter prephase events to just the events outside the phase that "matter" to make statistics more accurate (e.g. buffs and cooldowns)
  findRelevantPrePhaseEvents(events){
    bench("phase filter");
    const buffEvents = []; //(de)buff apply events for (de)buffs that stay active going into the phase
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
            castEvents.push({...e, type: PREPHASE_CAST_EVENT_TYPE});
          }
          break;
        default:
          break;
      }
    });
    benchEnd("phase filter");
    return [...castEvents, ...buffEvents, ...stackEvents];
  }

  async parse(phasesChanged = true) {
    try {
      const phases = phasesChanged ? this.makePhases() : this.state.phases; //only update phases if they actually changed
      const eventFilter = this.makeEvents(phases);
      this.setState({
        phases: phases,
        events: eventFilter.events,
        fight: {
          ...this.props.fight,
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          offset_time: eventFilter.start - this.props.fight.start_time, //time between phase start and fight start (for e.g. timeline)
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
    return this.props.children(this.state.isLoading, this.state.phases, this.state.events, this.state.fight);
  }

}

export default PhaseParser;
