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
import { hasPremium } from 'interface/selectors/user';
import ErrorBoundary from 'interface/ErrorBoundary';
import Ad from 'interface/Ad';
import NavigationBar from 'interface/NavigationBar';

import './Home.scss';
import ReportSelectionHeader from './ReportSelectionHeader';
import NotFound from './NotFound';
import LanguageSwitcher from './LanguageSwitcher';

const News = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'News' */ 'interface/News').then((exports) => exports.default),
  ),
);
const NewsPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'News' */ 'interface/NewsPage').then((exports) => exports.default),
  ),
);
const SpecList = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'SpecList' */ 'interface/SpecList').then(
      (exports) => exports.default,
    ),
  ),
);
const Premium = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'PremiumPage' */ 'interface/PremiumPage').then(
      (exports) => exports.default,
    ),
  ),
);
const AboutPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'AboutPage' */ 'interface/AboutPage').then(
      (exports) => exports.default,
    ),
  ),
);
const HelpWanted = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'HelpWantedPage' */ 'interface/HelpWantedPage').then(
      (exports) => exports.default,
    ),
  ),
);
const ContributorPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'ContributorPage' */ 'interface/ContributorPage').then(
      (exports) => exports.default,
    ),
  ),
);
const Search = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'Search' */ 'interface/Search').then((exports) => exports.default),
  ),
);

class Home extends React.PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
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
        name: <Trans id="interface.home.page.news">News</Trans>,
        url: 'news',
      },
      {
        icon: FingerprintFilledIcon,
        name: <Trans id="interface.home.page.specs">Specs</Trans>,
        url: 'specs',
      },
      {
        icon: Logo,
        name: <Trans id="interface.home.page.about">About</Trans>,
        url: 'about',
      },
      {
        icon: PremiumIcon,
        name: <Trans id="interface.home.page.premium">Premium</Trans>,
        url: 'premium',
      },
      {
        icon: HelpWantedIcon,
        name: <Trans id="interface.home.page.helpWanted">Help wanted</Trans>,
        url: 'help-wanted',
      },
    ];
  }

  render() {
    const { location, premium } = this.props;

    const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

    return (
      <div className="home-page">
        <NavigationBar style={{ margin: 0, position: 'static' }}>
          <LanguageSwitcher />
        </NavigationBar>

        <ReportSelectionHeader />

        <main className="container">
          <nav>
            <ul>
              {this.pages.map((page) => {
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
              <Route path="/" exact component={News} />
              <Route path="/news" component={News} />
              <Route
                path="/news/:articleId"
                render={({ match }) => (
                  <NewsPage articleId={decodeURI(match.params.articleId.replace(/\+/g, ' '))} />
                )}
              />
              <Route path="/specs" component={SpecList} />
              <Route path="/premium" component={Premium} />
              <Route path="/about" component={AboutPage} />
              <Route path="/help-wanted" component={HelpWanted} />
              <Route
                path="/contributor/:id"
                render={({ match }) => (
                  <ContributorPage contributorId={decodeURI(match.params.id.replace(/\+/g, ' '))} />
                )}
              />
              <Route
                path="/search/:searchTerm?"
                render={({ location }) => (
                  <Search
                    query={
                      decodeURIComponent(location.pathname.replace('/search/', '')) +
                      decodeURIComponent(location.hash)
                    }
                  />
                )}
              />
              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>

          {premium === false && (
            <div style={{ marginTop: 40 }}>
              <Ad />
            </div>
          )}
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  premium: hasPremium(state),
});

export default connect(mapStateToProps)(Home);
