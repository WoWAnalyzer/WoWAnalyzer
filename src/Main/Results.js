import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import DevelopmentTab from 'Main/DevelopmentTab';

class Results extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    tab: PropTypes.string,
    onChangeTab: PropTypes.func.isRequired,
  };

  render() {
    const { parser, tab, onChangeTab } = this.props;

    if (!parser.selectedCombatant) {
      return (
        <div>
          <h1>
            <div className="back-button">
              <Link to={`/report/${parser.report.code}/${parser.player.name}`} data-tip="Back to fight selection">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
              </Link>
            </div>
            Initializing report...
          </h1>

          <div className="spinner"></div>
        </div>
      );
    }

    const results = parser.generateResults();

    if (process.env.NODE_ENV === 'development') {
      results.tabs.push({
        title: 'Development',
        url: 'Development',
        render: () => (
          <DevelopmentTab
            parser={parser}
            results={results}
          />
        ),
      });
    }

    const tabUrl = tab || results.tabs[0].url;
    const activeTab = results.tabs.find(tab => tab.url === tabUrl);

    return (
      <div style={{ width: '100%' }}>
        <h1>
          <div className="back-button">
            <Link to={`/report/${parser.report.code}/${parser.player.name}`} data-tip="Back to fight selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          Results
          <a
            href={`https://www.warcraftlogs.com/reports/${parser.report.code}/#fight=${parser.fight.id}&source=${parser.playerId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pull-right"
            style={{ fontSize: '.6em' }}
          >
            <span className="glyphicon glyphicon-link" aria-hidden="true" /> Open report
          </a>
        </h1>

        <div className="row">
          <div className="col-md-8">
            <div className="row">
              {results.statistics.map((statistic, i) => {
                if (!statistic) {
                  return null;
                }

                return (
                  <div className="col-lg-4 col-sm-6 col-xs-12" key={i}>
                    {statistic}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel items">
              <div className="panel-heading">
                <h2><dfn data-tip="The values shown are only for the special equip effects of the items. The passive gain from the stats is <b>not</b> included.">Items</dfn></h2>
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
                        return a.id - b.id;
                      })
                      .map(item => {
                        if (!item) {
                          return null;
                        }

                        const id = item.id || item.item.id;
                        const itemDetails = id && parser.selectedCombatant.getItem(id);
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
