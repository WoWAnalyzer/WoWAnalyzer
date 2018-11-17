import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';
import Toggle from 'react-toggle';
import { Trans, t } from '@lingui/macro';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import makeWclUrl from 'common/makeWclUrl';
import { getResultTab } from 'interface/selectors/url/report';
import { hasPremium } from 'interface/selectors/user';
import ErrorBoundary from 'interface/common/ErrorBoundary';
import Ad from 'interface/common/Ad';
import WipefestLogo from 'interface/images/Wipefest-logo.png';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { i18n } from 'interface/RootLocalizationProvider';
import Combatants from 'parser/shared/modules/Combatants';
import Checklist from 'parser/shared/modules/features/Checklist2/Module';
import CharacterTab from 'parser/shared/modules/features/CharacterTab';
import EncounterPanel from 'parser/shared/modules/features/EncounterPanel';

import FightNavigationBar from '../FightNavigationBar';
import ResultsWarning from './ResultsWarning';
import Header from './Header';
import DetailsTabPanel from './DetailsTabPanel';
import About from './About';
import StatisticsSectionTitle from './StatisticsSectionTitle';
import SuggestionsTab from './SuggestionsTab';
import './Results.css';
import ChangelogTab from 'interface/others/ChangelogTab';

const DevelopmentTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'DevelopmentTab' */ 'interface/others/DevelopmentTab').then(exports => exports.default)));
const EventsTab = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'EventsTab' */ 'interface/others/EventsTab').then(exports => exports.default)));

const MAIN_TAB = {
  CHECKLIST: 'CHECKLIST',
  SUGGESTIONS: 'SUGGESTIONS',
  CHARACTER: 'CHARACTER',
  STATS: 'STATS',
};

class Results extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    selectedTab: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
    premium: PropTypes.bool,
    characterProfile: PropTypes.shape({
      region: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
    }),
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
      mainTab: !props.parser.getModule(Checklist, false) ? MAIN_TAB.SUGGESTIONS : MAIN_TAB.CHECKLIST,
      adjustForDowntime: false,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  renderFightDowntimeToggle() {
    return (
      <div className="toggle-control" style={{ marginTop: 5 }}>
        <Toggle
          defaultChecked={this.state.adjustForDowntime}
          icons={false}
          onChange={event => this.setState({ adjustForDowntime: event.target.checked })}
          id="adjust-for-downtime-toggle"
        />
        <label htmlFor="adjust-for-downtime-toggle">
          <Trans>Adjust statistics for <dfn data-tip={i18n._(t`Fight downtime is any forced downtime caused by fight mechanics or dying. Downtime caused by simply not doing anything is not included.`)}>fight downtime</dfn> (<dfn data-tip={i18n._(t`We're still working out the kinks of this feature, some modules might output weird results with this on. When we're finished this will be enabled by default.`)}>experimental</dfn>)</Trans>
        </label>
      </div>
    );
  }
  renderStatisticGroupName(key) {
    switch (key) {
      case STATISTIC_CATEGORY.GENERAL: return i18n._(t`Statistics`);
      case STATISTIC_CATEGORY.TALENTS: return i18n._(t`Talents`);
      case STATISTIC_CATEGORY.AZERITE_POWERS: return i18n._(t`Azerite Powers`);
      case STATISTIC_CATEGORY.ITEMS: return i18n._(t`Items`);
      default: throw new Error(`Unknown category: ${key}`);
    }
  }
  renderStatistics(statistics) {
    const parser = this.props.parser;

    const groups = statistics.reduce((obj, statistic) => {
      const category = statistic.props.category || STATISTIC_CATEGORY.GENERAL;
      obj[category] = obj[category] || [];
      obj[category].push(statistic);
      return obj;
    }, {});

    return (
      <>
        {Object.keys(groups).map(name => {
          const statistics = groups[name];
          return (
            <React.Fragment key={name}>
              <StatisticsSectionTitle
                rightAddon={name === STATISTIC_CATEGORY.GENERAL && parser.hasDowntime && this.renderFightDowntimeToggle()}
              >
                {this.renderStatisticGroupName(name)}
              </StatisticsSectionTitle>

              <Masonry className="row statistics">
                {statistics.sort((a, b) => a.props.position - b.props.position)}
              </Masonry>
            </React.Fragment>
          );
        })}
      </>
    );
  }

  get warning() {
    const parser = this.props.parser;
    const boss = parser.boss;
    if (boss && boss.fight.resultsWarning) {
      return boss.fight.resultsWarning;
    }
    return null;
  }

  renderChecklist() {
    const parser = this.props.parser;
    const checklist = parser.getModule(Checklist, false);
    return (
      checklist ? (
        checklist.render()
      ) : (
        <div className="item-divider" style={{ padding: '10px 22px' }}>
          <div className="alert alert-danger">
            <Trans>The checklist for this spec is not yet available. We could use your help to add this. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.</Trans>
          </div>
        </div>
      )
    );
  }
  renderContent(selectedTab, results) {
    const { parser } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const characterTab = parser.getModule(CharacterTab);
    const encounterPanel = parser.getModule(EncounterPanel);
    const config = this.context.config;

    switch (selectedTab) {
      case 'checklist':
        return this.renderChecklist();
      case 'suggestions':
        return <SuggestionsTab issues={results.issues} />;
      case 'statistics':
        return this.renderStatistics(results.statistics);
      case 'events':
        return <EventsTab parser={parser} />;
      case 'character':
        return <>{characterTab.render()}{encounterPanel.render()}</>;
      case 'about':
        return <><About config={config} /><ChangelogTab /></>;
      default:
        return results.tabs.find(tab => tab.url === selectedTab).render();
    }
  }
  render() {
    const { parser, characterProfile, makeTabUrl, selectedTab, premium } = this.props;
    const fight = parser.fight;
    const config = this.context.config;
    const combatants = parser.getModule(Combatants);
    const selectedCombatant = combatants.selected;

    const results = parser.generateResults({
      i18n, // TODO: Remove and use singleton
      adjustForDowntime: this.state.adjustForDowntime,
    });

    return (
      <div className="results">
        <Header
          config={config}
          playerName={selectedCombatant.name}
          playerIcon={characterProfile && characterProfile.thumbnail ? `https://render-${characterProfile.region}.worldofwarcraft.com/character/${characterProfile.thumbnail}` : null}
          boss={parser.boss}
          fight={fight}
          makeTabUrl={makeTabUrl}
          selectedTab={selectedTab}
          tabs={results.tabs}
        />

        <div key={this.state.adjustForDowntime}>
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="panel">
                  <div className="panel-body" style={{ padding: 0 }}>
                    {this.renderContent(selectedTab, results)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!premium && (
            <div className="text-center" style={{ marginTop: 40, marginBottom: -40 }}>
              <Ad format="leaderboard" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedTab: getResultTab(state) || 'checklist',
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Results);
