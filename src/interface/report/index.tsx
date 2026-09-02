import ErrorBoundary from 'interface/ErrorBoundary';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import NavigationBar from 'interface/NavigationBar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from './hooks/usePhases';
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
import { Trans } from '@lingui/react/macro';
import Report from 'parser/core/Report';
import { Link, useNavigate } from 'react-router-dom';
import { WCLFight } from 'parser/core/Fight';
import handleApiError from './handleApiError';
import { AnyEvent, EventType, type CombatantInfoEvent } from 'parser/core/Events';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import GameBranch from 'game/GameBranch';
import { fetchCombatants } from 'common/fetchWclApi';
import { normalizedEncounterId } from 'game/raids';
import useDungeonPullList from './DungeonPullList/DungeonPullListCombatParser';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { isMythicPlus } from 'common/isMythicPlus';

const UnsupportedSpecBouncer = ({ report, fight }: { report: Report; fight: WCLFight }) => (
  <main className="container offset">
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
  </main>
);

const MissingCombatantInfoBouncer = ({ report, fight }: { report: Report; fight: WCLFight }) => (
  <main className="container offset">
    <Panel
      title={
        <Trans id="interface.report.missingCombatantInfo.title">
          Combatant info is missing from this fight
        </Trans>
      }
    >
      <div className="flex wrappable">
        <div className="flex-main pad">
          <p>
            <Trans id="interface.report.missingCombatantInfo.body">
              This fight is missing a <code>combatantinfo</code> event for the selected player. This
              is the event that contains gear, talents, and spec. Without it, WoWAnalyzer cannot
              function. When this event is missing for one player, it is usually missing for all
              players in the fight.
            </Trans>
          </p>
          <p>
            <Trans id="interface.report.missingCombatantInfo.error-reporting">
              If you see this error but are able to see gear and/or talents on Warcraft Logs, please
              let us know on Discord!
            </Trans>
          </p>
          <Link to={makeAnalyzerUrl(report, fight.id)}>Go Back</Link>
        </div>
      </div>
    </Panel>
  </main>
);

