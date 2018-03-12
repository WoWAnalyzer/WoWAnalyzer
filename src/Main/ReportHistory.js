import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getReportHistory } from 'selectors/reportHistory';
import { makePlainUrl } from 'Main/makeAnalyzerUrl';

class ReportHistory extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { reportHistory } = this.props;

    return (
      <ul className="list selection">
        {reportHistory.reverse().map(report => (
          <li className="selectable">
            <Link to={makePlainUrl(report.code, report.fightId, report.fightName, report.playerId, report.playerName)} style={{ color: '#fff', textDecoration: 'none' }}>
              <div>
                <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                <div className="fightName">{report.fightName}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
});
export default connect(mapStateToProps, null)(ReportHistory);
