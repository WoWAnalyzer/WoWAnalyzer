import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';
import { findByBossId } from 'raids';

import { EventsParseError } from './EventParser';

export const SELECTION_ALL_PHASES = "ALL";

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
    const prePhaseEvents = this.findRelevantPrePhaseEvents(events.filter(event => event.timestamp < startEvent.timestamp));
    return {start: startEvent.timestamp, events: [...prePhaseEvents, startEvent, ...phaseEvents, endEvent], end: endEvent.timestamp};
  }

  //TODO: find events before the phase that are relevant in this phase (aka cooldowns and buffs) and include them in analysis
  findRelevantPrePhaseEvents(events){
    const applyBuffEvents = this.findRelevantBuffEvents(events);

    return applyBuffEvents;
  }

  findRelevantBuffEvents(events){
    return events.filter(e => e.type === "applybuff" || e.type === "applydebuff")
    .filter(e =>
      //only keep prior apply(de)buff events if they dont have an associated remove(de)buff event
      events.find(e2 =>
        e2.type === e.type.replace("apply", "remove")
        && e.ability.guid === e2.ability.guid
        && e2.sourceID === e.sourceID
        && e2.targetID === e.targetID
        && e2.timestamp > e.timestamp
      ) === undefined
    ).map(e => ({
      ...e,
      prepull: true,
    }));
  }

  async parse(phasesChanged = true) {
    try {
      const phases = phasesChanged ? this.makePhases() : this.state.phases; //only update phases if they actually changed
      const eventFilter = this.makeEvents(phases);
      this.setState({
        phases: phases,
        events: eventFilter.events,
        fight: {
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          offset_time: eventFilter.start - this.props.fight.start_time, //time between phase start and fight start (for e.g. timeline)
          boss: this.props.fight.boss,
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
