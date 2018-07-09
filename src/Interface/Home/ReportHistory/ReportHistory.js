import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { makePlainUrl } from 'Interface/common/makeAnalyzerUrl';

class ReportHistory extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      fightId: PropTypes.number.isRequired,
      fightName: PropTypes.string.isRequired,
      playerId: PropTypes.number.isRequired,
      playerName: PropTypes.string.isRequired,
      playerClass: PropTypes.string.isRequired,
      end: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { reportHistory } = this.props;

    const now = (+new Date()) / 1000;

    return (
      <ul className="list selection">
        {[...reportHistory].reverse().map(report => (
          <li key={report.code} className="selectable">
            <Link to={makePlainUrl(report.code, report.fightId, report.fightName, report.playerId, report.playerName)} style={{ color: '#fff', textDecoration: 'none' }}>
              <div>
                <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                <div className="flex wrapable">
                  <div>{report.fightName}</div>
                  <div className="flex-sub">{Math.floor(Math.max(0, now - report.end) / 86400)}d old report</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {reportHistory.length === 0 && (
          <li style={{ padding: '10px 22px' }}>
            You haven't viewed anything yet.
          </li>
        )}
      </ul>
    );
  }
}

export default ReportHistory;
