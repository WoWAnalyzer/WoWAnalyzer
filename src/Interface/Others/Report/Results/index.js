import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';
import Toggle from 'react-toggle';
import { withI18n, Trans } from '@lingui/react';

import ChecklistIcon from 'Interface/Icons/Checklist';
import SuggestionIcon from 'Interface/Icons/Suggestion';
import ArmorIcon from 'Interface/Icons/Armor';
import StatisticsIcon from 'Interface/Icons/Statistics';

import lazyLoadComponent from 'common/lazyLoadComponent';
import makeWclUrl from 'common/makeWclUrl';
import { getResultTab } from 'Interface/selectors/url/report';
import { hasPremium } from 'Interface/selectors/user';
import ErrorBoundary from 'Interface/common/ErrorBoundary';
import ActivityIndicator from 'Interface/common/ActivityIndicator';
import Ad from 'Interface/common/Ad';
import WipefestLogo from 'Interface/Images/Wipefest-logo.png';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';

import ResultsWarning from './ResultsWarning';
import Header from './Header';
import DetailsTab from './DetailsTab';
import About from './About';
import StatisticsSectionTitle from './StatisticsSectionTitle';
import Odyn from './Images/odyn.jpg';
import SuggestionsTab from './SuggestionsTab';
import './Results.css';

const DevelopmentTab = lazyLoadComponent(() => import(/* webpackChunkName: 'DevelopmentTab' */ 'Interface/Others/DevelopmentTab').then(exports => exports.default));
const EventsTab = lazyLoadComponent(() => import(/* webpackChunkName: 'EventsTab' */ 'Interface/Others/EventsTab').then(exports => exports.default));

const MAIN_TAB = {
  CHECKLIST: 'CHECKLIST',
  SUGGESTIONS: 'SUGGESTIONS',
  CHARACTER: 'CHARACTER',
  STATS: 'STATS',
};

