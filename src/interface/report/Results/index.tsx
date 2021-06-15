import { Trans, t } from '@lingui/macro';
import getFightName from 'common/getFightName';
import lazyLoadComponent from 'common/lazyLoadComponent';
import makeWclUrl from 'common/makeWclUrl';
import retryingPromise from 'common/retryingPromise';
import { findByBossId, Phase } from 'game/raids';
import { appendReportHistory } from 'interface/actions/reportHistory';
import Ad from 'interface/Ad';
import AlertWarning from 'interface/AlertWarning';
import Contributor from 'interface/ContributorButton';
import ErrorBoundary from 'interface/ErrorBoundary';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import WipefestIcon from 'interface/icons/Wipefest';
import LoadingBar from 'interface/LoadingBar';
import Panel from 'interface/Panel';
import ReadableListing from 'interface/ReadableListing';
import { RootState } from 'interface/reducers';
import { Filter } from 'interface/report/TimeEventFilter';
import REPORT_HISTORY_TYPES from 'interface/REPORT_HISTORY_TYPES';
import ResultsChangelogTab from 'interface/ResultsChangelogTab';
import { getResultTab } from 'interface/selectors/url/report';
import { hasPremium } from 'interface/selectors/user';
import Tooltip from 'interface/Tooltip';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import Fight from 'parser/core/Fight';
import ParseResults from 'parser/core/ParseResults';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import StatTracker from 'parser/shared/modules/StatTracker';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import './Results.scss';
import BOSS_PHASES_STATE from '../BOSS_PHASES_STATE';
import EVENT_PARSING_STATE from '../EVENT_PARSING_STATE';
import ReportDurationWarning, { MAX_REPORT_DURATION } from '../ReportDurationWarning';
import About from './About';
import Character from './CharacterTab';
import DegradedExperience from './DegradedExperience';
import EncounterStats from './EncounterStats';
import Header from './Header';
import ItemWarning from './ItemWarning';
import Overview from './Overview';
import ReportStatistics from './ReportStatistics';
import ScrollToTop from './ScrollToTop';
import TABS from './TABS';

const TimelineTab = lazyLoadComponent(
  () =>
    retryingPromise(() =>
      import(/* webpackChunkName: 'TimelineTab' */ './Timeline/Container').then(
        (exports) => exports.default,
      ),
    ),
  0,
);
const EventsTab = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'EventsTab' */ 'interface/EventsTab').then(
      (exports) => exports.default,
    ),
  ),
);

interface ConnectedProps {
  selectedTab: string;
  premium: boolean;
  appendReportHistory: (reportHistoryItem: any) => void;
}

interface PassedProps {
  parser: CombatLogParser;
  characterProfile: CharacterProfile;
  makeBuildUrl: (tab: string, build: string) => string;
  makeTabUrl: (tab: string) => string;
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
}

type Props = PassedProps & ConnectedProps;

interface State {
  adjustForDowntime: boolean;
}

class Results extends React.PureComponent<Props, State> {
  state = {
    adjustForDowntime: false,
  };

