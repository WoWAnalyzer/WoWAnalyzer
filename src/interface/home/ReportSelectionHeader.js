import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import { ReactComponent as Logo } from 'interface/images/logo.svg';
import Warning from 'interface/Alert/Warning';
import { getReportHistory } from 'interface/selectors/reportHistory';
import CharacterSearch from 'interface/CharacterSearch';

import ReportSelecter from '../others/ReportSelecter';
import ReportHistory from './ReportHistory';

import '../Header.scss';

class ReportSelectionHeader extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      reportSelectionActive: true,
    };
    this.handleToggleCharacterSearchClick = this.handleToggleCharacterSearchClick.bind(this);
    this.handleToggleReportSelectorClick = this.handleToggleReportSelectorClick.bind(this);
  }

  handleToggleCharacterSearchClick(e) {
    e.preventDefault();
    this.setState({
      reportSelectionActive: false,
    });
  }
  handleToggleReportSelectorClick(e) {
    e.preventDefault();
    this.setState({
      reportSelectionActive: true,
    });
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
              <Trans>Improve your performance with personal feedback and stats. Just enter the link of a <a href="https://www.warcraftlogs.com/" target="_blank" rel="noopener noreferrer">Warcraft Logs</a> report:</Trans>
              <div style={{ margin: '30px auto', maxWidth: 700, textAlign: 'left' }}>
                {this.state.reportSelectionActive ? (
                  <>
                    <ReportSelecter />
                    <Trans>or <a href="/" onClick={this.handleToggleCharacterSearchClick}>
                      search for a character
                    </a>.</Trans>
                  </>
                ) : (
                  <>
                    <CharacterSearch />
                    <Trans>or <a href="/" onClick={this.handleToggleReportSelectorClick}>
                      enter a report link
                    </a>.</Trans><br /><br />

                    <Warning>
                      <Trans>
                        The character page will only show fights that have been ranked by Warcraft Logs. Wipes are not included and during busy periods there might be a delay before new reports appear. You can still analyze these fights by manually finding the report on Warcraft Logs and using the report link.
                      </Trans>
                    </Warning>
                  </>
                )}
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
