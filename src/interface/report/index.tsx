import ErrorBoundary from 'interface/ErrorBoundary';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import NavigationBar from 'interface/NavigationBar';
import { useCallback, useState } from 'react';

import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';
import { ReportPlayerConfigProvider, useConfig } from './ConfigContext';
import EVENT_PARSING_STATE from './EVENT_PARSING_STATE';
import { ReportExpansionContextProvider } from './ExpansionContext';
import FightSelection from './FightSelection';
import useBossPhaseEvents from './hooks/useBossPhaseEvents';
import useCharacterProfile from './hooks/useCharacterProfile';
import useEventParser from './hooks/useEventParser';
import useEvents from './hooks/useEvents';
import useParser from './hooks/useParser';
import usePhases, { SELECTION_ALL_PHASES } from './hooks/usePhases';
import useTimeEventFilter, { Filter } from './hooks/useTimeEventFilter';
import PatchChecker from './PatchChecker';
import PlayerLoader from './PlayerLoader';
import ReportLoader from './ReportLoader';
import Results from './Results';
import SupportChecker from './SupportChecker';
import { useReport } from 'interface/report/context/ReportContext';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useFight } from 'interface/report/context/FightContext';
import { LoadingStatus } from 'interface/report/Results/ResultsContext';

const ResultsLoader = () => {
  const config = useConfig();
  const { report } = useReport();
  const { player, combatants } = usePlayer();
  const { fight } = useFight();
  const [timeFilter, setTimeFilter] = useState<Filter | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>(SELECTION_ALL_PHASES);
  const [selectedInstance, setSelectedInstance] = useState<number>(0);

  const parserClass = useParser(config);
  const isLoadingParser = parserClass == null;

  const events = useEvents({ report, fight, player });
  const isLoadingEvents = events == null;

  const { loadingState: bossPhaseEventsLoadingState, events: bossPhaseEvents } = useBossPhaseEvents(
    { report, fight },
  );

  const { characterProfile, isLoading: isLoadingCharacterProfile } = useCharacterProfile({
    report,
    player,
  });

  // Original code only rendered <PhaseParser> if
  // > !this.state.isLoadingEvents
  // > && this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING
  // We have to always run the hook, so the hook has to make sure it has the necessary data
  const { phases, isLoading: isLoadingPhases } = usePhases({
    bossPhaseEventsLoaded: bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING,
    fight,
    bossPhaseEvents,
  });

  const applyPhaseFilter = useCallback(
    (phase: string, instance: any) => {
      setSelectedPhase(phase);
      setSelectedInstance(instance);
      setTimeFilter(
        phase === SELECTION_ALL_PHASES
          ? null
          : phases && { start: phases[phase].start[instance], end: phases[phase].end[instance] },
      );
      return null;
    },
    // TODO: I don't think we need to re-render whenever phases changes.. this callback should work the same.
    // this is here because of react-hooks/exhaustive-deps
    [phases],
  );
  const applyTimeFilter = useCallback(
    (start: number, end: number) => {
      //set time filter to null if 0 and end of fight are selected as boundaries
      setTimeFilter(
        start === 0 && end === fight.end_time - fight.start_time
          ? null
          : { start: start + fight.start_time, end: end + fight.start_time },
      );
      setSelectedPhase(SELECTION_ALL_PHASES);
      setSelectedInstance(0);
      return null;
    },
    // TODO: I don't think we need to re-render whenever phases changes.. this callback should work the same.
    // this is here because of react-hooks/exhaustive-deps
    [fight.end_time, fight.start_time],
  );

  // Original code only rendered TimeEventFilter if
  // > !this.state.isLoadingEvents &&
  // > this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING
  // We have to always run the hook, but the hook must ensure the above is true
  const {
    isLoading: isFilteringEvents,
    events: filteredEvents,
    fight: filteredFight,
  } = useTimeEventFilter({
    bossPhaseEventsLoaded: bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING,
    fight,
    filter: timeFilter!,
    phase: selectedPhase,
    phaseinstance: selectedInstance,
    bossPhaseEvents,
    events,
  });

  // Original code only rendered EventParser if
  // > !this.state.isLoadingParser &&
  // > !this.state.isLoadingCharacterProfile &&
  // > !this.state.isFilteringEvents
  // We have to always run the hook, but the hook should make sure the above is true
  // isLoadingParser => parserClass == null
  // isLoadingCharacterProfile => characterProfile == null
  // isFilteringEvents => events == null
  const {
    isLoading: isParsingEvents,
    progress: parsingEventsProgress,
    parser,
  } = useEventParser({
    report,
    fight: filteredFight,
    config,
    player,
    combatants,
    applyTimeFilter,
    applyPhaseFilter,
    parserClass,
    characterProfile,
    events: filteredEvents,
    dependenciesLoading: isLoadingParser || isLoadingCharacterProfile || isFilteringEvents,
  });
  const parsingState = isParsingEvents ? EVENT_PARSING_STATE.PARSING : EVENT_PARSING_STATE.DONE;

  const build = (parser && parser.build) || undefined;

  const progress =
    (!isLoadingParser ? 0.05 : 0) +
    (!isLoadingEvents ? 0.05 : 0) +
    (bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING ? 0.05 : 0) +
    (!isLoadingCharacterProfile ? 0.05 : 0) +
    (!isFilteringEvents ? 0.05 : 0) +
    parsingEventsProgress! * 0.75;

  const loadingStatus: LoadingStatus = {
    progress: progress,
    isLoadingParser: isLoadingParser,
    isLoadingEvents: isLoadingEvents,
    bossPhaseEventsLoadingState: bossPhaseEventsLoadingState,
    isLoadingCharacterProfile: isLoadingCharacterProfile,
    isLoadingPhases: isLoadingPhases,
    isFilteringEvents: isFilteringEvents,
    parsingState: parsingState,
  };

  return (
    <Results
      config={config}
      loadingStatus={loadingStatus}
      report={report}
      fight={filteredFight || { offset_time: 0, filtered: false, ...fight }} //if no filtered fight has been parsed yet, pass previous fight object alongside 0 offset time and no filtering
      player={player}
      characterProfile={characterProfile!}
      parser={parser!}
      phases={phases}
      selectedPhase={selectedPhase}
      selectedInstance={selectedInstance}
      handlePhaseSelection={applyPhaseFilter}
      applyFilter={applyTimeFilter}
      timeFilter={timeFilter!}
      build={build}
      makeTabUrl={(tab: string, newBuild?: string) =>
        makeAnalyzerUrl(report, fight.id, player.id, tab, newBuild || config.builds?.[build!]?.url)
      }
    />
  );
};

const ReportLayout = () => (
  // TODO: Error boundary so all sub components don't need the errorHandler with the silly withRouter dependency. Instead just throw the error and let the boundary catch it - if possible.
  <>
    <NavigationBar />

    <ErrorBoundary>
      <ReportLoader>
        <ReportExpansionContextProvider>
          <PatchChecker>
            <FightSelection>
              <PlayerLoader>
                <ReportPlayerConfigProvider>
                  <SupportChecker>
                    <ResultsLoader />
                  </SupportChecker>
                </ReportPlayerConfigProvider>
              </PlayerLoader>
            </FightSelection>
          </PatchChecker>
        </ReportExpansionContextProvider>
      </ReportLoader>
    </ErrorBoundary>
  </>
);

export default ReportLayout;
