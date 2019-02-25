import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import { hasPremium } from 'interface/selectors/user';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import Warning from 'interface/common/Alert/Warning';
import { getReportHistory } from 'interface/selectors/reportHistory';

import ReportSelecter from './others/ReportSelecter';
import ReportHistory from './home/ReportHistory';

import './Header.scss';

const CharacterSearch = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'CharacterSearch', webpackPrefetch: true */ 'interface/character/Search').then(exports => exports.default)));

class Header extends React.PureComponent {
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
              <Trans>Improve your performance with personal feedback and stats. Just enter the link of a <a href="https://warcraftlogs.com" target="_blank" rel="noopener noreferrer">Warcraft Logs</a> report:</Trans>
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
                      The character page will only show fights that have been ranked by Warcraft Logs. During busy periods there might be a delay before new fights appear. Wipes are also not included. Find the report on Warcraft Logs and copy the direct report link to still analyze these fights.
                    </Warning>
                  </>
                )}
              </div>
            </div>
            {reportHistory.length !== 0 && (
              <div className="col-md-4 text-left">
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
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Header);
