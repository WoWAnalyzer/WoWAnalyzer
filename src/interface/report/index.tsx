import { wclGameVersionToExpansion } from 'game/VERSIONS';
import ErrorBoundary from 'interface/ErrorBoundary';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import NavigationBar from 'interface/NavigationBar';
import useBossPhaseEvents from 'interface/useBossPhaseEvents';
import useCharacterProfile from 'interface/useCharacterProfile';
import useEventParser from 'interface/useEventParser';
import useEvents from 'interface/useEvents';
import useParser from 'interface/useParser';
import usePhases, { SELECTION_ALL_PHASES } from 'interface/usePhases';
import useTimeEventFilter, { Filter } from 'interface/useTimeEventFilter';
import Config from 'parser/Config';
import { CombatantInfoEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import ReportObject from 'parser/core/Report';
import getConfig from 'parser/getConfig';
import { useCallback, useState } from 'react';

import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';
import ConfigContext from './ConfigContext';
import EVENT_PARSING_STATE from './EVENT_PARSING_STATE';
import FightSelection from './FightSelection';
import PatchChecker from './PatchChecker';
import PlayerLoader from './PlayerLoader';
import ReportLoader from './ReportLoader';
import Results from './Results';
import SupportChecker from './SupportChecker';

interface Props {
  config: Config;
  report: ReportObject;
  fight: WCLFight;
  player: PlayerInfo;
  combatants: CombatantInfoEvent[];
}

const ResultsLoader = ({ config, report, fight, player, combatants }: Props) => {
  const [timeFilter, setTimeFilter] = useState<Filter | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>(SELECTION_ALL_PHASES);
  const [selectedInstance, setSelectedInstance] = useState<number>(0);

  const parserClass = useParser(config);
  const isLoadingParser = parserClass == null;

  const events = useEvents({ report, fight, player });
  const isLoadingEvents = events == null;

  const {
    loadingState: bossPhaseEventsLoadingState,
    events: bossPhaseEvents,
  } = useBossPhaseEvents({ report, fight });

  const characterProfile = useCharacterProfile({ report, player });
  const isLoadingCharacterProfile = characterProfile == null;

  // Original code only rendered <PhaseParser> if
  // > !this.state.isLoadingEvents
  // > && this.state.bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING
  // We have to always run the hook, so the hook has to make sure it has the necessary data
  const phases = usePhases({
    bossPhaseEventsLoaded: bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING,
    fight,
    bossPhaseEvents,
  });
  const isLoadingPhases = phases == null;

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
  const { isLoading: isParsingEvents, progress: parsingEventsProgress, parser } =
    useEventParser({
      report,
      fight: filteredFight,
      config,
      player,
      combatants,
      applyTimeFilter,
      applyPhaseFilter,
      parserClass,
      builds: config.builds,
      characterProfile,
      events: filteredEvents,
    }) || {};
  const parsingState = isParsingEvents ? EVENT_PARSING_STATE.PARSING : EVENT_PARSING_STATE.DONE;

  const build = (parser && parser.build) || undefined;

  const progress =
    (!isLoadingParser ? 0.05 : 0) +
    (!isLoadingEvents ? 0.05 : 0) +
    (bossPhaseEventsLoadingState !== BOSS_PHASES_STATE.LOADING ? 0.05 : 0) +
    (!isLoadingCharacterProfile ? 0.05 : 0) +
    (!isFilteringEvents ? 0.05 : 0) +
    parsingEventsProgress! * 0.75;

  return (
    <Results
      config={config}
      isLoadingParser={isLoadingParser}
      isLoadingEvents={isLoadingEvents}
      bossPhaseEventsLoadingState={bossPhaseEventsLoadingState}
      isLoadingCharacterProfile={isLoadingCharacterProfile}
      parsingState={parsingState}
      progress={progress}
      report={report}
      fight={filteredFight || { offset_time: 0, filtered: false, ...fight }} //if no filtered fight has been parsed yet, pass previous fight object alongside 0 offset time and no filtering
      player={player}
      characterProfile={characterProfile!}
      parser={parser!}
      isLoadingPhases={isLoadingPhases}
      isFilteringEvents={isFilteringEvents}
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

// TODO: Turn all the loaders and shit into hooks
const Report = () => (
  // TODO: Error boundary so all sub components don't need the errorHandler with the silly withRouter dependency. Instead just throw the error and let the boundary catch it - if possible.
  <>
    <NavigationBar />

    <ErrorBoundary>
      <ReportLoader>
        {(report, refreshReport) => (
          <PatchChecker report={report}>
            <FightSelection report={report} refreshReport={refreshReport}>
              {(fight) => (
                <PlayerLoader report={report} fight={fight}>
                  {(player, combatant, combatants) => (
                    <ConfigContext.Provider
                      value={getConfig(
                        wclGameVersionToExpansion(report.gameVersion),
                        combatant.specID,
                        player.type,
                      )}
                    >
                      <SupportChecker report={report} fight={fight} player={player}>
                        <ConfigContext.Consumer>
                          {(config) => (
                            <ResultsLoader
                              config={config!}
                              report={report}
                              fight={fight}
                              player={player}
                              combatants={combatants}
                            />
                          )}
                        </ConfigContext.Consumer>
                      </SupportChecker>
                    </ConfigContext.Provider>
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
