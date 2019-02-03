import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans, t } from '@lingui/macro';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import makeWclUrl from 'common/makeWclUrl';
import { getResultTab } from 'interface/selectors/url/report';
import { hasPremium } from 'interface/selectors/user';
import ErrorBoundary from 'interface/common/ErrorBoundary';
import Ad from 'interface/common/Ad';
import WipefestLogo from 'interface/images/Wipefest-logo.png';
import { i18n } from 'interface/RootLocalizationProvider';
import Combatants from 'parser/shared/modules/Combatants';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import CharacterTab from 'parser/shared/modules/features/CharacterTab';
import EncounterPanel from 'parser/shared/modules/features/EncounterPanel';

import ChangelogTab from 'interface/others/ChangelogTab';
import ResultsWarning from './ResultsWarning';
import Header from './Header';
import About from './About';
import Overview from './Overview';
import Statistics from './Statistics';
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
    parser: PropTypes.object.isRequired,
    selectedTab: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
    premium: PropTypes.bool,
    characterProfile: PropTypes.object,
  };
  static childContextTypes = {
    updateResults: PropTypes.func.isRequired,
    parser: PropTypes.object.isRequired,
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

  get warning() {
    const parser = this.props.parser;
    const boss = parser.boss;
    if (boss && boss.fight.resultsWarning) {
      return boss.fight.resultsWarning;
    }
    return null;
  }

  renderContent(selectedTab, results) {
    const { parser } = this.props;
    const characterTab = parser.getModule(CharacterTab);
    const encounterPanel = parser.getModule(EncounterPanel);
    const config = this.context.config;

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
      case CORE_TABS.CHARACTER:
        return (
          <div className="container">
            {characterTab.render()}
            {encounterPanel.render()}
          </div>
        );
      case CORE_TABS.ABOUT:
        return (
          <div className="container">
            <About config={config} />
            <ChangelogTab />
          </div>
        );
      default:
        return (
          <div className="container">
            {results.tabs.find(tab => tab.url === selectedTab).render()}
          </div>
        );
    }
  }
  render() {
    const { parser, makeTabUrl, characterProfile, selectedTab, premium } = this.props;
    const fight = parser.fight;
    const config = this.context.config;
    const combatants = parser.getModule(Combatants);
    const selectedCombatant = combatants.selected;

    const results = parser.generateResults({
      i18n, // TODO: Remove and use singleton
      adjustForDowntime: this.state.adjustForDowntime,
    });

    return (
      <div className={`results boss-${fight.boss}`}>
        <Header
          config={config}
          selectedCombatant={selectedCombatant}
          characterProfile={characterProfile}
          boss={parser.boss}
          fight={fight}
          tabs={results.tabs}
          makeTabUrl={makeTabUrl}
          selectedTab={selectedTab}
        />

        {this.renderContent(selectedTab, results)}

        {premium === false && (
          <div className="text-center" style={{ marginTop: 40 }}>
            <Ad format="leaderboard" />
          </div>
        )}
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
