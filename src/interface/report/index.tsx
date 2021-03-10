import React from 'react';

import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import NavigationBar from 'interface/NavigationBar';
import ErrorBoundary from 'interface/ErrorBoundary';
import { PlayerInfo } from 'parser/core/Player';
import Fight, { WCLFight } from 'parser/core/Fight';
import Config from 'parser/Config';
import ReportObject from 'parser/core/Report';
import { Phase } from 'game/raids';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, CombatantInfoEvent, PhaseEvent } from 'parser/core/Events';
import CharacterProfile from 'parser/core/CharacterProfile';

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
import TimeEventFilter, { Filter } from './TimeEventFilter';
import EventParser from './EventParser';
import Results from './Results';
import EVENT_PARSING_STATE from './EVENT_PARSING_STATE';
import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';

interface Props {
  config: Config;
  report: ReportObject;
  fight: WCLFight;
  player: PlayerInfo;
  combatants: CombatantInfoEvent[]
}

interface State {
  isLoadingParser: boolean;
  parserClass?: typeof CombatLogParser|null;
  isLoadingEvents: boolean;
  events: AnyEvent[]|null;
  bossPhaseEventsLoadingState: BOSS_PHASES_STATE;
  bossPhaseEvents: PhaseEvent[]|null;
  isLoadingCharacterProfile: boolean;
  characterProfile: CharacterProfile|null;
  phases: { [key: string]: Phase }|null;
  selectedPhase: string;
  selectedInstance: number;
  filteredEvents?: AnyEvent[]|null;
  filteredFight?: Fight|null;
  timeFilter: Filter|null;
  isLoadingPhases: boolean;
  isFilteringEvents: boolean;
  parsingState: EVENT_PARSING_STATE;
  parsingEventsProgress: number|null;
  parser: CombatLogParser|null;
}

class ResultsLoader extends React.PureComponent<Props, State> {
  state: State = {
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

  constructor(props: Props) {
    super(props);
    this.handleParserLoader = this.handleParserLoader.bind(this);
    this.handleEventsLoader = this.handleEventsLoader.bind(this);
    this.handleBossPhaseEventsLoader = this.handleBossPhaseEventsLoader.bind(this);
    this.handleCharacterProfileLoader = this.handleCharacterProfileLoader.bind(this);
    this.handleEventsParser = this.handleEventsParser.bind(this);
    this.handlePhaseSelection = this.handlePhaseSelection.bind(this);
    this.handlePhaseParser = this.handlePhaseParser.bind(this);
    this.handleTimeFilter = this.handleTimeFilter.bind(this);
    this.applyTimeFilter = this.applyTimeFilter.bind(this);
  }

  handleParserLoader(isLoading: boolean, parserClass?: typeof CombatLogParser) {
    this.setState({
      isLoadingParser: isLoading,
      parserClass,
    });
    return null;
  }
  handleEventsLoader(isLoading: boolean, events: AnyEvent[]|null) {
    this.setState({
      isLoadingEvents: isLoading,
      events,
    });
    return null;
  }
  handleBossPhaseEventsLoader(loadingState: BOSS_PHASES_STATE, bossPhaseEvents: PhaseEvent[]|null) {
    this.setState({
      bossPhaseEventsLoadingState: loadingState,
      bossPhaseEvents,
    });
    return null;
  }
  handleCharacterProfileLoader(isLoading: boolean, characterProfile: CharacterProfile|null) {
    this.setState({
      isLoadingCharacterProfile: isLoading,
      characterProfile,
    });
    return null;
  }
  handleEventsParser(isParsingEvents: boolean, parsingEventsProgress: number, parser: CombatLogParser|null) {
    this.setState({
      parsingState: isParsingEvents ? EVENT_PARSING_STATE.PARSING : EVENT_PARSING_STATE.DONE,
      parsingEventsProgress,
      parser,
    });
    return null;
  }
  handlePhaseParser(isLoadingPhases: boolean, phases: { [key: string]: Phase }|null){
    this.setState({
      isLoadingPhases,
      phases,
    });
    return null;
  }
  handleTimeFilter(isFilteringEvents: boolean, filteredEvents?: AnyEvent[], filteredFight?: Fight){
    this.setState({
      isFilteringEvents,
      filteredEvents,
      filteredFight,
    });
    return null;
  }
  handlePhaseSelection(phase: string, instance: any) {
    const { phases }: any = this.state;
    this.setState({
      selectedPhase: phase,
      selectedInstance: instance,
      //set time filter to null if no phase selected
      timeFilter: (phase === SELECTION_ALL_PHASES ? null : {start: phases[phase].start[instance], end: phases[phase].end[instance]}),
    });
    return null;
  }
  applyTimeFilter(start: number, end: number) {
    this.setState({
      //set time filter to null if 0 and end of fight are selected as boundaries
      timeFilter: (start === 0 && end === this.props.fight.end_time - this.props.fight.start_time ? null :{start: start + this.props.fight.start_time, end: end + this.props.fight.start_time}),
      selectedPhase: SELECTION_ALL_PHASES,
      selectedInstance: 0,
    });
    return null;
  }

  get progress() {
    return (
      (!this.state.isLoadingParser ? 0.05 : 0)
      + (!this.state.isLoadingEvents ? 0.05 : 0)
      + (this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING ? 0.05 : 0)
      + (!this.state.isLoadingCharacterProfile ? 0.05 : 0)
      + (!this.state.isFilteringEvents ? 0.05 : 0)
      + (this.state.parsingEventsProgress! * 0.75)
    );
  }

  render() {
    const { config, report, fight, player, combatants } = this.props;
    const build = (this.state.parser && this.state.parser.build) || undefined;
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
            bossPhaseEvents={this.state.bossPhaseEvents!}
          >
            {this.handlePhaseParser}
          </PhaseParser>
        )}
        {!this.state.isLoadingEvents && this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING && (
          <TimeEventFilter
            fight={fight}
            events={this.state.events!}
            bossPhaseEvents={this.state.bossPhaseEvents!}
            filter={this.state.timeFilter!}
            phase={this.state.selectedPhase}
            phaseinstance={this.state.selectedInstance}
          >
            {this.handleTimeFilter}
          </TimeEventFilter>
        )}
        {!this.state.isLoadingParser && !this.state.isLoadingCharacterProfile && !this.state.isFilteringEvents && (
          <EventParser
            report={report}
            fight={this.state.filteredFight!}
            player={player}
            combatants={combatants!}
            applyTimeFilter={this.applyTimeFilter}
            applyPhaseFilter={this.handlePhaseSelection}
            parserClass={this.state.parserClass!}
            characterProfile={this.state.characterProfile!}
            events={this.state.filteredEvents!}
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
          characterProfile={this.state.characterProfile!}
          parser={this.state.parser!}
          isLoadingPhases={this.state.isLoadingPhases}
          isFilteringEvents={this.state.isFilteringEvents}
          phases={this.state.phases}
          selectedPhase={this.state.selectedPhase}
          selectedInstance={this.state.selectedInstance}
          handlePhaseSelection={this.handlePhaseSelection}
          applyFilter={this.applyTimeFilter}
          timeFilter={this.state.timeFilter!}
          build={build}
          makeTabUrl={(tab: string) => makeAnalyzerUrl(report, fight.id, player.id, tab, build!)}
          makeBuildUrl={(tab: string, build: string) => makeAnalyzerUrl(report, fight.id, player.id, tab, build)}
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
        {(report, refreshReport) => (
          <PatchChecker
            report={report}
          >
            <FightSelection
              report={report}
              refreshReport={refreshReport}
            >
              {(fight) => (
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
