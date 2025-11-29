import { Trans } from '@lingui/react/macro';
import AlertWarning from 'interface/AlertWarning';
import ReportIcon from 'interface/icons/Events';
import GuildIcon from 'interface/icons/People';
import CharacterIcon from 'interface/icons/Person';
import Logo from 'interface/images/logo.svg?react';
import NameSearch, { SearchType } from 'interface/NameSearch';
import { getReportHistory } from 'interface/selectors/reportHistory';
import { useState } from 'react';
import { connect } from 'react-redux';

import ReportHistory from './ReportHistory';
import ReportSelecter from './ReportSelecter';

import './Header.scss';

const STATE_SEARCH_REPORT = 0;
const STATE_SEARCH_CHAR = 1;
const STATE_SEARCH_GUILD = 2;

interface ReportHistoryEntry {
  code: string;
  title?: string;
  start?: number;
  end: number;
  fightId?: number;
  fightName?: string;
  playerId?: number;
  playerName: string;
  playerRealm?: string;
  playerRegion?: string;
  playerClass: string;
  type: number;
}

interface StateProps {
  reportHistory: ReportHistoryEntry[];
}

const ReportSelectionHeader = ({ reportHistory }: StateProps) => {
  const [searchType, setSearchType] = useState(STATE_SEARCH_REPORT);

  const handleCharacterSearchClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSearchType(STATE_SEARCH_CHAR);
  };

  const handleReportSearchClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSearchType(STATE_SEARCH_REPORT);
  };

  const handleGuildSearchClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSearchType(STATE_SEARCH_GUILD);
  };

  const renderSearch = () => {
    switch (searchType) {
      case STATE_SEARCH_CHAR:
        return (
          <>
            <NameSearch type={SearchType.CHARACTER} />
            <br />
            <AlertWarning>
              <Trans id="interface.home.reportSelectionHeader.onlyRankedWCLogs">
                The character page will only show fights that have been ranked by Warcraft Logs.
                Wipes are not included and during busy periods there might be a delay before new
                reports appear. You can still analyze these fights by manually finding the report on
                Warcraft Logs and using the report link.
              </Trans>
            </AlertWarning>
          </>
        );
      case STATE_SEARCH_GUILD:
        return <NameSearch type={SearchType.GUILD} />;
      case STATE_SEARCH_REPORT:
      default:
        return <ReportSelecter />;
    }
  };

  return (
    <header className="report-selection">
      <div className="container">
        <div className="row">
          <div className={reportHistory.length !== 0 ? 'col-md-8' : 'col-md-12'}>
            <a href="/" className="brand-name">
              <Logo />
              <h1>WoWAnalyzer</h1>
            </a>
            <div id="reportSelectionHeader.improveYourPerformance">
              <Trans id="interface.home.reportSelectionHeader.improveYourPerformance">
                Improve your performance with personal feedback and stats. Just enter the link of a{' '}
                <a href="https://www.warcraftlogs.com/" target="_blank" rel="noopener noreferrer">
                  Warcraft Logs
                </a>{' '}
                report below.
              </Trans>
            </div>
            <div style={{ margin: '30px auto', maxWidth: 700, textAlign: 'left' }}>
              <nav>
                <ul>
                  <li
                    key="report"
                    className={searchType === STATE_SEARCH_REPORT ? 'active' : undefined}
                  >
                    <a href="/" style={{ padding: '5px' }} onClick={handleReportSearchClick}>
                      <ReportIcon />
                      <Trans id="interface.home.reportSelectionHeader.report">Report</Trans>
                    </a>
                  </li>
                  <li
                    key="character"
                    className={searchType === STATE_SEARCH_CHAR ? 'active' : undefined}
                  >
                    <a href="/" style={{ padding: '5px' }} onClick={handleCharacterSearchClick}>
                      <CharacterIcon />
                      <Trans id="interface.home.reportSelectionHeader.character">Character</Trans>
                    </a>
                  </li>
                  <li
                    key="guild"
                    className={searchType === STATE_SEARCH_GUILD ? 'active' : undefined}
                  >
                    <a href="/" style={{ padding: '5px' }} onClick={handleGuildSearchClick}>
                      <GuildIcon />
                      <Trans id="interface.home.reportSelectionHeader.guild">Guild</Trans>
                    </a>
                  </li>
                </ul>
              </nav>
              {renderSearch()}
            </div>
          </div>
          {reportHistory.length !== 0 && (
            <div className="col-md-4 text-left" style={{ marginTop: -10, marginBottom: -10 }}>
              <small>
                <Trans id="interface.home.reportSelectionHeader.recentlyViewed">
                  Recently viewed
                </Trans>
              </small>
              <br />

              <ReportHistory reportHistory={reportHistory} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state: any) => ({
  reportHistory: getReportHistory(state),
});

export default connect(mapStateToProps)(ReportSelectionHeader);
