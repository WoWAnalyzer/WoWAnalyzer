import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';

import ChecklistIcon from 'Icons/Checklist';
import SuggestionIcon from 'Icons/Suggestion';
import ArmorIcon from 'Icons/Armor';
import StatisticsIcon from 'Icons/Statistics';

import ReadableList from 'common/ReadableList';
import parseVersionString from 'common/parseVersionString';
import Warning from 'common/Alert/Warning';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import { getResultTab } from 'selectors/url/report';
import DevelopmentTab from 'Main/DevelopmentTab';
import EventsTab from 'Main/EventsTab';
import Tab from 'Main/Tab';
import Status from 'Main/Status';
import SuggestionsTab from 'Main/SuggestionsTab';
import ActivityIndicator from 'Main/ActivityIndicator';
import WarcraftLogsLogo from 'Main/Images/WarcraftLogs-logo.png';
import WipefestLogo from 'Main/Images/Wipefest-logo.png';
import Contributor from 'Main/Contributor';
import ItemStatisticBox from 'Main/ItemStatisticBox';

import './Results.css';
import ResultsWarning from './ResultsWarning';
import Header from './Header';
import DetailsTab from './DetailsTab';
import Odyn from './Images/odyn.jpg';

const CURRENT_GAME_PATCH = '8.0.0';

const MAIN_TAB = {
  CHECKLIST: 'Checklist',
  SUGGESTIONS: 'Suggestions',
  CHARACTER: 'Character',
  STATS: 'Stats',
};
function mainTabLabel(tab) {
  switch (tab) {
    case MAIN_TAB.CHECKLIST:
      return (
        <React.Fragment>
          <ChecklistIcon /> Checklist
        </React.Fragment>
      );
    case MAIN_TAB.SUGGESTIONS:
      return (
        <React.Fragment>
          <SuggestionIcon /> Suggestions
        </React.Fragment>
      );
    case MAIN_TAB.CHARACTER:
      return (
        <React.Fragment>
          <ArmorIcon /> CHARACTER
        </React.Fragment>
      );
    case MAIN_TAB.STATS:
      return (
        <React.Fragment>
          <StatisticsIcon /> Statistics
        </React.Fragment>
      );
    default: return tab;
  }
}

