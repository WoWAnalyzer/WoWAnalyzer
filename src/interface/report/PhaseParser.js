import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { findByBossId } from 'raids';

export const SELECTION_ALL_PHASES = "ALL";
export const SELECTION_CUSTOM_PHASE = "CUSTOM";

class PhaseParser extends React.PureComponent {
  static propTypes = {
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    bossPhaseEvents: PropTypes.array,
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
    const phasesChanged = this.props.bossPhaseEvents !== prevProps.bossPhaseEvents;
    if (phasesChanged) {
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
      const startInstances = bossPhaseEvents.filter(e => e.type === PHASE_START_EVENT_TYPE && e.phase.key === key);
      const endInstances = bossPhaseEvents.filter(e => e.type === PHASE_END_EVENT_TYPE && e.phase.key === key);
      return {
        ...obj,
        [key]: {
          ...bossPhases[key],
          //sort start and end by timestamp in case of multiple instances, only keep instances that have both a start and end date
          start: startInstances.filter(e => endInstances.find(e2 => e2.instance === e.instance) !== undefined).sort((a,b) => a.timestamp - b.timestamp).map(e => e.timestamp),
          end: endInstances.filter(e => startInstances.find(e2 => e2.instance === e.instance) !== undefined).sort((a,b) => a.timestamp - b.timestamp).map(e => e.timestamp),
        },
      };
    }, {});
  }

  async parse() {
      const phases = this.makePhases();
      this.setState({
        phases: phases,
        isLoading: false,
      });
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.phases);
  }

}

export default PhaseParser;
