import React  from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Toggle from 'react-toggle';

import { fetchReport } from 'actions/report';
import { getReport } from 'selectors/report';

import FightSelectionList from './FightSelectionList';
import makeAnalyzerUrl from './makeAnalyzerUrl';

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
    fetchReport: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      killsOnly: false,
    };
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  handleRefresh() {
    const { fetchReport, report } = this.props;
    fetchReport(report.code, true);
  }

  render() {
    const { report } = this.props;
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
                  Kills only
                </label>
                <Link
                  to={makeAnalyzerUrl(report)}
                  onClick={this.handleRefresh}
                  data-tip="This will refresh the fights list which can be useful if you're live logging."
                >
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> Refresh
                </Link>
              </div>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <FightSelectionList report={report} fights={report.fights} killsOnly={killsOnly} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  report: getReport(state),
});

export default connect(mapStateToProps, {
  fetchReport,
})(FightSelecter);
