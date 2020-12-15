import React from 'react';
import PropTypes from 'prop-types';

import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import NavigationBar from 'interface/layout/NavigationBar';
import ErrorBoundary from 'interface/common/ErrorBoundary';

import ReportLoader from './ReportLoader';
import FightSelection from './FightSelection';
import PlayerLoader from './PlayerLoader';
import ConfigLoader from './ConfigLoader';
import PatchChecker from './PatchChecker';
import SupportChecker from './SupportChecker';
import ParserLoader from './ParserLoader';
import EventsLoader from './EventsLoader';
import BossPhaseEventsLoader from './BossPhaseEventsLoader';
import CharacterProfileLoader from './CharacterProfileLoader';
import PhaseParser , { SELECTION_ALL_PHASES } from './PhaseParser';
import TimeEventFilter from './TimeEventFilter';
import EventParser from './EventParser';
import Results from './Results';
import EVENT_PARSING_STATE from './EVENT_PARSING_STATE';
import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';

class ResultsLoader extends React.PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    report: PropTypes.object.isRequired,
    fight: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    combatants: PropTypes.array,
  };

  constructor() {
    super();
    this.state = {
      isLoadingParser: true,
      parserClass: null,
      isLoadingEvents: true,
      events: null,
      bossPhaseEventsLoadingState: BOSS_PHASES_STATE.LOADING,
      bossPhaseEvents: null,
      isLoadingCharacterProfile: true,
      characterProfile: null,
      phases: null,
      selectedPhase: SELECTION_ALL_PHASES,
      selectedInstance: 0,
      filteredEvents: null,
      filteredFight: null,
      timeFilter: null,
      isLoadingPhases: true,
      isFilteringEvents: true,
      parsingState: EVENT_PARSING_STATE.WAITING,
      parsingEventsProgress: null,
      parser: null,
    };
    this.handleParserLoader = this.handleParserLoader.bind(this);
    this.handleEventsLoader = this.handleEventsLoader.bind(this);
    this.handleBossPhaseEventsLoader = this.handleBossPhaseEventsLoader.bind(this);
    this.handleCharacterProfileLoader = this.handleCharacterProfileLoader.bind(this);
    this.handleEventsParser = this.handleEventsParser.bind(this);
    this.handlePhaseSelection = this.handlePhaseSelection.bind(this);
    this.handlePhaseParser = this.handlePhaseParser.bind(this);
    this.handleTimeFilter = this.handleTimeFilter.bind(this);
    this.applyTimeFilter = this.applyTimeFilter.bind(this);
    this.handleBuildSelection = this.handleBuildSelection.bind(this);
  }

  handleParserLoader(isLoading, parserClass) {
    this.setState({
      isLoadingParser: isLoading,
      parserClass,
    });
    return null;
  }
  handleEventsLoader(isLoading, events) {
    this.setState({
      isLoadingEvents: isLoading,
      events,
    });
    return null;
  }
  handleBossPhaseEventsLoader(loadingState, bossPhaseEvents) {
    this.setState({
      bossPhaseEventsLoadingState: loadingState,
      bossPhaseEvents,
    });
    return null;
  }
  handleCharacterProfileLoader(isLoading, characterProfile) {
    this.setState({
      isLoadingCharacterProfile: isLoading,
      characterProfile,
    });
    return null;
  }
  handleEventsParser(isParsingEvents, parsingEventsProgress, parser) {
    this.setState({
      parsingState: isParsingEvents ? EVENT_PARSING_STATE.PARSING : EVENT_PARSING_STATE.DONE,
      parsingEventsProgress,
      parser,
    });
    return null;
  }
  handlePhaseParser(isLoadingPhases, phases){
    this.setState({
      isLoadingPhases,
      phases,
    });
    return null;
  }
  handleTimeFilter(isFilteringEvents, filteredEvents, filteredFight){
    this.setState({
      isFilteringEvents,
      filteredEvents,
      filteredFight,
    });
    return null;
  }
  handlePhaseSelection(phase, instance) {
    this.setState({
      selectedPhase: phase,
      selectedInstance: instance,
      //set time filter to null if no phase selected
      timeFilter: (phase === SELECTION_ALL_PHASES ? null : {start: this.state.phases[phase].start[instance], end: this.state.phases[phase].end[instance]}),
    });
    return null;
  }
  applyTimeFilter(start, end) {
    this.setState({
      //set time filter to null if 0 and end of fight are selected as boundaries
      timeFilter: (start === 0 && end === this.props.fight.end_time - this.props.fight.start_time ? null :{start: start + this.props.fight.start_time, end: end + this.props.fight.start_time}),
      selectedPhase: SELECTION_ALL_PHASES,
      selectedInstance: 0,
    });
    return null;
  }
  handleBuildSelection(build){
    this.setState({
      build,
    });
  }

  get progress() {
    return (
      (!this.state.isLoadingParser ? 0.05 : 0)
      + (!this.state.isLoadingEvents ? 0.05 : 0)
      + (this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING ? 0.05 : 0)
      + (!this.state.isLoadingCharacterProfile ? 0.05 : 0)
      + (!this.state.isFilteringEvents ? 0.05 : 0)
      + (this.state.parsingEventsProgress * 0.75)
    );
  }

  render() {
    const { config, report, fight, player, combatants } = this.props;
    const build = this.state.parser && this.state.parser.build;
    return (
      <>
        {/* Load these different api calls asynchronously */}
        <ParserLoader
          config={config}
        >
          {this.handleParserLoader}
        </ParserLoader>
        <EventsLoader
          report={report}
          fight={fight}
          player={player}
        >
          {this.handleEventsLoader}
        </EventsLoader>
        <BossPhaseEventsLoader
          report={report}
          fight={fight}
          player={player}
        >
          {this.handleBossPhaseEventsLoader}
        </BossPhaseEventsLoader>
        <CharacterProfileLoader
          report={report}
          player={player}
        >
          {this.handleCharacterProfileLoader}
        </CharacterProfileLoader>

        {!this.state.isLoadingEvents && this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING && (
          <PhaseParser
            fight={fight}
            bossPhaseEvents={this.state.bossPhaseEvents}
          >
            {this.handlePhaseParser}
          </PhaseParser>
        )}
        {!this.state.isLoadingEvents && this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING && (
          <TimeEventFilter
            fight={fight}
            events={this.state.events}
            bossPhaseEvents={this.state.bossPhaseEvents}
            filter={this.state.timeFilter}
            phase={this.state.selectedPhase}
            phaseinstance={this.state.selectedInstance}
          >
            {this.handleTimeFilter}
          </TimeEventFilter>
        )}
        {!this.state.isLoadingParser && !this.state.isLoadingCharacterProfile && !this.state.isFilteringEvents && (
          <EventParser
            report={report}
            fight={this.state.filteredFight}
            player={player}
            combatants={combatants}
            applyTimeFilter={this.applyTimeFilter}
            applyPhaseFilter={this.handlePhaseSelection}
            parserClass={this.state.parserClass}
            characterProfile={this.state.characterProfile}
            events={this.state.filteredEvents}
            builds={config.builds}
          >
            {this.handleEventsParser}
          </EventParser>
        )}


        <Results
          isLoadingParser={this.state.isLoadingParser}
          isLoadingEvents={this.state.isLoadingEvents}
          bossPhaseEventsLoadingState={this.state.bossPhaseEventsLoadingState}
          isLoadingCharacterProfile={this.state.isLoadingCharacterProfile}
          parsingState={this.state.parsingState}
          progress={this.progress}
          report={report}
          // eslint-disable-next-line @typescript-eslint/camelcase
          fight={this.state.filteredFight || {offset_time: 0, filtered: false, ...fight}} //if no filtered fight has been parsed yet, pass previous fight object alongside 0 offset time and no filtering
          player={player}
          characterProfile={this.state.characterProfile}
          parser={this.state.parser}
          isLoadingPhases={this.state.isLoadingPhases}
          isFilteringEvents={this.state.isFilteringEvents}
          phases={this.state.phases}
          selectedPhase={this.state.selectedPhase}
          selectedInstance={this.state.selectedInstance}
          handlePhaseSelection={this.handlePhaseSelection}
          applyFilter={this.applyTimeFilter}
          timeFilter={this.state.timeFilter}
          build={build}
          makeTabUrl={tab => makeAnalyzerUrl(report, fight.id, player.id, tab, build)}
          makeBuildUrl={(tab, build) => makeAnalyzerUrl(report, fight.id, player.id, tab, build)}
        />
      </>
    );
  }
}

// TODO: Turn all the loaders and shit into hooks
const Report = () => (
  // TODO: Error boundary so all sub components don't need the errorHandler with the silly withRouter dependency. Instead just throw the error and let the boundary catch it - if possible.
  <>
    <NavigationBar />

    <ErrorBoundary>
      <ReportLoader>
        {(report) => (
          <PatchChecker
            report={report}
          >
            <FightSelection
              report={report}
            >
              {fight => (
                <PlayerLoader
                  report={report}
                  fight={fight}
                >
                  {(player, combatant, combatants) => (
                    <ConfigLoader
                      specId={combatant.specID}
                    >
                      {config => (
                        <SupportChecker
                          config={config}
                          report={report}
                          fight={fight}
                          player={player}
                        >
                          <ResultsLoader
                            config={config}
                            report={report}
                            fight={fight}
                            player={player}
                            combatants={combatants}
                          />
                        </SupportChecker>
                      )}
                    </ConfigLoader>
                  )}
                </PlayerLoader>
              )}
            </FightSelection>
          </PatchChecker>
        )}
      </ReportLoader>
    </ErrorBoundary>
  </>
);

export default Report;
