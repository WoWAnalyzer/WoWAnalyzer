import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import { findByBossId } from 'raids';
import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import makeWclUrl from 'common/makeWclUrl';
import Tooltip from 'common/Tooltip';
import getFightName from 'common/getFightName';
import REPORT_HISTORY_TYPES from 'interface/home/ReportHistory/REPORT_HISTORY_TYPES';
import { appendReportHistory } from 'interface/actions/reportHistory';
import { getResultTab } from 'interface/selectors/url/report';
import { hasPremium } from 'interface/selectors/user';
import Warning from 'interface/Alert/Warning';
import Ad from 'interface/common/Ad';
import ReadableListing from 'interface/ReadableListing';
import Contributor from 'interface/ContributorButton';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import WipefestIcon from 'interface/icons/Wipefest';
import { i18n } from 'interface/RootLocalizationProvider';
import LoadingBar from 'interface/layout/NavigationBar/LoadingBar';
import Panel from 'interface/others/Panel';
import ErrorBoundary from 'interface/common/ErrorBoundary';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import StatTracker from 'parser/shared/modules/StatTracker';
import ResultsChangelogTab from 'interface/ResultsChangelogTab';

import './Results.scss';
import Header from './Header';
import About from './About';
import Overview from './Overview';
import Statistics from './Statistics';
import Character from './Character';
import EncounterStats from './EncounterStats';
import DegradedExperience from './DegradedExperience';
import ItemWarning from './ItemWarning';
import EVENT_PARSING_STATE from '../EVENT_PARSING_STATE';
import BOSS_PHASES_STATE from '../BOSS_PHASES_STATE';
import ReportDurationWarning, { MAX_REPORT_DURATION } from '../ReportDurationWarning';
import ScrollToTop from './ScrollToTop';
import TABS from './TABS';

const TimelineTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'TimelineTab' */ './Timeline/Container').then(exports => exports.default)), 0);
const EventsTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'EventsTab' */ 'interface/others/EventsTab').then(exports => exports.default)));

