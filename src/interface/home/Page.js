import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';
import { Link, Route, Switch } from 'react-router-dom';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import NewsIcon from 'interface/icons/Megaphone';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';
import HelpWantedIcon from 'interface/icons/Information';
import GitHubIcon from 'interface/icons/GitHubMarkLarge';
import DiscordIcon from 'interface/icons/DiscordTiny';
import { hasPremium } from 'interface/selectors/user';
import ErrorBoundary from 'interface/common/ErrorBoundary';
import Ad from 'interface/common/Ad';

import './Home.scss';
import ReportSelectionHeader from './ReportSelectionHeader';
import NotFound from './NotFound';

const News = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'News' */ 'interface/news').then(exports => exports.default)));
const NewsPage = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'News' */ 'interface/news/Page').then(exports => exports.default)));
const SpecListing = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'SpecListing' */ 'interface/SpecListing').then(exports => exports.default)));
const Premium = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'Premium' */ 'interface/premium/Page').then(exports => exports.default)));
const About = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'About' */ 'interface/about').then(exports => exports.default)));
const HelpWanted = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'HelpWanted' */ 'interface/helpwanted').then(exports => exports.default)));
const ContributorPage = lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'ContributorPage' */ 'interface/contributor/Page').then(exports => exports.default)));

class Home extends React.PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    premium: PropTypes.bool,
  };
  static defaultProps = {
    premium: false,
  };

  get pages() {
    return [
      {
        icon: NewsIcon,
        name: <Trans>News</Trans>,
        url: 'news',
      },
      {
        icon: FingerprintFilledIcon,
        name: <Trans>Specs</Trans>,
        url: 'specs',
      },
      {
        icon: Logo,
        name: <Trans>About</Trans>,
        url: 'about',
      },
      {
        icon: PremiumIcon,
        name: <Trans>Premium</Trans>,
        url: 'premium',
      },
      {
        icon: HelpWantedIcon,
        name: <Trans>Help wanted</Trans>,
        url: 'help-wanted',
      },
      {
        icon: GitHubIcon,
        name: <Trans>Source code</Trans>,
        url: 'https://github.com/WoWAnalyzer/WoWAnalyzer',
      },
      {
        icon: DiscordIcon,
        name: <Trans>Discord</Trans>,
        url: 'https://wowanalyzer.com/discord',
      },
    ];
  }

  render() {
    const { location, premium } = this.props;

    const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

    return (
      <div className="home-page">
        <ReportSelectionHeader />

        <main className="container">
          {premium === false && (
            <div style={{ marginTop: 40 }}>
              <Ad key={url} />
            </div>
          )}

          <nav>
            <ul>
              {this.pages.map(page => {
                const Icon = page.icon;
                const isRelativeLink = !page.url.includes('://');
                const content = (
                  <>
                    <Icon className="icon" />
                    {page.name}
                  </>
                );

                return (
                  <li key={page.url} className={page.url === url ? 'active' : undefined}>
                    {isRelativeLink ? (
                      <Link to={`/${page.url}`}>{content}</Link>
                    ) : (
                      <a href={page.url}>{content}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <ErrorBoundary>
            <Switch>
              <Route
                path="/"
                exact
                component={News}
              />
              <Route
                path="/news"
                component={News}
              />
              <Route
                path="/news/:articleId"
                render={({ match }) => (
                  <NewsPage
                    articleId={decodeURI(match.params.articleId.replace(/\+/g, ' '))}
                  />
                )}
              />
              <Route
                path="/specs"
                component={SpecListing}
              />
              <Route
                path="/premium"
                component={Premium}
              />
              <Route
                path="/about"
                component={About}
              />
              <Route
                path="/help-wanted"
                component={HelpWanted}
              />
              <Route
                path="/contributor/:id"
                render={({ match }) => (
                  <ContributorPage
                    contributorId={decodeURI(match.params.id.replace(/\+/g, ' '))}
                  />
                )}
              />
              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>

          {premium === false && (
            <div style={{ marginTop: 40 }}>
              <Ad key={url} />
            </div>
          )}
        </main>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Home);
