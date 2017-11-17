import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Toggle from 'react-toggle';

import FightSelectionList from './FightSelectionList';
import makeAnalyzerUrl from './makeAnalyzerUrl';

class FightSelecter extends Component {
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
    onRefresh: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      killsOnly: false,
    };
  }

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, onRefresh } = this.props;
    const { killsOnly } = this.state;

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to={makeAnalyzerUrl()} data-tip="Back to report selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          {report.title}
        </h1>

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
                  Kills only
                </label>
                <Link to={makeAnalyzerUrl(report)} onClick={onRefresh} data-tip="This will refresh the fights list which can be useful if you're live logging.">
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> Refresh
                </Link>
              </div>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <FightSelectionList report={report} fights={report.fights} killsOnly={this.state.killsOnly} />
          </div>
        </div>

        <div className="text-muted">
          Icons by <a href="https://icons8.com/" rel="noopener noreferrer">Icons8</a>.
        </div>
      </div>
    );
  }
}

export default FightSelecter;
