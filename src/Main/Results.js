import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';

import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import getBossName from 'common/getBossName';
import { getCompletenessColor, getCompletenessExplanation, getCompletenessLabel } from 'common/SPEC_ANALYSIS_COMPLETENESS';
import { getResultTab } from 'selectors/url/report';
import DevelopmentTab from 'Main/DevelopmentTab';
import EventsTab from 'Main/EventsTab';
import Tab from 'Main/Tab';
import Status from 'Main/Status';
import GithubButton from 'Main/GithubButton';
import DiscordButton from 'Main/DiscordButton';

import SpecInformationOverlay from './SpecInformationOverlay';

import './Results.css';
import SPEC_ANALYSIS_COMPLETENESS from "../common/SPEC_ANALYSIS_COMPLETENESS";

class Results extends React.Component {
  static childContextTypes = {
    updateResults: PropTypes.func.isRequired,
  };
  getChildContext() {
    return {
      updateResults: this.forceUpdate.bind(this),
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

  constructor() {
    super();
    this.state = {
      showSpecInformationOverlay: false,
    };
    this.handleClickViewSpecInformation = this.handleClickViewSpecInformation.bind(this);
    this.handleSpecInformationCloseClick = this.handleSpecInformationCloseClick.bind(this);
  }
  handleClickViewSpecInformation() {
    this.setState({
      showSpecInformationOverlay: true,
    });
  }
  handleSpecInformationCloseClick() {
    this.setState({
      showSpecInformationOverlay: false,
    });
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
  renderItems(items, selectedCombatant) {
    return (
      <div className="panel items">
        <div className="panel-heading">
          <h2><dfn data-tip="The values shown are only for the special equip effects of the items. The passive gain from the stats is <b>not</b> included.">Items</dfn>
          </h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ul className="list">
            {items.length === 0 && (
              <li className="item clearfix" style={{ paddingTop: 20, paddingBottom: 20 }}>
                No noteworthy items.
              </li>
            )}
            {
              items
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
                .map((item) => {
                  if (!item) {
                    return null;
                  } else if (React.isValidElement(item)) {
                    return item;
                  }

                  const id = item.id || item.item.id;
                  const itemDetails = id && selectedCombatant.getItem(id);
                  const icon = item.icon || <ItemIcon id={item.item.id} details={itemDetails} />;
                  const title = item.title || <ItemLink id={item.item.id} details={itemDetails} />;

                  return (
                    <li className="item clearfix" key={id}>
                      <article>
                        <figure>
                          {icon}
                        </figure>
                        <div>
                          <header>
                            {title}
                          </header>
                          <main>
                            {item.result}
                          </main>
                        </div>
                      </article>
                    </li>
                  );
                })
            }
          </ul>
        </div>
      </div>
    );
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
        title: 'Events',
        url: 'events',
        order: 100001,
        render: () => (
          <EventsTab
            parser={parser}
          />
        ),
      });
      results.tabs.push({
        title: 'Status',
        url: 'status',
        order: 100002,
        render: () => (
          <Tab title="Status" style={{ padding: '15px 22px' }}>
            <Status />
          </Tab>
        ),
      });
    }

    const tabUrl = tab || results.tabs[0].url;
    const activeTab = results.tabs.find(tab => tab.url === tabUrl);

    return (
      <div style={{ width: '100%' }}>
        <div className="results">
          <div className="row">
            <div className="col-lg-10 col-md-8" style={{ position: 'relative' }}>
              <div className="back-button" style={{ fontSize: 36, width: 20 }}>
                <Link to={`/report/${report.code}/${fight.id}`} data-tip="Back to player selection">
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden />
                </Link>
              </div>
              <h1 style={{ marginBottom: 0, fontSize: 48, textTransform: 'none', fontVariant: 'none' }}>
                {getBossName(fight)} by <span className={config.spec.className.replace(' ', '')}>{selectedCombatant.name}</span>
              </h1>
            </div>
            <div className="col-lg-2 col-md-4" style={{ paddingTop: 20, fontSize: 20 }}>
              <a
                href={`https://www.warcraftlogs.com/reports/${report.code}/#fight=${fight.id}&source=${parser.playerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pull-right"
              >
                <span className="glyphicon glyphicon-link" aria-hidden /> Open report
              </a>
            </div>
          </div>
          <div className="text-muted" style={{ marginBottom: 25, fontSize: '1.4em' }}>
            The <img
              src={`/specs/${config.spec.className.replace(' ', '')}-${config.spec.specName.replace(' ', '')}.jpg`}
              alt="Spec logo"
              style={{
                borderRadius: '50%',
                height: '1.2em',
              }}
          /> {config.spec.specName} {config.spec.className} spec implementation is being maintained by {config.maintainers.map(maintainer => <span key={maintainer.nickname} className="maintainer-name">{maintainer.nickname}</span>)} (status: <dfn data-tip={getCompletenessExplanation(config.completeness)} style={{ color: getCompletenessColor(config.completeness) }}>{getCompletenessLabel(config.completeness).toLowerCase()}</dfn>). <a href="#spec-information" onClick={this.handleClickViewSpecInformation}>More information.</a>
          </div>
          {config.completeness === SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED && (
            <div className="alert alert-danger" style={{ fontSize: '1.5em' }}>
              This spec is not actively being maintained. In order to continue providing useful and accurate information we are looking for an active maintainer for this spec. See our GitHub page or join Discord for more information.<br />
              <GithubButton /> <DiscordButton />
            </div>
          )}

          <div className="row">
            <div className="col-md-8">
              {this.renderStatistics(results.statistics)}
            </div>
            <div className="col-md-4">
              {this.renderItems(results.items, selectedCombatant)}
              {results.extraPanels && results.extraPanels}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 15, marginBottom: 100 }}>
            <div className="panel-body flex" style={{ flexDirection: 'column', padding: '0' }}>
              <div className="navigation" style={{ minHeight: 70 }}>
                <div className="flex" style={{ paddingTop: '10px', flexDirection: 'row', flexWrap: 'wrap' }}>
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

        {this.state.showSpecInformationOverlay && (
          <SpecInformationOverlay config={config} onCloseClick={this.handleSpecInformationCloseClick} key="spec-description-overlay" />
        )}
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
