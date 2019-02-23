import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import { hasPremium } from 'interface/selectors/user';
import Ad from 'interface/common/Ad';
import makeNewsUrl from 'interface/news/makeUrl';
import { title as AboutArticleTitle } from 'articles/2017-01-31-About/index';
import { title as UnlistedLogsTitle } from 'articles/2017-01-31-UnlistedLogs/index';

import ReportSelecter from './others/ReportSelecter';
import LanguageSwitcher from './LanguageSwitcher';

import './Header.scss';

const CharacterSearch = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'CharacterSearch', webpackPrefetch: true */ 'interface/character/Search').then(exports => exports.default)));

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
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-10">
              <div className="call-to-action">
                <div className="description">
                  <Trans>Improve your performance with personal feedback and stats. Just enter a Warcraft Logs report link:</Trans>
                </div>
                {showReportSelecter && (
                  <div>
                    {this.state.reportActive ? (
                      <ReportSelecter />
                    ) : (
                      <CharacterSearch />
                    )}
                    <div className="parse-tabs">
                      <span
                        onClick={() => this.setState({ reportActive: true })}
                        className={this.state.reportActive ? 'selected' : ''}
                      >
                        <Trans>Report</Trans>
                      </span>
                      <span
                        onClick={() => this.setState({ reportActive: false })}
                        className={this.state.reportActive ? '' : 'selected'}
                      >
                        <Trans>Character</Trans>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="about">
                <Link to={makeNewsUrl(AboutArticleTitle)}><Trans>About WoWAnalyzer</Trans></Link>
                {' '}| <Link to={makeNewsUrl(UnlistedLogsTitle)}><Trans>About unlisted logs</Trans></Link>
                {' '}| <Link to="/premium"><Trans>Premium</Trans></Link>
                {' '}| <LanguageSwitcher />
              </div>
            </div>
            {premium === false && (
              <div className="col-lg-6 text-right hidden-md">
                {/* Frontpage Header */}
                <Ad
                  style={{ width: 336, height: 280, float: 'right' }}
                  data-ad-slot="6838783431"
                />
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
