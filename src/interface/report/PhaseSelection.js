import React from 'react';
import PropTypes from 'prop-types';

import { PHASE_START_EVENT_TYPE, PHASE_END_EVENT_TYPE } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';

import EventParser, { EventsParseError } from './EventParser';


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
    let phaseEvents = [...events];
    if(bossPhaseEvents instanceof Array){
      console.log(bossPhaseEvents);
    }
    let combinedEvents = bossPhaseEvents ? [...bossPhaseEvents, ...events] : events;
    // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
    combinedEvents = combinedEvents.filter(event => event.type !== 'combatantinfo');
    return combinedEvents;
  }

  async parse(){
    try{
      const events = this.makeEvents();
      const phaseStart = events.find(event => event.type === PHASE_START_EVENT_TYPE);
      const phaseEnd = events.find(event => event.type === PHASE_END_EVENT_TYPE);
      if(phaseStart !== undefined && phaseEnd !== undefined){
        const phaseEvents = events.filter(event => event.timestamp >= phaseStart.timestamp && event.timestamp <= phaseEnd.timestamp && event.type !== PHASE_START_EVENT_TYPE && event.type !== PHASE_END_EVENT_TYPE);
        this.setState({
          events: phaseEvents,
          isLoading: false,
        });
      }else{
        this.setState({
          events: events,
          isLoading: false,
        });
      }
    } catch (err) {
      captureException(err);
      throw new EventsParseError(err);
    }

  }

  render() {
    const {report, fight, player, combatants, parserClass, characterProfile, children} = this.props;
    return !this.state.isLoading && (
      <EventParser
        report={report}
        fight={fight}
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
