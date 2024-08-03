import ErrorBoundary from 'interface/ErrorBoundary';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import NavigationBar from 'interface/NavigationBar';
import { useCallback, useState } from 'react';

import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';
import { useConfig } from './ConfigContext';
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
import Panel from 'interface/Panel';
import { Trans } from '@lingui/macro';
import Report from 'parser/core/Report';
import { Link } from 'react-router-dom';
import { WCLFight } from 'parser/core/Fight';

const UnsupportedSpecBouncer = ({ report, fight }: { report: Report; fight: WCLFight }) => (
  <div className="container offset">
    <Panel
      title={
        <Trans id="interface.report.unsupportSpec.title">
          The selected specialization is not supported.
        </Trans>
      }
    >
      <div className="flex wrappable">
        <div className="flex-main pad">
          <p>
            <Trans id="interface.report.unsupportedSpec.body">
              The selected specialization has not been updated for the latest expansion and cannot
              be used due to ability changes.
            </Trans>
          </p>
          <Link to={makeAnalyzerUrl(report, fight.id)}>Go Back</Link>
        </div>
      </div>
    </Panel>
  </div>
);

const ResultsLoader = () => {
  const config = useConfig();
  const { report } = useReport();
  const { player, combatants } = usePlayer();
  const { fight } = useFight();
  const [timeFilter, setTimeFilter] = useState<Filter | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>(SELECTION_ALL_PHASES);
  const [selectedInstance, setSelectedInstance] = useState<number>(0);
  const [selectedDungeonPull, setSelectedDungeonPull] = useState<string>(SELECTION_ALL_PHASES);

  const parserClass = useParser(config);
  const isLoadingParser = !parserClass;

  const { events, currentTime } = useEvents({ report, fight, player });
  const isLoadingEvents = events == null;

  const {
    loadingState: bossPhaseEventsLoadingState,
    events: bossPhaseEvents,
    phaseConfigs: bossPhaseConfigs,
  } = useBossPhaseEvents({ report, fight });

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
    bossPhaseConfigs,
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
  const applyDungeonPullFilter = useCallback(
    (dungeonPull: string) => {
      setSelectedDungeonPull(dungeonPull);
      const matchingDungeonPull = fight.dungeonPulls?.find(
        (pull) => String(pull.id) === dungeonPull,
      );
      if (dungeonPull === SELECTION_ALL_PHASES || !matchingDungeonPull) {
        setTimeFilter(null);
      } else {
        setTimeFilter({ start: matchingDungeonPull.start_time, end: matchingDungeonPull.end_time });
      }
      return null;
    },
    [fight.dungeonPulls],
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

  const pageProgress = (currentTime - fight.start_time) / (fight.end_time - fight.start_time);

  const progress =
    (!isLoadingParser ? 0.05 : 0) +
    (!isLoadingEvents ? 0.05 : pageProgress * 0.05) +
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

  if (!config.parser) {
    // display error instead. this is not normally accessible via the UI but would be via direct link / URL modification
    return <UnsupportedSpecBouncer report={report} fight={fight} />;
  }

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
      selectedDungeonPull={selectedDungeonPull}
      handlePhaseSelection={applyPhaseFilter}
      handleDungeonPullSelection={applyDungeonPullFilter}
      applyFilter={applyTimeFilter}
      timeFilter={timeFilter!}
      makeTabUrl={(tab: string) => makeAnalyzerUrl(report, fight.id, player.id, tab)}
    />
  );
};

export function Component() {
  return (
    <>
      <NavigationBar />

      <ErrorBoundary>
        <ReportLoader>
          <ReportExpansionContextProvider>
            <PatchChecker>
              <FightSelection>
                <PlayerLoader>
                  <SupportChecker>
                    <ResultsLoader />
                  </SupportChecker>
                </PlayerLoader>
              </FightSelection>
            </PatchChecker>
          </ReportExpansionContextProvider>
        </ReportLoader>
      </ErrorBoundary>
    </>
  );
}
