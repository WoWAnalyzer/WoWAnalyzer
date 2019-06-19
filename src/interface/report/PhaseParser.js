import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';
import { findByBossId } from 'raids';

import { EventsParseError } from './EventParser';

export const SELECTION_ALL_PHASES = "ALL";

class PhaseParser extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      guid: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    phase: PropTypes.string.isRequired,
    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
    })),
    parserClass: PropTypes.func.isRequired,
    characterProfile: PropTypes.object,
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
    const changed = this.props.report !== prevProps.report
      || this.props.fight !== prevProps.fight
      || this.props.player !== prevProps.player
      || this.props.combatants !== prevProps.combatants
      || this.props.parserClass !== prevProps.parserClass
      || this.props.characterProfile !== prevProps.characterProfile
      || this.props.bossPhaseEvents !== prevProps.bossPhaseEvents
      || this.props.phase !== prevProps.phase
      || this.props.events !== prevProps.events;
    if (changed) {
      this.setState({
        isLoading: true,
      });
      // noinspection JSIgnoredPromiseFromCall
      this.parse();
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
    const startEvent = bossPhaseEvents.find(e => e.type === PHASE_START_EVENT_TYPE && e.phase.key === phase);
    const endEvent = bossPhaseEvents.find(e => e.type === PHASE_END_EVENT_TYPE && e.phase.key === phase);
    if(!(bossPhaseEvents instanceof Array)
      || !(Object.keys(phases).includes(phase))
      || phase === SELECTION_ALL_PHASES
    ){
      return {start: this.props.fight.start_time, events: bossPhaseEvents ? [...bossPhaseEvents, ...events] : events, end: this.props.fight.end_time};
    }
    const phaseEvents = events.filter(event =>
        event.timestamp >= startEvent.timestamp
        && event.timestamp <= endEvent.timestamp
      );
      //TODO: find events before the phase that are relevant in this phase (aka cooldowns and buffs) and include them in analysis
    return {start: startEvent.timestamp, events: [startEvent, ...phaseEvents, endEvent], end: endEvent.timestamp};
  }

  async parse() {
    try {
      const phases = this.makePhases();
      const eventFilter = this.makeEvents(phases);
      this.setState({
        phases: phases,
        events: eventFilter.events,
        fight: {
          start_time: eventFilter.start,
          end_time: eventFilter.end,
          boss: this.props.fight.boss,
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
