import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';
import Masonry from 'react-masonry-component';

import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';
import getBossName from 'common/getBossName';
import { getCompletenessLabel, getCompletenessExplanation, getCompletenessColor } from 'common/SPEC_ANALYSIS_COMPLETENESS';

import DevelopmentTab from 'Main/DevelopmentTab';
import EventsTab from 'Main/EventsTab';
import Tab from 'Main/Tab';
import Status from 'Main/Status';

import './Results.css';

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

  componentDidUpdate() {
    ReactTooltip.rebuild();
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
        render: () => (
          <EventsTab
            parser={parser}
          />
        ),
      });
      results.tabs.push({
        title: 'Status',
        url: 'status',
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
        <div className="row" style={{ marginTop: 20 }}>
          <div className="col-lg-10 col-md-8" style={{ position: 'relative' }}>
            <div className="back-button" style={{ fontSize: 36, width: 20 }}>
              <Link to={`/report/${report.code}/${fight.id}`} data-tip="Back to player selection">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden />
              </Link>
            </div>
            <h1 style={{ marginBottom: 0, fontSize: 48, textTransform: 'none' }}>
              {getBossName(fight)} by <span className={config.spec.className.replace(' ', '')}>{selectedCombatant.name}</span>
            </h1>
          </div>
          <div className="col-lg-2 col-md-4" style={{ paddingTop: 20 }}>
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
        <div className="text-muted" style={{ marginBottom: 25 }}>
          The <img
            src={`/specs/${config.spec.className.replace(' ', '')}-${config.spec.specName.replace(' ', '')}.jpg`}
            alt="Spec logo"
            style={{
              borderRadius: '50%',
              height: '1.2em',
            }}
          /> {config.spec.specName} {config.spec.className} analyzer is being maintained by {config.maintainer}. This spec's completeness is <dfn data-tip={getCompletenessExplanation(config.completeness)} style={{ color: getCompletenessColor(config.completeness) }}>{getCompletenessLabel(config.completeness)}</dfn>.
        </div>

        <div className="row">
          <div className="col-md-8">
            <Masonry className="row statistics">
              {results.statistics
                .filter(statistic => !!statistic) // filter optionals
                .map((statistic, index) => statistic.statistic ? statistic : { statistic, order: index }) // normalize
                .sort((a, b) => a.order - b.order)
                .map((statistic, i) => React.cloneElement(statistic.statistic, {
                  key: `${statistic.order}-${i}`,
                }))}
            </Masonry>
          </div>
          <div className="col-md-4">
            <div className="panel items">
              <div className="panel-heading">
                <h2><dfn data-tip="The values shown are only for the special equip effects of the items. The passive gain from the stats is <b>not</b> included.">Items</dfn>
                </h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <ul className="list">
                  {results.items.length === 0 && (
                    <li className="item clearfix" style={{ paddingTop: 20, paddingBottom: 20 }}>
                      No noteworthy items.
                    </li>
                  )}
                  {
                    results.items
                      .sort((a, b) => {
                        if (a.item && b.item) {
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
          </div>
        </div>

        <div className="panel">
          <div className="panel-body flex" style={{ padding: '0' }}>
            <div className="navigation" style={{ flex: '0 0 auto', width: 200, minHeight: 400 }}>
              <div className="panel-heading">
                <h2>Menu</h2>
              </div>
              <div style={{ padding: '10px 0' }}>
                <ul>
                  {results.tabs.map(tab => (
                    <li
                      key={tab.url}
                      className={activeTab.url === tab.url ? 'active' : ''}
                      onClick={() => onChangeTab(tab.url)}
                    >
                      {tab.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              {activeTab.render()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Results;
