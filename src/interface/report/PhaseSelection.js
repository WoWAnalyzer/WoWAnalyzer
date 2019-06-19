import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';
import { findByBossId } from 'raids';

import EventParser, { EventsParseError } from './EventParser';

export const SELECTION_ALL_PHASES = -1;

class PhaseSelection extends React.PureComponent {
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
      || this.props.events !== prevProps.events;
    if (changed) {
      this.setState({
        isLoading: true,
      });
      // noinspection JSIgnoredPromiseFromCall
      this.parse();
    }
  }

  makeEvents() {
    const { bossPhaseEvents, events } = this.props;
    const PHASE_SELECTED = 0;
    if(!(bossPhaseEvents instanceof Array) || bossPhaseEvents.length % 2 !== 0 || bossPhaseEvents.length < 2*(PHASE_SELECTED+1) || PHASE_SELECTED === SELECTION_ALL_PHASES){
      return bossPhaseEvents ? [...bossPhaseEvents, ...events] : events;
    }

    const phaseStart = bossPhaseEvents[PHASE_SELECTED];
    const phaseEnd = bossPhaseEvents[PHASE_SELECTED+1];
    const phaseEvents = events.filter(event =>
        event.timestamp >= phaseStart.timestamp
        && event.timestamp <= phaseEnd.timestamp
      );
    this.setState({
      fight: {
        start_time: phaseStart.timestamp,
        end_time: phaseEnd.timestamp,
        boss: this.props.fight.boss,
      },
    });
    return [phaseStart, ...phaseEvents, phaseEnd];
  }

  async parse() {
    try {
      const events = this.makeEvents();
      this.setState({
        events: events,
        isLoading: false,
      });
    } catch (err) {
      captureException(err);
      throw new EventsParseError(err);
    }

  }

  render() {
    const {report, player, combatants, parserClass, characterProfile, children} = this.props;
    return !this.state.isLoading && (
      <EventParser
        report={report}
        fight={this.state.fight}
        player={player}
        combatants={combatants}
        parserClass={parserClass}
        characterProfile={characterProfile}
        events={this.state.events}
      >
        {children}
      </EventParser>
  );
  }
}

export default PhaseSelection;