  static childContextTypes = {
    updateResults: PropTypes.func.isRequired,
    parser: PropTypes.object,
  };
  getChildContext() {
    return {
      updateResults: this.forceUpdate.bind(this),
      parser: this.props.parser,
    };
  }
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.scrollToTop();
    this.appendHistory(this.props.report, this.props.fight, this.props.player);
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.selectedTab !== prevProps.selectedTab) {
      // TODO: To improve user experience we could try to avoid scrolling when the header is still within vision.
      this.scrollToTop();
    }
  }
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  appendHistory(report: Report, fight: Fight, player: PlayerInfo) {
    // TODO: Add spec and show it in the list
    this.props.appendReportHistory({
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
    });
  }

  get warning() {
    const parser = this.props.parser;
    const boss = parser.boss;
    if (boss && boss.fight.resultsWarning) {
      return boss.fight.resultsWarning;
    }
    return null;
  }
  get isLoading() {
    return (
      this.props.isLoadingParser ||
      this.props.isLoadingEvents ||
      this.props.bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING ||
      this.props.isLoadingCharacterProfile ||
      this.props.isLoadingPhases ||
      this.props.isFilteringEvents ||
      this.props.parsingState !== EVENT_PARSING_STATE.DONE
    );
  }

  renderContent(selectedTab: string, results: ParseResults | null) {
    const { parser, premium } = this.props;
    const config = this.context.config;

    switch (selectedTab) {
      case TABS.OVERVIEW: {
        if (this.isLoading || !results) {
          return this.renderLoadingIndicator();
        }
        const checklist = parser.getOptionalModule(Checklist);
        return <Overview checklist={checklist && checklist.render()} issues={results.issues} />;
      }
      case TABS.STATISTICS:
        if (this.isLoading || !results) {
          return this.renderLoadingIndicator();
        }
        return (
          <ReportStatistics
            parser={parser}
            adjustForDowntime={this.state.adjustForDowntime}
            onChangeAdjustForDowntime={(newValue) => this.setState({ adjustForDowntime: newValue })}
            statistics={results.statistics}
          />
        );
      case TABS.TIMELINE:
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        return <TimelineTab parser={parser} />;
      case TABS.EVENTS:
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        return (
          <div className="container">
            <EventsTab parser={parser} />
          </div>
        );
      case TABS.CHARACTER: {
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        const statTracker = parser.getModule(StatTracker);
        return (
          <div className="container">
            <Character statTracker={statTracker} combatant={parser.selectedCombatant} />

            {premium === false && (
              <div style={{ margin: '40px 0' }}>
                <Ad />
              </div>
            )}

            <EncounterStats
              config={config}
              currentBoss={parser.fight.boss}
              difficulty={parser.fight.difficulty}
              spec={parser.selectedCombatant._combatantInfo.specID}
              duration={parser.fight.end_time - parser.fight.start_time}
              combatant={parser.selectedCombatant}
            />
          </div>
        );
      }
      case TABS.ABOUT: {
        return (
          <div className="container">
            <About config={config} />

            <ResultsChangelogTab changelog={config.changelog} />
          </div>
        );
      }
      default: {
        if (this.isLoading || !results) {
          return this.renderLoadingIndicator();
        }

        const tab = results.tabs.find((tab) => tab.url === selectedTab);

        return (
          <div className="container">
            <ErrorBoundary>{tab ? tab.render() : '404 tab not found'}</ErrorBoundary>
          </div>
        );
      }
    }
  }
  renderLoadingIndicator() {
    const {
      progress,
      isLoadingParser,
      isLoadingEvents,
      bossPhaseEventsLoadingState,
      isLoadingCharacterProfile,
      isLoadingPhases,
      isFilteringEvents,
      parsingState,
    } = this.props;

    return (
      <div className="container" style={{ marginBottom: 40 }}>
        <Panel title="Loading..." className="loading-indicators">
          <LoadingBar progress={progress} style={{ marginBottom: 30 }} />

          <div className="row">
            <div className="col-md-8">Spec analyzer from WoWAnalyzer</div>
            <div className={`col-md-4 ${isLoadingParser ? 'loading' : 'ok'}`}>
              {isLoadingParser ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Player events from Warcraft Logs</div>
            <div className={`col-md-4 ${isLoadingEvents ? 'loading' : 'ok'}`}>
              {isLoadingEvents ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Boss events from Warcraft Logs</div>
            <div
              className={`col-md-4 ${
                bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING
                  ? 'loading'
                  : bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED
                  ? 'skipped'
                  : 'ok'
              }`}
            >
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED && 'Skipped'}
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING && 'Loading...'}
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.DONE && 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Character info from Blizzard</div>
            <div className={`col-md-4 ${isLoadingCharacterProfile ? 'loading' : 'ok'}`}>
              {isLoadingCharacterProfile ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Analyzing phases</div>
            <div className={`col-md-4 ${isLoadingPhases ? 'loading' : 'ok'}`}>
              {isLoadingPhases ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Filtering events</div>
            <div className={`col-md-4 ${isFilteringEvents ? 'loading' : 'ok'}`}>
              {isFilteringEvents ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">Analyzing events</div>
            <div
              className={`col-md-4 ${
                parsingState === EVENT_PARSING_STATE.WAITING
                  ? 'waiting'
                  : parsingState === EVENT_PARSING_STATE.PARSING
                  ? 'loading'
                  : 'ok'
              }`}
            >
              {parsingState === EVENT_PARSING_STATE.WAITING && 'Waiting'}
              {parsingState === EVENT_PARSING_STATE.PARSING && 'Loading...'}
              {parsingState === EVENT_PARSING_STATE.DONE && 'OK'}
            </div>
          </div>
        </Panel>
      </div>
    );
  }
  render() {
    const {
      parser,
      report,
      fight,
      player,
      build,
      characterProfile,
      makeBuildUrl,
      makeTabUrl,
      selectedTab,
      premium,
      handlePhaseSelection,
      selectedPhase,
      selectedInstance,
      phases,
      applyFilter,
      timeFilter,
    } = this.props;
    const config: Config = this.context.config;

    const boss = findByBossId(fight.boss);

    const results = this.isLoading ? null : parser.generateResults(this.state.adjustForDowntime);

    const contributorinfo = (
      <ReadableListing>
        {config.contributors.length !== 0
          ? config.contributors.map((contributor) => (
              <Contributor key={contributor.nickname} {...contributor} />
            ))
          : 'CURRENTLY UNMAINTAINED'}
      </ReadableListing>
    );

    const reportDuration = report.end - report.start;

    return (
      <div className={`results boss-${fight.boss}`}>
        <Header
          config={config}
          name={player.name}
          characterProfile={characterProfile}
          boss={boss}
          fight={fight}
          tabs={results ? results.tabs : []}
          makeTabUrl={makeTabUrl}
          makeBuildUrl={makeBuildUrl}
          selectedTab={selectedTab}
          selectedPhase={selectedPhase}
          selectedInstance={selectedInstance}
          phases={phases}
          handlePhaseSelection={handlePhaseSelection}
          applyFilter={applyFilter}
          build={build}
          isLoading={this.isLoading}
        />

        {fight.end_time > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {parser && parser.disabledModules && (
          <DegradedExperience disabledModules={parser.disabledModules} />
        )}
        {boss && boss.fight.resultsWarning && (
          <div className="container">
            <AlertWarning style={{ marginBottom: 30 }}>{boss.fight.resultsWarning}</AlertWarning>
          </div>
        )}
        {parser && parser.selectedCombatant.gear && (
          <ItemWarning gear={parser.selectedCombatant.gear} />
        )}
        {timeFilter && (
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
        {build && (
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
        {this.renderContent(selectedTab, results)}

        <div className="container" style={{ marginTop: 40 }}>
          <div className="row">
            <div className="col-md-8">
              <small>
                <Trans id="interface.report.results.providedBy">Provided by</Trans>
              </small>
              <div style={{ fontSize: 16 }}>
                <Trans id="interface.report.results.providedByDetails">
                  {config.spec.specName} {config.spec.className} analysis has been provided by{' '}
                  {contributorinfo}. They love hearing what you think, so please let them know!{' '}
                  <Link to={makeTabUrl('about')}>More information about this spec's analyzer.</Link>
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
                  href={makeWclUrl(report.code, {
                    fight: fight.id,
                    source: parser ? parser.playerId : undefined,
                  })}
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
                  href={`https://www.wipefest.net/report/${report.code}/fight/${fight.id}`}
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

        {premium === false && (
          <div className="container" style={{ marginTop: 40 }}>
            <Ad />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, props: RouteComponentProps) => ({
  selectedTab: getResultTab(props.location.pathname),
  premium: hasPremium(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps, {
    appendReportHistory,
  }),
)(Results) as React.ComponentType<PassedProps>;
