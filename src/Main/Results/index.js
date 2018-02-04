import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';
import Textfit from 'react-textfit';

import ChecklistIcon from 'Icons/Checklist';
import SuggestionIcon from 'Icons/Suggestion';
import AboutIcon from 'Icons/About';
import Wrapper from 'common/Wrapper';
import SPEC_ANALYSIS_COMPLETENESS, { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import { getResultTab } from 'selectors/url/report';
import DevelopmentTab from 'Main/DevelopmentTab';
import EventsTab from 'Main/EventsTab';
import Tab from 'Main/Tab';
import Status from 'Main/Status';
import GithubButton from 'Main/GithubButton';
import DiscordButton from 'Main/DiscordButton';
import SuggestionsTab from 'Main/SuggestionsTab';
import Maintainer from 'Main/Maintainer';

import ItemsPanel from './ItemsPanel';
import AboutTab from './AboutTab';
import ResultsWarning from './ResultsWarning';
import Header from './Header';

import './Results.css';

const MAIN_TAB = {
  CHECKLIST: 'Checklist',
  SUGGESTIONS: 'Suggestions',
  ABOUT: 'About',
};
function mainTabLabel(tab) {
  switch (tab) {
    case MAIN_TAB.CHECKLIST:
      return (
        <Wrapper>
          <ChecklistIcon /> Checklist
        </Wrapper>
      );
    case MAIN_TAB.SUGGESTIONS:
      return (
        <Wrapper>
          <SuggestionIcon /> Suggestions
        </Wrapper>
      );
    case MAIN_TAB.ABOUT:
      return (
        <Wrapper>
          <AboutIcon /> About
        </Wrapper>
      );
    default: return tab;
  }
}

class Results extends React.Component {
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
  static propTypes = {
    parser: PropTypes.object.isRequired,
    tab: PropTypes.string,
    onChangeTab: PropTypes.func.isRequired,
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

  renderStatistics(statistics) {
    return (
      <Masonry className="row statistics">
        {statistics
          .filter(statistic => !!statistic) // filter optionals
          .map((statistic, index) => statistic.statistic ? statistic : { statistic, order: index }) // normalize
          .sort((a, b) => a.order - b.order)
          .map((statistic, i) => React.cloneElement(statistic.statistic, {
            key: `${statistic.order}-${i}`,
          }))}
      </Masonry>
    );
  }

  get warning() {
    const parser = this.props.parser;
    const boss = parser.boss;
    if (boss && boss.fight.resultsWarning) {
      return boss.fight.resultsWarning;
    }
    const config = this.context.config;
    if (config.completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED || config.completeness === SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK) {
      return 'The analysis for this spec is still under development. The information shown may be flawed, inaccurate, missing, or incomplete. Contact the spec maintainer for feature requests and bug reports, see the about tab for more information.';
    }
    if (parser.feedbackWarning) {
      return 'This spec is believed to be complete, but needs additional feedback. If there is something missing, incorrect, or inaccurate, please contact this specs maintainer so it can be fixed before being marked as "Good". Contact info can be found in the About Tab.';
    }
    return null;
  }

  render() {
    const { parser, tab, onChangeTab } = this.props;
    const report = parser.report;
    const fight = parser.fight;
    const config = this.context.config;
    const modules = parser._modules;
    const selectedCombatant = modules.combatants.selected;
    if (!selectedCombatant) {
      return (
        <div>
          <h1>
            <div className="back-button">
              <Link to={`/report/${report.code}/${fight.id}`} data-tip="Back to player selection">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden />
              </Link>
            </div>
            Initializing report...
          </h1>

          <div className="spinner" />
        </div>
      );
    }

    const results = parser.generateResults();

    // if (process.env.NODE_ENV === 'development') {
    //   results.tabs.push({
    //     title: 'Development',
    //     url: 'development',
    //     order: 100000,
    //     render: () => (
    //       <DevelopmentTab
    //         parser={parser}
    //         results={results}
    //       />
    //     ),
    //   });
    //   results.tabs.push({
    //     title: 'Events',
    //     url: 'events',
    //     order: 100001,
    //     render: () => (
    //       <EventsTab
    //         parser={parser}
    //       />
    //     ),
    //   });
    //   results.tabs.push({
    //     title: 'Status',
    //     url: 'status',
    //     order: 100002,
    //     render: () => (
    //       <Tab title="Status" style={{ padding: '15px 22px' }}>
    //         <Status />
    //       </Tab>
    //     ),
    //   });
    // }

    const tabUrl = tab || results.tabs[0].url;
    const activeTab = results.tabs.find(tab => tab.url === tabUrl) || results.tabs[0];

    return (
      <div className="container">
        <div className="results">
          <Header spec={config.spec} playerName={selectedCombatant.name} boss={parser.boss} fight={fight} />

          {config.completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED && (
            <Wrapper>
              <div className="alert alert-danger" style={{ fontSize: '1.5em' }}>
                This spec is not actively being maintained. In order to continue providing useful and accurate information we are looking for an active maintainer for this spec. See our GitHub page or join Discord for more information.<br />
                <GithubButton /> <DiscordButton />
              </div>
              <div className="divider" />
            </Wrapper>
          )}

          <div className="row">
            <div className="col-md-4">
              {modules.statsDisplay.render()}
              {modules.talentsDisplay.render()}
              <ItemsPanel items={results.items} selectedCombatant={selectedCombatant} />

              <div>
                <a
                  href={`https://www.warcraftlogs.com/reports/${report.code}/#fight=${fight.id}&source=${parser.playerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 24 }}
                >
                  <span className="glyphicon glyphicon-link" aria-hidden /> View on Warcraft Logs
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
                    {this.state.mainTab === MAIN_TAB.ABOUT && (
                      <AboutTab config={config} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div style={{ border: '7px solid #fff', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>
                    <Textfit mode="single" max={40}>
                    How It's<br />
                    Made
                    </Textfit>
                  </div>
                </div>
                <div className="col-md-8" style={{ fontSize: 20 }}>
                  Curious how we're doing the analysis? Want to change something? You can find this spec's source <a href={`https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/${config.path}`}>here</a> and a guide on contributing <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/tree/master/docs#contributing">here</a>.
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div style={{ border: '7px solid #fff', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>
                    <Textfit mode="single" max={40}>
                      Feedback<br />
                      Welcome
                    </Textfit>
                  </div>
                </div>
                <div className="col-md-8" style={{ fontSize: 20 }}>
                  Do you have a really cool idea? Is a suggestion or checklist threshold off? Spotted a bug? Let us know on <a href="https://discord.gg/AxphPxU">Discord</a>.
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="row">
            <div className="col-md-12">
              {this.renderStatistics(results.statistics)}
            </div>
          </div>

          <div className="divider" />

          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div style={{ border: '7px solid #fff', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
                    <Textfit mode="single" max={32}>
                      Spec<br />
                      Maintainer
                    </Textfit>
                  </div>
                </div>
                <div className="col-md-8 maintainers" style={{ fontSize: 20 }}>
                  The {config.spec.specName} {config.spec.className} analyzer is being maintained by
                  {config.maintainers.map(maintainer => <Maintainer key={maintainer.nickname} {...maintainer} />)}. New maintainers are <b>always</b> welcome.
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div style={{ border: '7px solid #fff', background: 'rgba(0, 0, 0, 0.4)', padding: '8px 14px', fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
                    <Textfit mode="single" max={32}>
                      State Of<br />
                      The Spec
                    </Textfit>
                  </div>
                </div>
                <div className="col-md-8" style={{ fontSize: 20 }}>
                  The {config.spec.specName} {config.spec.className} analyzer is currently considered to be in <dfn data-tip={getCompletenessExplanation(config.completeness)} style={{ color: getCompletenessColor(config.completeness) }}>{getCompletenessLabel(config.completeness)}</dfn> state. The <i>about</i> tab at the top might have more information.
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="panel tabbed" style={{ marginTop: 15, marginBottom: 100 }}>
            <div className="panel-body flex" style={{ flexDirection: 'column', padding: '0' }}>
              <div className="navigation item-divider">
                <div className="flex" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {results.tabs
                    .sort((a, b) => {
                      const aOrder = a.order !== undefined ? a.order : 100;
                      const bOrder = b.order !== undefined ? b.order : 100;

                      return aOrder - bOrder;
                    })
                    .map(tab => (
                      <button
                        key={tab.title}
                        className={activeTab.url === tab.url ? 'btn-link selected' : 'btn-link'}
                        onClick={() => onChangeTab(tab.url)}
                      >
                        {tab.title}
                      </button>
                    ))}
                </div>
              </div>
              <div>
                {activeTab.render()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  tab: getResultTab(state),
});

export default connect(
  mapStateToProps
)(Results);
