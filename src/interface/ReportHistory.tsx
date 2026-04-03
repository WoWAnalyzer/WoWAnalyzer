import { Trans } from '@lingui/react/macro';
import makeCharacterPageUrl from 'common/makeCharacterPageUrl';
import { makePlainUrl } from 'interface/makeAnalyzerUrl';
import REPORT_HISTORY_TYPES from 'interface/REPORT_HISTORY_TYPES';
import { Link } from 'react-router-dom';
import { ReportHistoryEntry } from 'interface/reducers/reportHistory';

interface Props {
  reportHistory: ReportHistoryEntry[];
}

const ReportHistory = (props: Props) => {
  const { reportHistory } = props;

  const now = Number(new Date()) / 1000;

  return (
    <ul className="list selection" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
      {[...reportHistory].reverse().map((report) => (
        <li key={report.code} className="selectable">
          {report.type === REPORT_HISTORY_TYPES.CHARACTER &&
            report.playerRegion &&
            report.playerRealm && (
              <Link
                to={makeCharacterPageUrl(
                  report.playerRegion,
                  report.playerRealm,
                  report.playerName,
                )}
                style={{ color: '#fff', textDecoration: 'none' }}
              >
                <div>
                  <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                  <div className="flex wrapable">
                    <div>
                      {report.playerRealm} ({report.playerRegion})
                    </div>
                    <div className="flex-sub">
                      <Trans id="interface.home.ReportHistory.viewedXDAgo">
                        viewed {Math.floor(Math.max(0, now - report.end) / 86400)}d ago
                      </Trans>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          {(report.type === REPORT_HISTORY_TYPES.REPORT || !report.type) && (
            <Link
              to={makePlainUrl(
                report.code,
                report.fightId,
                report.fightName,
                report.playerId,
                report.playerName,
              )}
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              <div>
                <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
                <div className="flex wrapable">
                  <div>{report.fightName}</div>
                  <div className="flex-sub">
                    <Trans id="interface.home.ReportHistory.xDOldReport">
                      {Math.floor(Math.max(0, now - report.end) / 86400)}d old report
                    </Trans>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </li>
      ))}
      {reportHistory.length === 0 && (
        <li style={{ padding: '10px 22px' }}>
          <Trans id="interface.home.ReportHistory.notViewedAnythingYet">
            You haven't viewed anything yet.
          </Trans>
        </li>
      )}
    </ul>
  );
};

export default ReportHistory;
