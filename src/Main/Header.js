import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import lazyLoadComponent from 'common/lazyLoadComponent';
import { hasPremium } from 'selectors/user';
import Ad from 'Main/Ad';

import ReportSelecter from './ReportSelecter';
import makeNewsUrl from './News/makeUrl';
import { title as AboutArticleTitle } from './News/Articles/2017-01-31-About';
import { title as UnlistedLogsTitle } from './News/Articles/2017-01-31-UnlistedLogs';
// import ServiceStatus from './ServiceStatus';

import './Header.css';

const CharacterSelecter = lazyLoadComponent(() => import(/* webpackChunkName: 'CharacterSelecter' */ './Character/CharacterSelecter').then(exports => exports.default));

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
              <h1>WoW&shy;Analyzer</h1>
              <div className="description">
                Analyze your raid logs to get personal suggestions and metrics to improve your performance. Just enter a Warcraft Logs report:
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
                    <CharacterSelecter />
                  )}
                </div>
              )}
                
              {/*{process.env.NODE_ENV !== 'test' && <ServiceStatus style={{ marginBottom: 5 }} />}*/}
              <div className="about">
                <Link to={makeNewsUrl(AboutArticleTitle)}>About WoWAnalyzer</Link>
                {' '}| <Link to={makeNewsUrl(UnlistedLogsTitle)}>About unlisted logs</Link>
                {' '}| <a href="/premium">Premium</a>
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
