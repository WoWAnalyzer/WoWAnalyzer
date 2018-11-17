import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
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
import Checklist from 'parser/shared/modules/features/Checklist2/Module';
import CharacterTab from 'parser/shared/modules/features/CharacterTab';
import EncounterPanel from 'parser/shared/modules/features/EncounterPanel';

import ChangelogTab from 'interface/others/ChangelogTab';
import ResultsWarning from './ResultsWarning';
import Header from './Header';
import About from './About';
import SuggestionsTab from './SuggestionsTab';
import Statistics from './Statistics';
import './Results.css';

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
    const characterTab = parser.getModule(CharacterTab);
    const encounterPanel = parser.getModule(EncounterPanel);
    const config = this.context.config;

    switch (selectedTab) {
      case 'checklist':
        return this.renderChecklist();
      case 'suggestions':
        return <SuggestionsTab issues={results.issues} />;
      case 'statistics':
        return <Statistics parser={parser}>{results.statistics}</Statistics>;
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
      <div className={`results boss-${fight.boss}`}>
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