class Results extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    selectedDetailsTab: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
    i18n: PropTypes.object.isRequired,
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
      mainTab: !props.parser._modules.checklist ? MAIN_TAB.SUGGESTIONS : MAIN_TAB.CHECKLIST,
      adjustForDowntime: false,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  renderMainTabLabel(tab) {
    switch (tab) {
      case MAIN_TAB.CHECKLIST:
        return (
          <React.Fragment>
            <ChecklistIcon /> <Trans>Checklist</Trans>
          </React.Fragment>
        );
      case MAIN_TAB.SUGGESTIONS:
        return (
          <React.Fragment>
            <SuggestionIcon /> <Trans>Suggestions</Trans>
          </React.Fragment>
        );
      case MAIN_TAB.CHARACTER:
        return (
          <React.Fragment>
            <ArmorIcon /> <Trans>Character</Trans>
          </React.Fragment>
        );
      case MAIN_TAB.STATS:
        return (
          <React.Fragment>
            <StatisticsIcon /> <Trans>Statistics</Trans>
          </React.Fragment>
        );
      default: return tab;
    }
  }
  renderFightDowntimeToggle() {
    const { i18n } = this.props;

    return (
      <div className="toggle-control" style={{ marginTop: 5 }}>
        <Toggle
          defaultChecked={this.state.adjustForDowntime}
          icons={false}
          onChange={event => this.setState({ adjustForDowntime: event.target.checked })}
          id="adjust-for-downtime-toggle"
        />
        <label htmlFor="adjust-for-downtime-toggle">
          <Trans>Adjust statistics for <dfn data-tip={i18n.t`Fight downtime is any forced downtime caused by fight mechanics or dying. Downtime caused by simply not doing anything is not included.`}>fight downtime</dfn> (<dfn data-tip={i18n.t`We're still working out the kinks of this feature, some modules might output weird results with this on. When we're finished this will be enabled by default.`}>experimental</dfn>)</Trans>
        </label>
      </div>
    );
  }
  renderStatistics(statistics) {
    const parser = this.props.parser;

    const groups = statistics.reduce((obj, statistic) => {
      const category = statistic.props.category || 'Statistics';
      obj[category] = obj[category] || [];
      obj[category].push(statistic);
      return obj;
    }, {});

    return (
      <React.Fragment>
        {Object.keys(groups).map(name => {
          const statistics = groups[name];
          return (
            <React.Fragment key={name}>
              <StatisticsSectionTitle
                rightAddon={name === STATISTIC_CATEGORY.GENERAL && parser.hasDowntime && this.renderFightDowntimeToggle()}
              >
                {name}
              </StatisticsSectionTitle>

              <Masonry className="row statistics">
                {statistics.sort((a, b) => a.props.position - b.props.position)}
              </Masonry>
            </React.Fragment>
          );
        })}
      </React.Fragment>
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
    const modules = parser._modules;
    return (
      modules.checklist ? (
        modules.checklist.render()
      ) : (
        <div className="item-divider" style={{ padding: '10px 22px' }}>
          <div className="alert alert-danger">
            The checklist for this spec is not yet available. We could use your help to add this. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
          </div>
        </div>
      )
    );
  }
  renderContent() {
    const { parser, selectedDetailsTab, makeTabUrl, i18n, premium, characterProfile } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const modules = parser._modules;
    const config = this.context.config;

    const results = parser.generateResults({
      i18n,
      adjustForDowntime: this.state.adjustForDowntime,
    });

    results.tabs.push({
      title: i18n.t`Events`,
      url: 'events',
      order: 99999,
      render: () => (
        <EventsTab
          parser={parser}
        />
      ),
    });
    if (process.env.NODE_ENV === 'development') {
      results.tabs.push({
        title: i18n.t`Development`,
        url: 'development',
        order: 100000,
        render: () => (
          <DevelopmentTab
            parser={parser}
            results={results}
          />
        ),
      });
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-4">
            <About config={config} />

            <div>
              <a
                href={makeWclUrl(report.code, { fight: fight.id, source: parser.playerId })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 24 }}
                data-tip={i18n.t`View the original report`}
              >
                <img src="/img/wcl.png" alt="Warcraft Logs logo" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Warcraft Logs
              </a>
              {' '}
              <a
                href={`https://www.wipefest.net/report/${report.code}/fight/${fight.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 24 }}
                data-tip={i18n.t`View insights and timelines for raid encounters`}
              >
                <img src={WipefestLogo} alt="Wipefest logo" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Wipefest
              </a>
              {' '}
              {characterProfile && characterProfile.realm && characterProfile.name && characterProfile.region && (
                <Link 
                  to={`/character/${characterProfile.region.toUpperCase()}/${characterProfile.realm}/${characterProfile.name}/`} 
                  data-tip={`View ${characterProfile.realm} - ${characterProfile.name}'s most recent reports`}
                  className="btn"
                  style={{ fontSize: 24 }}
                >
                  <img src="/favicon.png" alt="WoWAnalyzer logo" style={{ height: '1.4em', marginTop: '-0.15em' }} /> {characterProfile.name}
                </Link>
              )}
            </div>
          </div>
          <div className="col-md-8">
            <div className="panel tabbed">
              <div className="panel-body flex" style={{ flexDirection: 'column', padding: '0' }}>
                <div className="navigation item-divider">
                  <div className="flex" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Object.values(MAIN_TAB).map(tab => (
                      <button
                        key={tab}
                        className={this.state.mainTab === tab ? 'btn-link selected' : 'btn-link'}
                        onClick={() => {
                          this.setState({
                            mainTab: tab,
                          });
                        }}
                      >
                        {this.renderMainTabLabel(tab)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <ResultsWarning warning={this.warning} />
                  <ErrorBoundary>
                    {this.state.mainTab === MAIN_TAB.CHECKLIST && this.renderChecklist()}
                    {this.state.mainTab === MAIN_TAB.SUGGESTIONS && <SuggestionsTab issues={results.issues} />}
                    {this.state.mainTab === MAIN_TAB.CHARACTER && modules.characterTab.render()}
                    {this.state.mainTab === MAIN_TAB.STATS && modules.encounterPanel.render()}
                  </ErrorBoundary>
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

        {this.renderStatistics(results.statistics)}

        {!premium && (
          <div className="text-center" style={{ marginTop: 40, marginBottom: -40 }}>
            <Ad format="leaderboard" />
          </div>
        )}

        <StatisticsSectionTitle>
          <Trans>Details</Trans>
        </StatisticsSectionTitle>

        <DetailsTab tabs={results.tabs} selected={selectedDetailsTab} makeTabUrl={makeTabUrl} />
      </div>
    );
  }
  renderLoading() {
    return (
      <div className="loading-text">
        <Trans>Loading...</Trans><br /><br />

        <img src={Odyn} alt="Odyn" style={{ maxWidth: 300 }} />
      </div>
    );
  }

  render() {
    const { parser, i18n, characterProfile } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const config = this.context.config;
    const modules = parser._modules;
    const selectedCombatant = modules.combatants.selected;

    if (!selectedCombatant) {
      return (
        <div>
          <div className="back-button">
            <Link to={`/report/${report.code}/${fight.id}`} data-tip={i18n.t`Back to player selection`}>
              <span className="glyphicon glyphicon-chevron-left" aria-hidden />
            </Link>
          </div>

          <ActivityIndicator text={i18n.t`Fetching players...`} />
        </div>
      );
    }

    return (
      <div className="results" style={{ minHeight: !parser.finished ? 5000 : undefined }}>{/* while loading we want to jump the scroll position from out last position as little as possible */}
        <Header
          config={config}
          playerName={selectedCombatant.name}
          playerIcon={characterProfile && characterProfile.thumbnail ? `https://render-${characterProfile.region}.worldofwarcraft.com/character/${characterProfile.thumbnail}` : null}
          boss={parser.boss}
          fight={fight}
        />

        {!parser.finished ? this.renderLoading() : this.renderContent()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedDetailsTab: getResultTab(state),
  premium: hasPremium(state),
});

export default compose(
  withI18n(),
  connect(
    mapStateToProps
  )
)(Results);
