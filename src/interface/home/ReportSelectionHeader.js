import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import { ReactComponent as Logo } from 'interface/images/logo.svg';
import Warning from 'interface/Alert/Warning';
import { getReportHistory } from 'interface/selectors/reportHistory';
import NameSearch, { SearchType } from 'interface/NameSearch';
import ReportIcon from 'interface/icons/Events';
import CharacterIcon from 'interface/icons/Person';
import GuildIcon from 'interface/icons/People';
import ReportSelecter from '../others/ReportSelecter';
import ReportHistory from './ReportHistory';

import '../Header.scss';

const STATE_SEARCH_REPORT = 0;
const STATE_SEARCH_CHAR = 1;
const STATE_SEARCH_GUILD = 2;

class ReportSelectionHeader extends React.PureComponent {
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
        return (<>
          <NameSearch type={SearchType.CHARACTER} />
          <br />
          <Warning>
            <Trans>
              The character page will only show fights that have been ranked by Warcraft Logs. Wipes are not included and during busy periods there might be a delay before new reports appear. You can still analyze these fights by manually finding the report on Warcraft Logs and using the report link.
            </Trans>
          </Warning>
        </>);
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
              <Trans>Improve your performance with personal feedback and stats. Just enter the link of a <a href="https://www.warcraftlogs.com/" target="_blank" rel="noopener noreferrer">Warcraft Logs</a> report below.<br />Alternatively, you can search for a Character's parses or a Guild's recent reports.</Trans>
              <div style={{ margin: '30px auto', maxWidth: 700, textAlign: 'left' }}>
                <nav>
                  <ul>
                    <li key="report" className={this.state.searchType === STATE_SEARCH_REPORT ? "active" : undefined}>
                      <a href="/" onClick={this.handleReportSearchClick}><ReportIcon />Report</a>
                    </li>
                    <li key="character" className={this.state.searchType === STATE_SEARCH_CHAR ? "active" : undefined}>
                      <a href="/" onClick={this.handleCharacterSearchClick}><CharacterIcon />Character</a>
                    </li>
                    <li key="guild" className={this.state.searchType === STATE_SEARCH_GUILD ? "active" : undefined}>
                      <a href="/" onClick={this.handleGuildSearchClick}><GuildIcon />Guild</a>
                    </li>
                  </ul>
                </nav>
                {this.renderSearch()}
              </div>
            </div>
            {reportHistory.length !== 0 && (
              <div className="col-md-4 text-left" style={{ marginTop: -10, marginBottom: -10 }}>
                <small><Trans>Recently viewed</Trans></small><br />

                <ReportHistory reportHistory={reportHistory} />
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
});

export default connect(
  mapStateToProps,
)(ReportSelectionHeader);