class Results extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    selectedDetailsTab: PropTypes.string,
    makeTabUrl: PropTypes.func.isRequired,
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
      mainTab: props.parser._modules.checklist.rules.length === 0 ? MAIN_TAB.SUGGESTIONS : MAIN_TAB.CHECKLIST,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  renderStatistics(statistics, items, selectedCombatant) {
    return (
      <Masonry className="row statistics">
        {statistics
          .filter(statistic => !!statistic) // filter optionals
          .map((statistic, index) => statistic.statistic ? statistic : { statistic, order: index }) // normalize
          .sort((a, b) => a.order - b.order)
          .map((statistic, i) => React.cloneElement(statistic.statistic, {
            key: `${statistic.order}-${i}`,
          }))}

        {items
          .sort((a, b) => {
            // raw elements always rendered last
            if (React.isValidElement(a)) {
              return 1;
            } else if (React.isValidElement(b)) {
              return -1;
            } else if (a.item && b.item) {
              if (a.item.quality === b.item.quality) {
                // Qualities equal = show last added item at bottom
                return a.item.id - b.item.id;
              }
              // Show lowest quality item at bottom
              return a.item.quality < b.item.quality;
            } else if (a.item) {
              return -1;
            } else if (b.item) {
              return 1;
            }
            // Neither is an actual item, sort by id so last added effect is shown at bottom
            if (a.id < b.id) {
              return -1;
            } else if (a.id > b.id) {
              return 1;
            }
            return 0;
          })
          .map(item => {
            if (!item) {
              return null;
            } else if (React.isValidElement(item)) {
              return item;
            }

            const id = item.id || item.item.id;
            const itemDetails = id && selectedCombatant.getItem(id);
            const icon = item.icon || <ItemIcon id={item.item.id} details={itemDetails} />;
            const title = item.title || <ItemLink id={item.item.id} details={itemDetails} icon={false} />;

            return (
              <ItemStatisticBox key={id} icon={icon} value={item.result} label={title} />
            );
          })}
      </Masonry>
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

  renderAbout() {
    const { spec, description, contributors, patchCompatibility } = this.context.config;
    const specPatchCompatibility = parseVersionString(patchCompatibility);
    const latestPatch = parseVersionString(CURRENT_GAME_PATCH);
    const isOutdated = specPatchCompatibility.major < latestPatch.major || specPatchCompatibility.minor < latestPatch.minor || specPatchCompatibility.patch < latestPatch.patch;

    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>About {spec.specName} {spec.className}</h2>
        </div>
        <div className="panel-body">
          {description}

          <div className="row" style={{ marginTop: '1em' }}>
            <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
              Contributor{contributors.length > 1 && 's'}
            </div>
            <div className="col-lg-8">
              <ReadableList>
                {contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />)}
              </ReadableList>
            </div>
          </div>
          <div className="row" style={{ marginTop: '0.5em' }}>
            <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
              Updated for patch
            </div>
            <div className="col-lg-8">
              {patchCompatibility}
            </div>
          </div>
          {isOutdated && (
            <Warning style={{ marginTop: '1em' }}>
              The analysis for this spec is outdated. It may be inaccurate for spells that were changed since patch {patchCompatibility}.
            </Warning>
          )}
        </div>
      </div>
    );
  }
  renderContent() {
    const { parser, selectedDetailsTab, makeTabUrl } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const modules = parser._modules;
    const selectedCombatant = modules.combatants.selected;

    const results = parser.generateResults();

    results.tabs.push({
      title: 'Events',
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
        title: 'Development',
        url: 'development',
        order: 100000,
        render: () => (
          <DevelopmentTab
            parser={parser}
            results={results}
          />
        ),
      });
      results.tabs.push({
        title: 'Status',
        url: 'status',
        order: 100002,
        render: () => (
          <Tab style={{ padding: '15px 22px' }}>
            <Status />
          </Tab>
        ),
      });
    }

    return (
      <div className="break-out">
        <div className="row">
          <div className="col-md-4">
            {this.renderAbout()}

            <div>
              <a
                href={`https://www.warcraftlogs.com/reports/${report.code}/#fight=${fight.id}&source=${parser.playerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 24 }}
                data-tip="View the original report"
              >
                <img src={WarcraftLogsLogo} alt="Warcraft Logs logo" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Warcraft Logs
              </a>
              {' '}
              <a
                href={`https://www.wipefest.net/report/${report.code}/fight/${fight.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 24 }}
                data-tip="View insights and timelines for raid encounters"
              >
                <img src={WipefestLogo} alt="Wipefest logo" style={{ height: '1.4em', marginTop: '-0.15em' }} /> Wipefest
              </a>
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
                        {mainTabLabel(tab)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <ResultsWarning warning={this.warning} />
                  {this.state.mainTab === MAIN_TAB.CHECKLIST && (
                    modules.checklist.render()
                  )}
                  {this.state.mainTab === MAIN_TAB.SUGGESTIONS && (
                    <SuggestionsTab issues={results.issues} />
                  )}
                  {this.state.mainTab === MAIN_TAB.CHARACTER && (
                    modules.characterPanel.render()
                  )}
                  {this.state.mainTab === MAIN_TAB.STATS && (
                    modules.encounterPanel.render()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="row">
          <div className="col-md-12">
            {this.renderStatistics(results.statistics, results.items, selectedCombatant)}
          </div>
        </div>

        <div className="divider" />

        <DetailsTab tabs={results.tabs} selected={selectedDetailsTab} makeTabUrl={makeTabUrl} />
      </div>
    );
  }
  renderLoading() {
    return (
      <div className="loading-text">
        Loading...<br /><br />

        <img src={Odyn} alt="Odyn" style={{ maxWidth: 300 }} />
      </div>
    );
  }

  render() {
    const { parser } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const config = this.context.config;
    const modules = parser._modules;
    const selectedCombatant = modules.combatants.selected;
    if (!selectedCombatant) {
      return (
        <div>
          <div className="back-button">
            <Link to={`/report/${report.code}/${fight.id}`} data-tip="Back to player selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden />
            </Link>
          </div>
          <ActivityIndicator text="Fetching players..." />
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: 100, paddingRight: 100 }}>
        <div className="results">
          <Header config={config} playerName={selectedCombatant.name} boss={parser.boss} fight={fight} />

          {!parser.finished ? this.renderLoading() : this.renderContent()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedDetailsTab: getResultTab(state),
});

export default connect(
  mapStateToProps
)(Results);
