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
import TooltipProvider from 'interface/TooltipProvider';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import Fight from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import './Results.scss';
import BOSS_PHASES_STATE from '../BOSS_PHASES_STATE';
import EVENT_PARSING_STATE from '../EVENT_PARSING_STATE';
import ReportDurationWarning, { MAX_REPORT_DURATION } from '../ReportDurationWarning';
import DegradedExperience from './DegradedExperience';
import Header from './Header';
import ItemWarning from './ItemWarning';
import ScrollToTop from './ScrollToTop';
import { CombatLogParserProvider } from 'interface/report/CombatLogParserContext';
import { isRetailExpansion } from 'game/Expansion';
import ResultsContent from 'interface/report/Results/ResultsContent';

interface PassedProps {
  parser: CombatLogParser;
  characterProfile: CharacterProfile;
  makeTabUrl: (tab: string, build?: string) => string;
  phases: { [key: string]: Phase } | null;
  selectedPhase: string;
  selectedInstance: number;
  handlePhaseSelection: (phase: string, instance: number) => void;
  applyFilter: (start: number, end: number) => void;
  timeFilter?: Filter;
  build?: string;
  report: Report;
  fight: Fight;
  player: PlayerInfo;
  isLoadingParser?: boolean;
  isLoadingEvents?: boolean;
  isLoadingPhases?: boolean;
  isFilteringEvents?: boolean;
  bossPhaseEventsLoadingState?: BOSS_PHASES_STATE;
  isLoadingCharacterProfile?: boolean;
  parsingState?: EVENT_PARSING_STATE;
  progress?: number;
  premium?: boolean;
  config: Config;
}

const Results = (props: PassedProps) => {
  const location = useLocation();
  const selectedTab = getResultTab(location.pathname);
  const dispatch = useDispatch();
  const [adjustForDowntime, setAdjustForDowntime] = useState(false);

  const isLoading =
    props.isLoadingParser ||
    props.isLoadingEvents ||
    props.bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING ||
    props.isLoadingCharacterProfile ||
    props.isLoadingPhases ||
    props.isFilteringEvents ||
    props.parsingState !== EVENT_PARSING_STATE.DONE;

  const boss = findByBossId(props.fight.boss);

  const results = isLoading ? null : props.parser.generateResults(adjustForDowntime);

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

  // on game version change
  useEffect(() => {
    // Kind of ugly but also very working. We should replace the TooltipProvider class with a context that is used by SpellLink to make this easier to manipulate.
    switch (props.report.gameVersion) {
      case 4:
        TooltipProvider.baseUrl = 'https://www.wowhead.com/wotlk/';
        break;
      case 3:
        TooltipProvider.baseUrl = 'https://tbc.wowhead.com/';
        break;
      default:
        TooltipProvider.baseUrl = 'https://www.wowhead.com/beta/';
        break;
    }
  }, [props.report.gameVersion]);

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
        phases={props.phases}
        handlePhaseSelection={props.handlePhaseSelection}
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
      {isRetailExpansion(props.config.expansion) && (
        //Warning Message for Dragonflight Prepatch (Remove after Dragonflight Launch)
        <div className="container">
          <AlertWarning style={{ marginBottom: 30 }}>
            In an effort to focus on Dragonflight and Vault of the Incarnates development, we will
            be reducing support for Covenants, Conduits, legendaries, and other Shadowlands specific
            items with the launch of Prepatch. As a result, analysis of Prepatch encounters may be
            inaccurate.
          </AlertWarning>
        </div>
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
              expect them to. <br /> Please report any issues you may find on our GitHub or Discord.
            </Trans>
          </AlertWarning>
        </div>
      )}
      <CombatLogParserProvider combatLogParser={props.parser}>
        <ResultsContent
          config={props.config}
          isLoading={isLoading}
          parser={props.parser}
          results={results}
          selectedTab={selectedTab}
          adjustForDowntime={adjustForDowntime}
          setAdjustForDowntime={setAdjustForDowntime}
          progress={props.progress}
          isLoadingParser={props.isLoadingParser}
          isLoadingEvents={props.isLoadingEvents}
          bossPhaseEventsLoadingState={props.bossPhaseEventsLoadingState}
          isLoadingCharacterProfile={props.isLoadingCharacterProfile}
          isLoadingPhases={props.isLoadingPhases}
          isFilteringEvents={props.isFilteringEvents}
          parsingState={props.parsingState}
        />
      </CombatLogParserProvider>

      <div className="container" style={{ marginTop: 40 }}>
        <div className="row">
          <div className="col-md-8">
            <small>
              <Trans id="interface.report.results.providedBy">Provided by</Trans>
            </small>
            <div style={{ fontSize: 16 }}>
              <Trans id="interface.report.results.providedByDetails">
                {props.config.spec.specName} {props.config.spec.className} analysis has been
                provided by {contributorinfo}. They love hearing what you think, so please let them
                know!{' '}
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
                <WarcraftLogsIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Warcraft Logs
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
  );
};

export default Results;