class Results extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.shape({
      boss: PropTypes.shape({
        fight: PropTypes.shape({
          resultsWarning: PropTypes.any,
        }),
      }),
      getOptionalModule: PropTypes.func.isRequired,
      getModule: PropTypes.func.isRequired,
      selectedCombatant: PropTypes.any,
      fight: PropTypes.shape({
        boss: PropTypes.any,
        difficulty: PropTypes.any,
        start_time: PropTypes.any,
        end_time: PropTypes.any,
      }),
      generateResults: PropTypes.func.isRequired,
      disabledModules: PropTypes.any,
      playerId: PropTypes.any,
    }),
    characterProfile: PropTypes.object,
    selectedTab: PropTypes.string,
    makeBuildUrl: PropTypes.func.isRequired,
    makeTabUrl: PropTypes.func.isRequired,
    phases: PropTypes.object,
    selectedPhase: PropTypes.string.isRequired,
    selectedInstance: PropTypes.number.isRequired,
    handlePhaseSelection: PropTypes.func.isRequired,
    applyFilter: PropTypes.func.isRequired,
    timeFilter: PropTypes.object,
    build: PropTypes.string,
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      id: PropTypes.number.isRequired,
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      offset_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
      phase: PropTypes.string,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    isLoadingParser: PropTypes.bool,
    isLoadingEvents: PropTypes.bool,
    isLoadingPhases: PropTypes.bool,
    isFilteringEvents: PropTypes.bool,
    bossPhaseEventsLoadingState: PropTypes.oneOf(Object.values(BOSS_PHASES_STATE)),
    isLoadingCharacterProfile: PropTypes.bool,
    parsingState: PropTypes.oneOf(Object.values(EVENT_PARSING_STATE)),
    progress: PropTypes.number,
    premium: PropTypes.bool,
    appendReportHistory: PropTypes.func.isRequired,
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

  constructor(props) {
    super(props);
    this.state = {
      adjustForDowntime: false,
    };
  }

  componentDidMount() {
    this.scrollToTop();
    this.appendHistory(this.props.report, this.props.fight, this.props.player);
  }
  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props.selectedTab !== prevProps.selectedTab) {
      // TODO: To improve user experience we could try to avoid scrolling when the header is still within vision.
      this.scrollToTop();
    }
  }
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  appendHistory(report, fight, player) {
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
    return this.props.isLoadingParser
      || this.props.isLoadingEvents
      || this.props.bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING
      || this.props.isLoadingCharacterProfile
      || this.props.isLoadingPhases
      || this.props.isFilteringEvents
      || this.props.parsingState !== EVENT_PARSING_STATE.DONE;
  }

  renderContent(selectedTab, results) {
    const { parser, premium } = this.props;

    switch (selectedTab) {
      case TABS.OVERVIEW: {
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        const checklist = parser.getOptionalModule(Checklist);
        return (
          <Overview
            checklist={checklist && checklist.render()}
            issues={results.issues}
          />
        );
      }
      case TABS.STATISTICS:
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        return (
          <Statistics parser={parser}>{results.statistics}</Statistics>
        );
      case TABS.TIMELINE:
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }
        return (
          <TimelineTab parser={parser} />
        );
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
            <Character
              statTracker={statTracker}
              combatant={parser.selectedCombatant}
            />

            {premium === false && (
              <div style={{ margin: '40px 0' }}>
                <Ad />
              </div>
            )}

            <EncounterStats
              currentBoss={parser.fight.boss}
              difficulty={parser.fight.difficulty}
              spec={parser.selectedCombatant._combatantInfo.specID}
              duration={parser.fight.end_time - parser.fight.start_time}
            />
          </div>
        );
      }
      case TABS.ABOUT: {
        const config = this.context.config;
        return (
          <div className="container">
            <About config={config} />

            <ResultsChangelogTab changelog={config.changelog} />
          </div>
        );
      }
      default: {
        if (this.isLoading) {
          return this.renderLoadingIndicator();
        }

        const tab = results.tabs.find(tab => tab.url === selectedTab);

        return (
          <div className="container">
            <ErrorBoundary>
              {tab ? tab.render() : '404 tab not found'}
            </ErrorBoundary>
          </div>
        );
      }
    }
  }
  renderLoadingIndicator() {
    const { progress, isLoadingParser, isLoadingEvents, bossPhaseEventsLoadingState, isLoadingCharacterProfile, isLoadingPhases, isFilteringEvents, parsingState } = this.props;

    return (
      <div className="container" style={{ marginBottom: 40 }}>
        <Panel
          title="Loading..."
          className="loading-indicators"
        >
          <LoadingBar progress={progress} style={{ marginBottom: 30 }} />

          <div className="row">
            <div className="col-md-8">
              Spec analyzer from WoWAnalyzer
            </div>
            <div className={`col-md-4 ${isLoadingParser ? 'loading' : 'ok'}`}>
              {isLoadingParser ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Player events from Warcraft Logs
            </div>
            <div className={`col-md-4 ${isLoadingEvents ? 'loading' : 'ok'}`}>
              {isLoadingEvents ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Boss events from Warcraft Logs
            </div>
            <div className={`col-md-4 ${bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING ? 'loading' : (bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED ? 'skipped' : 'ok')}`}>
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED && 'Skipped'}
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING && 'Loading...'}
              {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.DONE && 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Character info from Blizzard
            </div>
            <div className={`col-md-4 ${isLoadingCharacterProfile ? 'loading' : 'ok'}`}>
              {isLoadingCharacterProfile ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Analyzing phases
            </div>
            <div className={`col-md-4 ${isLoadingPhases ? 'loading' : 'ok'}`}>
              {isLoadingPhases ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Filtering events
            </div>
            <div className={`col-md-4 ${isFilteringEvents ? 'loading' : 'ok'}`}>
              {isFilteringEvents ? 'Loading...' : 'OK'}
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              Analyzing events
            </div>
            <div className={`col-md-4 ${parsingState === EVENT_PARSING_STATE.WAITING ? 'waiting' : (parsingState === EVENT_PARSING_STATE.PARSING ? 'loading' : 'ok')}`}>
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
    const { parser, report, fight, player, build, characterProfile, makeBuildUrl, makeTabUrl, selectedTab, premium, handlePhaseSelection, selectedPhase, selectedInstance, phases, applyFilter, timeFilter } = this.props;
    const config = this.context.config;

    const boss = findByBossId(fight.boss);

    const results = !this.isLoading && parser.generateResults(this.state.adjustForDowntime);

    const contributorinfo = <ReadableListing>{(config.contributors.length !== 0) ? config.contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />) : 'CURRENTLY UNMAINTAINED'}</ReadableListing>;

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

        {fight.end_time > MAX_REPORT_DURATION &&
        <ReportDurationWarning duration={reportDuration} />}

        {parser && parser.disabledModules && <DegradedExperience disabledModules={parser.disabledModules} />}
        {boss && boss.fight.resultsWarning && (
          <div className="container">
            <Warning style={{ marginBottom: 30 }}>
              {boss.fight.resultsWarning}
            </Warning>
          </div>
        )}
        {parser && parser.selectedCombatant.gear && <ItemWarning gear={parser.selectedCombatant.gear} />}
        {timeFilter && (
          <div className="container">
            <Warning style={{ marginBottom: 30 }}>
              These results are filtered to the selected time period. Time filtered results are under development and may not be entirely accurate. <br /> Please report any issues you may find on our GitHub or Discord.
            </Warning>
          </div>
        )}
        {build && (
          <div className="container">
            <Warning style={{ marginBottom: 30 }}>
              These results are analyzed under build different from the standard build. While this will make some modules more accurate, some may also not provide the information you expect them to. <br /> Please report any issues you may find on our GitHub or Discord.
            </Warning>
          </div>
        )}
        {this.renderContent(selectedTab, results)}

        <div className="container" style={{ marginTop: 40 }}>
          <div className="row">
            <div className="col-md-8">
              <small>Provided by</small>
              <div style={{ fontSize: 16 }}>
                <Trans>{config.spec.specName} {config.spec.className} analysis has been provided by {contributorinfo}. They love hearing what you think, so please let them know! <Link to={makeTabUrl('about')}>More information about this spec's analyzer.</Link></Trans>
              </div>
            </div>
            <div className="col-md-3">
              <small>View on</small><br />
              <Tooltip content={i18n._(t`Opens in a new tab. View the original report.`)}>
                <a
                  href={makeWclUrl(report.code, { fight: fight.id, source: parser ? parser.playerId : undefined })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 20, padding: '6px 0' }}
                >
                  <WarcraftLogsIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Warcraft Logs
                </a>
              </Tooltip><br />
              <Tooltip content={i18n._(t`Opens in a new tab. View insights and timelines for raid encounters.`)}>
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
              <Tooltip content={<Trans>Scroll back to the top.</Trans>}>
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

const mapStateToProps = state => ({
  selectedTab: getResultTab(state),
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps,
  {
    appendReportHistory,
  },
)(Results);
