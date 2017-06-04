import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

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
            <div className="panel">
              <div className="panel-heading">
                <h2>Items</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <ul className="list">
                  {results.items.length === 0 && (
                    <li className="item clearfix" style={{ paddingTop: 20, paddingBottom: 20 }}>
                      No noteworthy items.
                    </li>
                  )}
                  {results.items.map(item => {
                    if (!item) {
                      return null;
                    }

                    return (
                      <li className="item clearfix" key={item.id}>
                        <article>
                          <figure>
                            {item.icon}
                          </figure>
                          <div>
                            <header>
                              {item.title}
                            </header>
                            <main>
                              {item.result}
                            </main>
                          </div>
                        </article>
                      </li>
                    );
                  })}
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
