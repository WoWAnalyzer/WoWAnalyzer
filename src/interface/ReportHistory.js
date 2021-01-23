import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Trans } from '@lingui/macro';

import makeCharacterPageUrl from 'common/makeCharacterPageUrl';
import { makePlainUrl } from 'interface/makeAnalyzerUrl';
import REPORT_HISTORY_TYPES from 'interface/REPORT_HISTORY_TYPES';

const ReportHistory = props => {
  const { reportHistory } = props;

  const now = (Number(new Date())) / 1000;

  return (
    <ul className="list selection" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
      {[...reportHistory].reverse().map(report => (
        <li key={report.code} className="selectable">
          {report.type === REPORT_HISTORY_TYPES.CHARACTER && (
            <Link
              to={makeCharacterPageUrl(report.playerRegion, report.playerRealm, report.playerName)}
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              <div>
                <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                <div className="flex wrapable">
                  <div>{report.playerRealm} ({report.playerRegion})</div>
                  <div className="flex-sub">
                    <Trans id="interface.home.ReportHistory.viewedXDAgo">viewed {Math.floor(Math.max(0, now - report.end) / 86400)}d ago</Trans>
                  </div>
                </div>
              </div>
            </Link>
          )}
          {(report.type === REPORT_HISTORY_TYPES.REPORT || !report.type) && (
            <Link
              to={makePlainUrl(report.code, report.fightId, report.fightName, report.playerId, report.playerName)}
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              <div>
                <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                <div className="flex wrapable">
                  <div>{report.fightName}</div>
                  <div className="flex-sub">
                    <Trans id="interface.home.ReportHistory.xDOldReport">{Math.floor(Math.max(0, now - report.end) / 86400)}d old report</Trans>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </li>
      ))}
      {reportHistory.length === 0 && (
        <li style={{ padding: '10px 22px' }}>
          <Trans id="interface.home.ReportHistory.notViewedAnythingYet">You haven't viewed anything yet.</Trans>
        </li>
      )}
    </ul>
  );
};

ReportHistory.propTypes = {
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

export default ReportHistory;
