import AlertWarning from 'interface/AlertWarning';
import ReportIcon from 'interface/icons/Events';
import GuildIcon from 'interface/icons/People';
import CharacterIcon from 'interface/icons/Person';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import NameSearch, { SearchType } from 'interface/NameSearch';
import { getReportHistory } from 'interface/selectors/reportHistory';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import ReportHistory from './ReportHistory';
import ReportSelecter from './ReportSelecter';

import './Header.scss';

const STATE_SEARCH_REPORT = 0;
const STATE_SEARCH_CHAR = 1;
const STATE_SEARCH_GUILD = 2;

class ReportSelectionHeader extends PureComponent {
  static propTypes = {
    reportHistory: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchType: STATE_SEARCH_REPORT,
    };
    this.handleCharacterSearchClick = this.handleCharacterSearchClick.bind(this);
    this.handleReportSearchClick = this.handleReportSearchClick.bind(this);
    this.handleGuildSearchClick = this.handleGuildSearchClick.bind(this);
  }

  handleCharacterSearchClick(e) {
    e.preventDefault();
    this.setState({
      searchType: STATE_SEARCH_CHAR,
    });
  }

  handleReportSearchClick(e) {
    e.preventDefault();
    this.setState({
      searchType: STATE_SEARCH_REPORT,
    });
  }

  handleGuildSearchClick(e) {
    e.preventDefault();
    this.setState({
      searchType: STATE_SEARCH_GUILD,
    });
  }

  renderSearch() {
    switch (this.state.searchType) {
      case STATE_SEARCH_CHAR:
        return (
          <>
            <NameSearch type={SearchType.CHARACTER} />
            <br />
            <AlertWarning>
              <>
                The character page will only show fights that have been ranked by Warcraft Logs.
                Wipes are not included and during busy periods there might be a delay before new
                reports appear. You can still analyze these fights by manually finding the report on
                Warcraft Logs and using the report link.
              </>
            </AlertWarning>
          </>
        );
      case STATE_SEARCH_GUILD:
        return <NameSearch type={SearchType.GUILD} />;
      case STATE_SEARCH_REPORT:
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
              <a href="/" className="brand-name">
                <Logo />
                <h1>WoWAnalyzer</h1>
              </a>
              <div id="reportSelectionHeader.improveYourPerformance">
                <>
                  Improve your performance with personal feedback and stats. Just enter the link of
                  a{' '}
                  <a href="https://www.warcraftlogs.com/" target="_blank" rel="noopener noreferrer">
                    Warcraft Logs
                  </a>{' '}
                  report below.
                </>
              </div>
              <div style={{ margin: '30px auto', maxWidth: 700, textAlign: 'left' }}>
                <nav>
                  <ul>
                    <li
                      key="report"
                      className={
                        this.state.searchType === STATE_SEARCH_REPORT ? 'active' : undefined
                      }
                    >
                      <a href="/" style={{ padding: '5px' }} onClick={this.handleReportSearchClick}>
                        <ReportIcon />
                        <>Report</>
                      </a>
                    </li>
                    <li
                      key="character"
                      className={this.state.searchType === STATE_SEARCH_CHAR ? 'active' : undefined}
                    >
                      <a
                        href="/"
                        style={{ padding: '5px' }}
                        onClick={this.handleCharacterSearchClick}
                      >
                        <CharacterIcon />
                        <>Character</>
                      </a>
                    </li>
                    <li
                      key="guild"
                      className={
                        this.state.searchType === STATE_SEARCH_GUILD ? 'active' : undefined
                      }
                    >
                      <a href="/" style={{ padding: '5px' }} onClick={this.handleGuildSearchClick}>
                        <GuildIcon />
                        <>Guild</>
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
                  <>Recently viewed</>
                </small>
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

const mapStateToProps = (state) => ({
  reportHistory: getReportHistory(state),
});

export default connect(mapStateToProps)(ReportSelectionHeader);
