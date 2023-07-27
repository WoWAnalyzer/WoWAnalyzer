import { t, Trans } from '@lingui/macro';
import getFightName from 'common/getFightName';
import makeWclUrl from 'common/makeWclUrl';
import { findByBossId, Phase } from 'game/raids';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import { appendReportHistory } from 'interface/actions/reportHistory';
import AlertWarning from 'interface/AlertWarning';
import Contributor from 'interface/ContributorButton';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import WipefestIcon from 'interface/icons/Wipefest';
import ReadableListing from 'interface/ReadableListing';
import { Filter } from 'interface/report/hooks/useTimeEventFilter';
import REPORT_HISTORY_TYPES from 'interface/REPORT_HISTORY_TYPES';
import { getResultTab } from 'interface/selectors/url/report';
import Tooltip from 'interface/Tooltip';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import Fight from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CombatLogParserProvider } from 'interface/report/CombatLogParserContext';
import { LoadingStatus, ResultsContext } from 'interface/report/Results/ResultsContext';
import ParseResults from 'parser/core/ParseResults';
import Expansion from 'game/Expansion';
import { reset, setBaseUrl } from 'interface/actions/tooltips';

import './Results.scss';
import BOSS_PHASES_STATE from '../BOSS_PHASES_STATE';
import EVENT_PARSING_STATE from '../EVENT_PARSING_STATE';
import ReportDurationWarning, { MAX_REPORT_DURATION } from '../ReportDurationWarning';
import DegradedExperience from './DegradedExperience';
import Header from './Header';
import ItemWarning from './ItemWarning';
import ScrollToTop from './ScrollToTop';
import ZONES from 'game/ZONES';
import { useLingui } from '@lingui/react';

interface PassedProps {
  parser: CombatLogParser;
  characterProfile: CharacterProfile;
  makeTabUrl: (tab: string, build?: string) => string;
  phases: { [key: string]: Phase } | null;
  selectedPhase: string;
  selectedInstance: number;
  handlePhaseSelection: (phase: string, instance: number) => void;
  selectedDungeonPull: string;
  handleDungeonPullSelection: (pull: string) => void;
  applyFilter: (start: number, end: number) => void;
  timeFilter?: Filter;
  build?: string;
  report: Report;
  fight: Fight;
  player: PlayerInfo;
  loadingStatus: LoadingStatus;
  premium?: boolean;
  config: Config;
}

