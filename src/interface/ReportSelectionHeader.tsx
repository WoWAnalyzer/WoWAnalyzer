import { Trans } from '@lingui/react/macro';
import AlertWarning from 'interface/AlertWarning';
import ReportIcon from 'interface/icons/Events';
import GuildIcon from 'interface/icons/People';
import CharacterIcon from 'interface/icons/Person';
import Logo from 'interface/images/logo.svg?react';
import NameSearch, { SearchType } from 'interface/NameSearch';
import { getReportHistory } from 'interface/selectors/reportHistory';
import { ReportHistoryState } from 'interface/reducers/reportHistory';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import ReportHistory from './ReportHistory';
import ReportSelecter from './ReportSelecter';
import { RootState } from 'store';
import './Header.scss';
import LocalReportSelector from './LocalReportSelector';
import { Link } from 'react-router-dom';
import { staticHostingEnabled, wclIntegrationEnabled } from 'config/staticHosting';
import { isWclConfigured } from 'report-data/wcl/WclSession';

enum StateSearch {
  Report,
  Character,
  Guild,
  Local,
}

interface Props {
  reportHistory: ReportHistoryState;
}

interface State {
  searchType: StateSearch;
}

class ReportSelectionHeader extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchType:
        !wclIntegrationEnabled ||
        (staticHostingEnabled &&
          (!isWclConfigured() || window.location.hash.startsWith('#/local-import')))
          ? StateSearch.Local
          : StateSearch.Report,
    };
    this.handleCharacterSearchClick = this.handleCharacterSearchClick.bind(this);
    this.handleReportSearchClick = this.handleReportSearchClick.bind(this);
    this.handleGuildSearchClick = this.handleGuildSearchClick.bind(this);
    this.handleLocalSearchClick = this.handleLocalSearchClick.bind(this);
  }

  handleReportSearchClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    this.setState({
      searchType: StateSearch.Report,
    });
  }

  handleCharacterSearchClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    this.setState({
      searchType: StateSearch.Character,
    });
  }

  handleGuildSearchClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    this.setState({
      searchType: StateSearch.Guild,
    });
  }

  handleLocalSearchClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    this.setState({ searchType: StateSearch.Local });
  }

  renderSearch() {
    switch (this.state.searchType) {
      case StateSearch.Character:
        return (
          <>
            <NameSearch type={SearchType.CHARACTER} />
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
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
      case StateSearch.Guild:
        return <NameSearch type={SearchType.GUILD} />;
      case StateSearch.Local:
        return <LocalReportSelector />;
      case StateSearch.Report:
      default:
        return <ReportSelecter />;
    }
  }

  render() {
    const { reportHistory } = this.props;

    return (
      <header className="report-selection">
        <div className="container">
          <div className="row">
            <div className={reportHistory.length !== 0 ? 'col-md-8' : 'col-md-12'}>
              <Link to="/" className="brand-name">
                <Logo />
                <h1>WoWAnalyzer</h1>
              </Link>
              <div id="reportSelectionHeader.improveYourPerformance">
                {!wclIntegrationEnabled ? (
                  <>Analyze a local advanced combat-log file in your browser.</>
                ) : staticHostingEnabled ? (
                  <>
                    Analyze a Warcraft Logs report or a local advanced combat-log file in your
                    browser. Warcraft Logs reports require signing in to{' '}
                    <a
                      href="https://www.warcraftlogs.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Warcraft Logs
                    </a>
                    .
                  </>
                ) : (
                  <Trans id="interface.home.reportSelectionHeader.improveYourPerformance">
                    Improve your performance with personal feedback and stats. Just enter the link
                    of a Warcraft Logs report below.
                  </Trans>
                )}
              </div>
              <div style={{ margin: '30px auto', maxWidth: 700, textAlign: 'left' }}>
                <nav>
                  <ul>
                    {wclIntegrationEnabled && (
                      <li
                        key="report"
                        className={
                          this.state.searchType === StateSearch.Report ? 'active' : undefined
                        }
                      >
                        <a
                          href="#/"
                          style={{ padding: '5px' }}
                          onClick={this.handleReportSearchClick}
                        >
                          <ReportIcon />
                          <Trans id="interface.home.reportSelectionHeader.report">Report</Trans>
                        </a>
                      </li>
                    )}
                    {!staticHostingEnabled && wclIntegrationEnabled && (
                      <>
                        <li
                          key="character"
                          className={
                            this.state.searchType === StateSearch.Character ? 'active' : undefined
                          }
                        >
                          <a
                            href="#/"
                            style={{ padding: '5px' }}
                            onClick={this.handleCharacterSearchClick}
                          >
                            <CharacterIcon />
                            <Trans id="interface.home.reportSelectionHeader.character">
                              Character
                            </Trans>
                          </a>
                        </li>
                        <li
                          key="guild"
                          className={
                            this.state.searchType === StateSearch.Guild ? 'active' : undefined
                          }
                        >
                          <a
                            href="#/"
                            style={{ padding: '5px' }}
                            onClick={this.handleGuildSearchClick}
                          >
                            <GuildIcon />
                            <Trans id="interface.home.reportSelectionHeader.guild">Guild</Trans>
                          </a>
                        </li>
                      </>
                    )}
                    <li
                      key="local"
                      className={this.state.searchType === StateSearch.Local ? 'active' : undefined}
                    >
                      <a
                        href="#/local-import"
                        style={{ padding: '5px' }}
                        onClick={this.handleLocalSearchClick}
                      >
                        <ReportIcon />
                        Local file
                      </a>
                    </li>
                  </ul>
                </nav>
                {this.renderSearch()}
              </div>
            </div>
            {reportHistory.length !== 0 && (
              <div className="col-md-4 text-left" style={{ marginTop: -10, marginBottom: -10 }}>
                <small>
                  <Trans id="interface.home.reportSelectionHeader.recentlyViewed">
                    Recently viewed
                  </Trans>
                </small>
                {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
                <br />

                <ReportHistory reportHistory={reportHistory} />
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  reportHistory: getReportHistory(state),
});

export default connect(mapStateToProps)(ReportSelectionHeader);
