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
import { getResultTab } from 'interface/selectors/url/report';
import { hasPremium } from 'interface/selectors/user';
import ErrorBoundary from 'interface/common/ErrorBoundary';
import Warning from 'interface/common/Alert/Warning';
import Ad from 'interface/common/Ad';
import ReadableList from 'interface/common/ReadableList';
import Contributor from 'interface/contributor/Button';
import WipefestLogo from 'interface/images/Wipefest-logo.png';
import { i18n } from 'interface/RootLocalizationProvider';
import LoadingBar from 'interface/layout/NavigationBar/LoadingBar';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import StatTracker from 'parser/shared/modules/StatTracker';

import ChangelogTab from 'interface/others/ChangelogTab';
import Header from './Header';
import About from './About';
import Overview from './Overview';
import Statistics from './Statistics';
import Character from './Character';
import EncounterStats from './EncounterStats';
import './Results.scss';

// Gone for now, reintroduce if we can make it useful
// const DevelopmentTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'DevelopmentTab' */ 'interface/others/DevelopmentTab').then(exports => exports.default)));
const TimelineTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'TimelineTab' */ './Timeline/Container').then(exports => exports.default)));
const EventsTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'EventsTab' */ 'interface/others/EventsTab').then(exports => exports.default)));

const CORE_TABS = {
  OVERVIEW: 'overview',
  STATISTICS: 'statistics',
  TIMELINE: 'timeline',
  CHARACTER: 'character',
  EVENTS: 'events',
  ABOUT: 'about',
};

class Results extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.shape({
    }),
    characterProfile: PropTypes.object,
    selectedTab: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    isLoadingParser: PropTypes.bool,
    isLoadingEvents: PropTypes.bool,
    isLoadingBossPhaseEvents: PropTypes.bool,
    isLoadingCharacterProfile: PropTypes.bool,
    isParsingEvents: PropTypes.bool,
    progress: PropTypes.number,
    premium: PropTypes.bool,
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
    window.scrollTo(0, 0);
  }
  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.props.selectedTab !== prevProps.selectedTab) {
      // TODO: To improve user experience we could try to avoid scrolling when the header is still within vision.
      window.scrollTo(0, 0);
    }
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
      || this.props.isLoadingBossPhaseEvents
      || this.props.isLoadingCharacterProfile
      || this.props.isParsingEvents;
  }

  renderContent(selectedTab, results) {
    const { parser } = this.props;

    switch (selectedTab) {
      case CORE_TABS.OVERVIEW: {
        const checklist = parser.getModule(Checklist, false);
        return (
          <Overview
            checklist={checklist && checklist.render()}
            issues={results.issues}
          />
        );
      }
      case CORE_TABS.STATISTICS:
        return (
          <Statistics parser={parser}>{results.statistics}</Statistics>
        );
      case CORE_TABS.TIMELINE:
        return (
          <TimelineTab parser={parser} />
        );
      case CORE_TABS.EVENTS:
        return (
          <div className="container">
            <EventsTab parser={parser} />
          </div>
        );
      case CORE_TABS.CHARACTER: {
        const statTracker = parser.getModule(StatTracker);

        return (
          <div className="container">
            <Character
              statTracker={statTracker}
              combatant={parser.selectedCombatant}
            />
            <EncounterStats
              currentBoss={parser.fight.boss}
              difficulty={parser.fight.difficulty}
              spec={parser.selectedCombatant._combatantInfo.specID}
              duration={parser.fight.end_time - parser.fight.start_time}
            />
          </div>
        );
      }
      case CORE_TABS.ABOUT: {
        const config = this.context.config;
        return (
          <div className="container">
            <About config={config} />
            <ChangelogTab />
          </div>
        );
      }
      default:
        return (
          <div className="container">
            {results.tabs.find(tab => tab.url === selectedTab).render()}
          </div>
        );
    }
  }
  render() {
    const { parser, report, fight, player, characterProfile, makeTabUrl, selectedTab, premium, progress } = this.props;
    const config = this.context.config;

    const boss = findByBossId(fight.boss);

    const results = !this.isLoading && parser.generateResults({
      i18n, // TODO: Remove and use singleton
      adjustForDowntime: this.state.adjustForDowntime,
    });

    const contributorinfo = <ReadableList>{(config.contributors.length !== 0) ? config.contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />) : 'CURRENTLY UNMAINTAINED'}</ReadableList>;

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
          selectedTab={selectedTab}
        />

        {boss && boss.fight.resultsWarning && (
          <div className="container">
            <Warning style={{ marginBottom: 30 }}>
              {boss.fight.resultsWarning}
            </Warning>
          </div>
        )}

        {this.isLoading && (
          <div className="container" style={{ marginBottom: 40 }}>
            <LoadingBar progress={progress} />

            <div>
              Loading spec analyzer...........{!this.props.isLoadingParser && 'OK'}
            </div>
            <div>
              Loading events for player.......{!this.props.isLoadingEvents && 'OK'}
            </div>
            <div>
              Loading phase events............{!this.props.isLoadingBossPhaseEvents && 'OK'}
            </div>
            <div>
              Loading character info..........{!this.props.isLoadingCharacterProfile && 'OK'}
            </div>
            <div>
              Analyzing events................{!this.props.isParsingEvents && 'OK'}
            </div>
          </div>
        )}

        {!this.isLoading && this.renderContent(selectedTab, results)}

        {premium === false && (
          <div className="container text-center" style={{ marginTop: 40 }}>
            <Ad />
          </div>
        )}

        <div className="container" style={{ marginTop: 40 }}>
          <div className="row">
            <div className="col-md-8">
              <small>Provided by</small>
              <div style={{ fontSize: 16 }}>
                <Trans>{config.spec.specName} {config.spec.className} analysis has been provided by {contributorinfo}. They love hearing what you think, so please let them know! <Link to={makeTabUrl('about')}>More information about this spec's analyzer.</Link></Trans>
              </div>
            </div>
            <div className="col-md-4">
              <small>View on</small><br />
              <Tooltip content={i18n._(t`Opens in a new tab. View the original report.`)}>
                <a
                  href={makeWclUrl(report.code, { fight: fight.id, source: parser ? parser.playerId : undefined })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 24, padding: '6px 0' }}
                >
                  <img src="/img/wcl.png" alt="" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Warcraft Logs
                </a>
              </Tooltip><br />
              <Tooltip content={i18n._(t`Opens in a new tab. View insights and timelines for raid encounters.`)}>
                <a
                  href={`https://www.wipefest.net/report/${report.code}/fight/${fight.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 24, padding: '6px 0' }}
                >
                  <img src={WipefestLogo} alt="" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Wipefest
                </a>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedTab: getResultTab(state) || CORE_TABS.OVERVIEW,
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Results);
