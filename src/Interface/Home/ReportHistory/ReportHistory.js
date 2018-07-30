import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { makePlainUrl } from 'Interface/common/makeAnalyzerUrl';
import makeUrl from 'Interface/Character/makeUrl';
import REPORT_HISTORY_TYPES from 'Interface/Home/ReportHistory/REPORT_HISTORY_TYPES';

class ReportHistory extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      fightId: PropTypes.number,
      fightName: PropTypes.string,
      playerId: PropTypes.number,
      playerName: PropTypes.string.isRequired,
      playerRealm: PropTypes.string,
      playerRegion: PropTypes.string,
      playerClass: PropTypes.string.isRequired,
      end: PropTypes.number.isRequired,
      type: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { reportHistory } = this.props;

    const now = (+new Date()) / 1000;

    return (
      <ul className="list selection">
        {[...reportHistory].reverse().map(report => (
          <li key={report.code} className="selectable">
            {report.type === REPORT_HISTORY_TYPES.CHARACTER && (
              <Link to={makeUrl(report.playerRegion, report.playerRealm, report.playerName)} style={{ color: '#fff', textDecoration: 'none' }}>
                <div>
                  <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                  <div className="flex wrapable">
                    <div>{report.playerRealm} ({report.playerRegion})</div>
                    <div className="flex-sub">viewed {Math.floor(Math.max(0, now - report.end) / 86400)}d ago</div>
                  </div>
                </div>
              </Link>
            )}
            {(report.type === REPORT_HISTORY_TYPES.REPORT || !report.type) && (
              <Link to={makePlainUrl(report.code, report.fightId, report.fightName, report.playerId, report.playerName)} style={{ color: '#fff', textDecoration: 'none' }}>
                <div>
                  <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                  <div className="flex wrapable">
                    <div>{report.fightName}</div>
                    <div className="flex-sub">{Math.floor(Math.max(0, now - report.end) / 86400)}d old report</div>
                  </div>
                </div>
              </Link>
            )}
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