const ResultsLoader = () => {
  const config = useConfig();
  const navigate = useNavigate();
  const { report } = useReport();
  const { player, allPlayers } = usePlayer();
  const { fight } = useFight();
  const [timeFilter, setTimeFilter] = useState<Filter | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<number>(SELECTION_ALL_PHASES);
  const pull = useWaSelector((state) => state.navigation.pull);

  const isWaitingOnPullSelection = isMythicPlus(fight) && pull === undefined;

  useEffect(() => {
    if (typeof pull === 'number') {
      setSelectedPhase(pull - 1); // wcl is 1-indexed
      const pullObj = fight.dungeonPulls?.find((pullObj) => pullObj.id === pull);

      if (pullObj) {
        setTimeFilter({
          start: pullObj.start_time,
          end: pullObj.end_time,
        });
      }

      // DungeonPullList handles redux state updates when the pull is not present
    } else if (isMythicPlus(fight)) {
      setSelectedPhase(SELECTION_ALL_PHASES);
      setTimeFilter(null);
    }
  }, [fight, pull]);

  const parserClass = useParser(config);
  const isLoadingParser = !parserClass;

  const {
    events: rawEvents,
    currentTime,
    error,
    pulls,
    allDeaths,
  } = useEvents({ report, fight, player });

  const partialEvents = useRef<{ pull: number; events: AnyEvent[] } | null>(null);

  useEffect(() => {
    partialEvents.current = null;
  }, [fight, report]);

  // beware: turning off `events` here is performant, toggling `dependenciesLoading` in the `useEventsParser` call is NOT.
  const events = useMemo(() => {
    if (isWaitingOnPullSelection) {
      partialEvents.current = null;
      return null;
    }

    if (typeof pull === 'number' && partialEvents.current?.pull === pull) {
      return partialEvents.current.events;
    }

    if (!rawEvents && typeof pull === 'number' && pulls) {
      const index = pulls.findIndex((chunk) => chunk.target.id === pull + 1);
      if (index < 0) {
        return null;
      }

      const partial = pulls
        .slice(0, index + 1)
        .reduce((a, b) => a.concat(b.events), [] as AnyEvent[]);
      partialEvents.current = { pull, events: partial };
      return partial;
    }

    return rawEvents;
  }, [rawEvents, isWaitingOnPullSelection, pull, pulls]);

  const isLoadingEvents = events == null;

  const { loadingState: bossPhaseEventsLoadingState, events: bossPhaseEvents } = useBossPhaseEvents(
    { report, fight },
  );

  const { characterProfile, isLoading: isLoadingCharacterProfile } = useCharacterProfile({
    report,
    player,
  });

  const applyPhaseFilter = useCallback(
    (phaseIndex: number) => {
      setSelectedPhase(phaseIndex);
      if (phaseIndex === SELECTION_ALL_PHASES) {
        setTimeFilter(null);
      } else if (fight.dungeonPulls?.[phaseIndex]) {
        setTimeFilter({
          start: fight.dungeonPulls[phaseIndex].start_time,
          end: fight.dungeonPulls[phaseIndex].end_time,
        });
      } else if (fight.phases?.[phaseIndex]) {
        setTimeFilter({
          start: fight.phases[phaseIndex].startTime,
          end: fight.phases[phaseIndex + 1]?.startTime ?? fight.end_time,
        });
      } else {
        setTimeFilter(null);
      }
      return null;
    },
    [fight],
  );
  const applyTimeFilter = useCallback(
    (start: number, end: number) => {
      const isFullFight = start === 0 && end === fight.end_time - fight.start_time;
      //set time filter to null if 0 and end of fight are selected as boundaries
      setTimeFilter(
        isFullFight ? null : { start: start + fight.start_time, end: end + fight.start_time },
      );
      setSelectedPhase(isFullFight ? SELECTION_ALL_PHASES : SELECTION_CUSTOM_PHASE);
      return null;
    },
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
    bossPhaseEvents,
    events,
  });

  const [playerCombatantInfo, setPlayerCombatantInfo] = useState<CombatantInfoEvent | undefined>();

  useEffect(() => {
    // we optimistically check both the rawEvent list and the first pull from a dungeon to avoid the "missing combatantinfo" intermediate state
    const existing = (rawEvents ?? pulls[0]?.events)?.find(
      (event): event is CombatantInfoEvent =>
        event.type === EventType.CombatantInfo && event.sourceID === player.id,
    );

    let cancelled = false;
    if (existing) {
      setPlayerCombatantInfo(existing);
    } else if (wclGameVersionToBranch(report.gameVersion) === GameBranch.Classic) {
      // in classic, RP handling may split the first part of a fight out into a separate "fight". check it for combatantinfo asynchronously
      const prevFight = report.fights.find((other) => other.id === fight.id - 1);
      if (
        prevFight &&
        prevFight.boss === 0 &&
        prevFight.originalBoss === normalizedEncounterId(fight.boss)
      ) {
        fetchCombatants(report.code, prevFight.start_time, prevFight.end_time)
          .then((combatantinfo) => {
            if (cancelled) {
              return;
            }

            const prevInfo = combatantinfo.find(
              (event): event is CombatantInfoEvent =>
                event.type === EventType.CombatantInfo && event.sourceID === player.id,
            );
            if (prevInfo) {
              // the `current ?? prevInfo` prevents react dev mode from reprocessing data again
              setPlayerCombatantInfo((current) => current ?? prevInfo);
            }
          })
          .catch((error) => {
            // don't fail in a visible way
            console.error('failed to load previous combatantinfo', error);
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [rawEvents, player.id, report, fight, pulls]);

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
    allPlayers,
    applyTimeFilter,
    parserClass,
    characterProfile,
    events: filteredEvents,
    dependenciesLoading: isLoadingParser || isLoadingCharacterProfile || isFilteringEvents,
    playerCombatantInfo,
  });

  const dungeonPullDetails = useDungeonPullList({
    report,
    fight,
    config,
    player,
    allPlayers,
    parser: parserClass,
    characterProfile,
    pulls,
    allDeaths,
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
    isLoadingPhases: false,
    isFilteringEvents: isFilteringEvents,
    parsingState: parsingState,
  };

  if (events && !playerCombatantInfo) {
    // display error instead of crashing. this can happen in rare cases where `combatantinfo` is not a part of the fight
    return <MissingCombatantInfoBouncer report={report} fight={fight} />;
  }
  if (!config.parser) {
    // display error instead. this is not normally accessible via the UI but would be via direct link / URL modification
    return <UnsupportedSpecBouncer report={report} fight={fight} />;
  }
  if (error) {
    return handleApiError(error, () => {
      navigate(makeAnalyzerUrl());
    });
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
      selectedPhaseIndex={selectedPhase}
      handlePhaseSelection={applyPhaseFilter}
      applyFilter={applyTimeFilter}
      timeFilter={timeFilter ?? undefined}
      makeTabUrl={(tab: string) =>
        makeAnalyzerUrl(report, fight.id, player.id, tab, undefined, pull)
      }
      dungeonPullDetails={dungeonPullDetails}
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