const Results = (props: PassedProps) => {
  const location = useLocation();
  const selectedTab = getResultTab(location.pathname);
  const dispatch = useDispatch();
  const [adjustForDowntime, setAdjustForDowntime] = useState(false);
  const [results, setResults] = useState<ParseResults | null>(null);
  const { i18n } = useLingui();

  const generateResults = useCallback(() => {
    if (props.parser == null) {
      setResults(null);
      return;
    }
    setResults(props.parser.generateResults(adjustForDowntime));
  }, [adjustForDowntime, props.parser]);

  const isLoading = useMemo(
    () =>
      props.loadingStatus.isLoadingParser ||
      props.loadingStatus.isLoadingEvents ||
      props.loadingStatus.bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING ||
      props.loadingStatus.isLoadingCharacterProfile ||
      props.loadingStatus.isLoadingPhases ||
      props.loadingStatus.isFilteringEvents ||
      props.loadingStatus.parsingState !== EVENT_PARSING_STATE.DONE,
    [
      props.loadingStatus.bossPhaseEventsLoadingState,
      props.loadingStatus.isFilteringEvents,
      props.loadingStatus.isLoadingCharacterProfile,
      props.loadingStatus.isLoadingEvents,
      props.loadingStatus.isLoadingParser,
      props.loadingStatus.isLoadingPhases,
      props.loadingStatus.parsingState,
    ],
  );

  const boss = findByBossId(props.fight.boss);

  const appendHistory = useCallback(
    (report: Report, fight: Fight, player: PlayerInfo) => {
      dispatch(
        appendReportHistory({
          code: report.code,
          title: report.title,
          start: Math.floor(report.start / 1000),
          end: Math.floor(report.end / 1000),
          fightId: fight.id,
          fightName: getFightName(report, fight),
          playerId: player.id,
          playerName: player.name,
          playerClass: player.type,
          type: REPORT_HISTORY_TYPES.REPORT,
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isLoading) {
      generateResults();
    }
  }, [generateResults, isLoading]);

  // on game version change
  useEffect(() => {
    const zone = ZONES.find((zone) => zone.id === props.report.zone);

    switch (wclGameVersionToExpansion(props.report.gameVersion)) {
      case Expansion.WrathOfTheLichKing:
        dispatch(setBaseUrl('https://www.wowhead.com/wotlk/'));
        break;
      case Expansion.TheBurningCrusade:
        dispatch(setBaseUrl('https://tbc.wowhead.com/'));
        break;
      default:
        if (zone?.usePtrTooltips) {
          dispatch(setBaseUrl('https://wowhead.com/ptr/'));
        } else {
          dispatch(reset());
        }
        break;
    }
  }, [dispatch, props.report.gameVersion, props.report.zone]);

  // on tab change
  useEffect(() => {
    // TODO: To improve user experience we could try to avoid scrolling when the header is still within vision.
    if (selectedTab) {
      window.scrollTo(0, 0);
    }
  }, [selectedTab]);

  useEffect(() => {
    appendHistory(props.report, props.fight, props.player);
  }, [appendHistory, props.fight, props.player, props.report]);

  // on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contributorinfo = (
    <ReadableListing>
      {props.config.contributors.length !== 0
        ? props.config.contributors.map((contributor) => (
            <Contributor key={contributor.nickname} {...contributor} />
          ))
        : 'CURRENTLY UNMAINTAINED'}
    </ReadableListing>
  );

  const reportDuration = props.report.end - props.report.start;

  return (
    <ResultsContext.Provider
      value={{
        adjustForDowntime,
        setAdjustForDowntime,
        generateResults,
        isLoading,
        loadingStatus: props.loadingStatus,
        results,
      }}
    >
      <div className={`results boss-${props.fight.boss}`}>
        <Header
          config={props.config}
          player={props.player}
          characterProfile={props.characterProfile}
          boss={boss}
          fight={props.fight}
          tabs={results ? results.tabs : []}
          makeTabUrl={props.makeTabUrl}
          selectedTab={selectedTab}
          selectedPhase={props.selectedPhase}
          selectedInstance={props.selectedInstance}
          selectedDungeonPull={props.selectedDungeonPull}
          phases={props.phases}
          handlePhaseSelection={props.handlePhaseSelection}
          handleDungeonPullSelection={props.handleDungeonPullSelection}
          applyFilter={props.applyFilter}
          build={props.build}
          isLoading={isLoading}
        />

        {props.fight.end_time > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {props.parser && props.parser.disabledModules && (
          <DegradedExperience disabledModules={props.parser.disabledModules} />
        )}
        {boss && boss.fight.resultsWarning && (
          <div className="container">
            <AlertWarning style={{ marginBottom: 30 }}>{boss.fight.resultsWarning}</AlertWarning>
          </div>
        )}
        {props.parser && props.parser.selectedCombatant.gear && (
          <ItemWarning gear={props.parser.selectedCombatant.gear} />
        )}
        {props.timeFilter && (
          <div className="container">
            <AlertWarning style={{ marginBottom: 30 }}>
              <Trans id="interface.report.results.warning.timeFilter">
                These results are filtered to the selected time period. Time filtered results are
                under development and may not be entirely accurate. <br /> Please report any issues
                you may find on our GitHub or Discord.
              </Trans>
            </AlertWarning>
          </div>
        )}
        {props.build && props.build !== 'default' && (
          <div className="container">
            <AlertWarning style={{ marginBottom: 30 }}>
              <Trans id="interface.report.results.warning.build">
                These results are analyzed under build different from the standard build. While this
                will make some modules more accurate, some may also not provide the information you
                expect them to. <br /> Please report any issues you may find on our GitHub or
                Discord.
              </Trans>
            </AlertWarning>
          </div>
        )}
        <CombatLogParserProvider combatLogParser={props.parser}>
          <Outlet />
        </CombatLogParserProvider>

        <div className="container" style={{ marginTop: 40 }}>
          <div className="row">
            <div className="col-md-8">
              <small>
                <Trans id="interface.report.results.providedBy">Provided by</Trans>
              </small>
              <div style={{ fontSize: 16 }}>
                <Trans id="interface.report.results.providedByDetails">
                  {props.config.spec.specName ? i18n._(props.config.spec.specName) : null}{' '}
                  {i18n._(props.config.spec.className)} analysis has been provided by{' '}
                  {contributorinfo}. They love hearing what you think, so please let them know!{' '}
                  <Link to={props.makeTabUrl('about')}>
                    More information about this spec's analyzer.
                  </Link>
                </Trans>
              </div>
            </div>
            <div className="col-md-3">
              <small>
                <Trans id="interface.report.results.viewOn">View on</Trans>
              </small>
              <br />
              <Tooltip
                content={t({
                  id: 'interface.report.results.tooltip.newTab.originalReport',
                  message: `Opens in a new tab. View the original report.`,
                })}
              >
                <a
                  href={makeWclUrl(
                    props.report.code,
                    {
                      fight: props.fight.id,
                      source: props.parser ? props.parser.playerId : undefined,
                    },
                    wclGameVersionToExpansion(props.report.gameVersion),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 20, padding: '6px 0' }}
                >
                  <WarcraftLogsIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Warcraft
                  Logs
                </a>
              </Tooltip>
              <br />
              <Tooltip
                content={t({
                  id: 'interface.report.results.tooltip.newTab.insightsAndTimelines',
                  message: `Opens in a new tab. View insights and timelines for raid encounters.`,
                })}
              >
                <a
                  href={`https://www.wipefest.net/report/${props.report.code}/fight/${props.fight.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 20, padding: '6px 0' }}
                >
                  <WipefestIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Wipefest
                </a>
              </Tooltip>
            </div>
            <div className="col-md-1">
              <Tooltip
                content={
                  <Trans id="interface.report.results.tooltip.backToTop">
                    Scroll back to the top.
                  </Trans>
                }
              >
                <ScrollToTop />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </ResultsContext.Provider>
  );
};

export default Results;
