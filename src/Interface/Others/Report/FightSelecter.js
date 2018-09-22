import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Toggle from 'react-toggle';

import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';

import FightSelectionList from './FightSelectionList';

class FightSelecter extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fights: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        difficulty: PropTypes.number,
        boss: PropTypes.number.isRequired,
        start_time: PropTypes.number.isRequired,
        end_time: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        kill: PropTypes.bool,
      })),
    }),
    refreshReport: PropTypes.func.isRequired,
  };
  state = {
    killsOnly: false,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, refreshReport } = this.props;
    if (!report) {
      // While this component shouldn't be called when report isn't available, Redux might re-render it prior to the container which would otherwise cause a crash
      return null;
    }

    const { killsOnly } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-md-8" style={{ position: 'relative' }}>
            <div className="back-button" style={{ fontSize: 36, width: 20 }}>
              <Link to={makeAnalyzerUrl()} data-tip="Back to home">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
              </Link>
            </div>
            <h1>
              {report.title}
            </h1>
          </div>
          <div className="col-lg-2 col-md-4">
            <a
              href={`https://www.warcraftlogs.com/reports/${report.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pull-right"
            >
              <span className="glyphicon glyphicon-link" aria-hidden /> Warcraft Logs
            </a>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div className="row">
              <div className="col-md-8">
                <h2>Select the fight to parse</h2>
              </div>
              <div className="col-md-4 text-right toggle-control action-buttons">
                <Toggle
                  checked={killsOnly}
                  icons={false}
                  onChange={event => this.setState({ killsOnly: event.currentTarget.checked })}
                  id="kills-only-toggle"
                />
                <label htmlFor="kills-only-toggle">
                  {' '}Kills only
                </label>
                <Link
                  to={makeAnalyzerUrl(report)}
                  onClick={refreshReport}
                  data-tip="This will refresh the fights list which can be useful if you're live logging."
                >
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> Refresh
                </Link>
              </div>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <FightSelectionList
              report={report}
              fights={report.fights}
              killsOnly={killsOnly}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FightSelecter;
