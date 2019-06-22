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
    const prePhaseEvents = this.findRelevantPrePhaseEvents(events.filter(event => event.timestamp < startEvent.timestamp).reverse()) //pass reversed list so "more relevant" events get searched first to improve performance
    .sort((a,b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      prepull: true, //pretend previous phases were "prepull"
      ...(e.type !== PREPHASE_CAST_EVENT_TYPE && {timestamp: startEvent.timestamp}), //override existing timestamps to the start of the phase to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));
    const prePhaseEvents2 = this.findRelevantPrePhaseEvents2(events.filter(event => event.timestamp < startEvent.timestamp).reverse()).sort((a,b) => a.timestamp - b.timestamp) //sort events by timestamp
    .map(e => ({
      ...e,
      prepull: true, //pretend previous phases were "prepull"
      ...(e.type !== PREPHASE_CAST_EVENT_TYPE && {timestamp: startEvent.timestamp}), //override existing timestamps to the start of the phase to avoid >100% uptimes (only on non casts to retain cooldowns)
    }));
    return {start: startEvent.timestamp, events: [...prePhaseEvents2, startEvent, ...phaseEvents, endEvent], end: endEvent.timestamp};
  }

  //find events before the phase that are relevant in this phase (aka cooldowns and buffs) and include them in analysis
  //this could probably be done a lot faster by wrapping it all into one forEach and handling each event type differently within there to save filter Casts.
  //This is much cleaner this way though and still pretty fast so not sure if it's needed?
  //(see second option below for other version)
  findRelevantPrePhaseEvents(events){
    console.log(...new Set(events.map(e => e.type)));
    console.log(events.filter( e => ["create", "summon", "energize"].includes(e.type)));
    bench("total phase filter");
    bench("phase buff filter");
    const applyBuffEvents = this.findRelevantBuffEvents(events);
    benchEnd("phase buff filter");
    bench("phase stack filter");
    const buffStackEvents = this.findRelevantStackEvents(events, applyBuffEvents);
    benchEnd("phase stack filter");
    bench("phase cast filter");
    const castEvents = this.findRelevantCastEvents(events);
    benchEnd("phase cast filter");
    const relevantEvents = [...applyBuffEvents, ...buffStackEvents, ...castEvents];
    benchEnd("total phase filter");
    return relevantEvents;
  }

  //second option, faster but not as "clean"
  findRelevantPrePhaseEvents2(events){
    bench("second phase filter");
    const foundBuffs = [];
    const stackEvents = [];
    const foundCasts = [];
    events.forEach((e, index) => {
      switch(e.type){
        case "applybuff":
        case "applydebuff":
          if(foundBuffs.find(e2 => e.ability.guid === e2.ability.guid && e.targetID === e2.targetID && e.sourceID === e2.targetID) === undefined){
            const buffRelevantEvents = events.slice(0, index);
            if(buffRelevantEvents.find(e2 => e2.type === e.type.replace("apply", "remove") && eventFollows(e, e2)) === undefined){
              foundBuffs.push(e);
              stackEvents.push(...buffRelevantEvents.reverse().reduce((arr, e2) => {
                if(eventFollows(e,e2)){
                  if(e2.type === "applybuffstack"){
                    return [...arr, e2];
                  }else if(e2.type === "removebuffstack"){
                    return arr.slice(0,1);
                  }
                }
                return arr;
              }, []));
            }
          }
          break;
        case "cast":
          if(foundCasts.find(e2 => e.ability.guid === e2.ability.guid && e.sourceID === e2.sourceID) === undefined){
            foundCasts.push({...e, type: PREPHASE_CAST_EVENT_TYPE});
          }
          break;
        default:
          break;
      }
    });
    /*const stackEvents = foundBuffs.reduce((arr, e) => {
      const stackEvents = stackEventsT.filter(e2 => eventFollows(e, e2));
      //Is this part even necessary? Might be faster just passing every applybuffstack and removebuffstack event back to the eventparser and letting the normalizers / modules handle stack counts
      const applyEvents = stackEvents.filter(e => e.type === "applybuffstack");
      const removeEvents = stackEvents.filter(e => e.type === "removebuffstack");
      const stackCount = applyEvents.length - removeEvents.length;
      return [...arr, ...applyEvents.slice(0, stackCount)];
      //return [...arr, ...stackEvents];
    }, []);*/
    benchEnd("second phase filter");
    return [...foundBuffs, ...stackEvents, ...foundCasts];
  }

  findRelevantBuffEvents(events){
    const foundBuffs = []; //keep track of buffs that are already known to be kept going into a phase
    return events.filter(e => {
      if(!["applybuff", "applydebuff"].includes(e.type)){
        return false;
      }
    //only keep prior apply(de)buff events if they dont have an associated remove(de)buff event
      //if buff is already known to be kept, we don't need to search for a remove event
      if(foundBuffs.find(e2 => e.ability.guid === e2.ability.guid && e.targetID === e2.targetID && e.sourceID === e2.targetID) !== undefined){
        return false;
      }
      //if buff wasn't removed, add it to found buffs and keep event
      if(events.find(e2 => e2.type === e.type.replace("apply", "remove") && eventFollows(e, e2)) === undefined){
        foundBuffs.push(e);
        return true;
      }
      return false;
    });
  }

  findRelevantStackEvents(events, buffEvents){
    const stackEventsT = events.filter(e => ["applybuffstack", "removebuffstack", "applydebuffstack", "removedebuffstack"].includes(e.type));
    return buffEvents.reduce((arr, e) => {
      const stackEvents = stackEventsT.filter(e2 => eventFollows(e, e2));
      //Is this part even necessary? Might be faster just passing every applybuffstack and removebuffstack event back to the eventparser and letting the normalizers / modules handle stack counts
      const applyEvents = stackEvents.filter(e => e.type.includes("apply"));
      const removeEvents = stackEvents.filter(e => e.type.includes("remove"));
      const stackCount = applyEvents.length - removeEvents.length;
      return [...arr, ...applyEvents.slice(0, stackCount)];
      //return [...arr, ...stackEvents];
    }, []);
  }

  findRelevantCastEvents(events){
    const foundCasts = []; //keep track of found Casts
    events.forEach(e => {
      if(e.type === "cast"){
        if(foundCasts.find(e2 => e.ability.guid === e2.ability.guid && e.sourceID === e2.sourceID) === undefined){
          foundCasts.push({
            ...e,
            type: PREPHASE_CAST_EVENT_TYPE,
          });
        }
      }
    });
    return foundCasts;
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
