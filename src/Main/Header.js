import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ReportSelecter from './ReportSelecter';
import CharacterSelecter from './Character/CharacterSelecter';
import makeNewsUrl from './News/makeUrl';
import { title as AboutArticleTitle } from './News/Articles/2017-01-31-About';
import { title as UnlistedLogsTitle } from './News/Articles/2017-01-31-UnlistedLogs';
import ServiceStatus from './ServiceStatus';

import './Header.css';

class Header extends React.PureComponent {
  static propTypes = {
    showReportSelecter: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      reportActive: false,
    };
  }

  render() {
    const { showReportSelecter } = this.props;

    return (
      <header>
        <div className="container image-overlay">
          <div className="row">
            <div className="col-lg-6 col-md-10">
              <h1>WoW&shy;Analyzer</h1>
              <div className="description">
                Analyze your raid logs to get personal suggestions and metrics to improve your performance. Just enter a Warcraft Logs report:
              </div>
              <div className="tabs">
                <span onClick={() => this.setState({ reportActive: true }) } className={ this.state.reportActive ? 'selected' : '' }>Report</span>
                <span onClick={() => this.setState({ reportActive: false }) } className={ this.state.reportActive ? '' : 'selected' }>Character</span>
              </div>
              {showReportSelecter && this.state.reportActive && (
                <ReportSelecter />
              )}
              {showReportSelecter && !this.state.reportActive && (
                <CharacterSelecter />
              )}
              {process.env.NODE_ENV !== 'test' && <ServiceStatus style={{ marginBottom: 5 }} />}
              <div className="about">
                <Link to={makeNewsUrl(AboutArticleTitle)}>About WoWAnalyzer</Link>
                {' '}| <Link to={makeNewsUrl(UnlistedLogsTitle)}>About unlisted logs</Link>
                {' '}| <a href="https://discord.gg/AxphPxU">Join Discord</a>
                {' '}| <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">View source</a>
                {' '}| <a href="https://www.patreon.com/wowanalyzer">Become a Patron</a>
                {' '}| <a href="https://status.wowanalyzer.com/">Status</a>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
