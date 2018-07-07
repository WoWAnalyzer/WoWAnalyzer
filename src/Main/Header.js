import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Trans } from '@lingui/react';

import lazyLoadComponent from 'common/lazyLoadComponent';
import { hasPremium } from 'Interface/selectors/user';
import Ad from 'Interface/common/Ad';
import makeNewsUrl from 'Interface/News/makeUrl';
import { title as AboutArticleTitle } from 'Interface/News/Articles/2017-01-31-About';
import { title as UnlistedLogsTitle } from 'Interface/News/Articles/2017-01-31-UnlistedLogs';

import ReportSelecter from './ReportSelecter';
import LanguageSwitcher from './LanguageSwitcher';
// import ServiceStatus from './ServiceStatus';

import './Header.css';

const CharacterSearch = lazyLoadComponent(() => import(/* webpackChunkName: 'CharacterSearch', webpackPrefetch: true */ 'Interface/Character/Search').then(exports => exports.default));

class Header extends React.PureComponent {
  static propTypes = {
    showReportSelecter: PropTypes.bool.isRequired,
    premium: PropTypes.bool,
  };
  static defaultProps = {
    premium: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      reportActive: true,
    };
  }

  render() {
    const { showReportSelecter, premium } = this.props;

    return (
      <header>
        <div className="container image-overlay">
          <div className="row">
            <div className="col-lg-6 col-md-10">
              <h1><Trans>WoW&shy;Analyzer</Trans></h1>
              <div className="description">
                <Trans>Analyze your raid logs to get personal suggestions and metrics to improve your performance. Just enter a Warcraft Logs report:</Trans>
              </div>
              {showReportSelecter && (
                <div>
                  <div className="parse-tabs">
                    <span onClick={() => this.setState({ reportActive: true })} className={this.state.reportActive ? 'selected' : ''}>Report</span>
                    <span onClick={() => this.setState({ reportActive: false })} className={this.state.reportActive ? '' : 'selected'}>Character</span>
                  </div>
                  {this.state.reportActive ? (
                    <ReportSelecter />
                  ) : (
                    <CharacterSearch />
                  )}
                </div>
              )}
                
              {/*{process.env.NODE_ENV !== 'test' && <ServiceStatus style={{ marginBottom: 5 }} />}*/}
              <div className="about">
                <Link to={makeNewsUrl(AboutArticleTitle)}>About WoWAnalyzer</Link>
                {' '}| <Link to={makeNewsUrl(UnlistedLogsTitle)}>About unlisted logs</Link>
                {' '}| <Link to="/premium">Premium</Link>
                {' '}| <LanguageSwitcher />
              </div>
            </div>
            {!premium && (
              <div className="col-lg-6 text-right hidden-md">
                <Ad format="mediumrectangle" />
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Header);
