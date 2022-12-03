import { Trans } from '@lingui/macro';
import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import Ad, { Location } from 'interface/Ad';
import ErrorBoundary from 'interface/ErrorBoundary';
import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';
import HelpWantedIcon from 'interface/icons/Information';
import NewsIcon from 'interface/icons/Megaphone';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import NavigationBar from 'interface/NavigationBar';
import { hasPremium } from 'interface/selectors/user';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { useWaSelector } from 'interface/utils/useWaSelector';

import './Home.scss';
import LanguageSwitcher from './LanguageSwitcher';
import NotFound from './NotFound';
import ReportSelectionHeader from './ReportSelectionHeader';

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

const pages = [
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

const Home = () => {
  const premium = useWaSelector((state) => hasPremium(state));
  const location = useLocation();

  const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

  return (
    <div className="home-page">
      <NavigationBar style={{ margin: 0, position: 'static' }}>
        <LanguageSwitcher />
      </NavigationBar>

      <ReportSelectionHeader />

      {premium === false && <Ad location={Location.Top} style={{ marginTop: '-20px' }} />}

      <main className="container">
        <nav>
          <ul>
            {pages.map((page) => {
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
            <Route path="/news/:articleId" component={NewsPage} />
            <Route path="/news" component={News} />
            <Route path="/specs" component={SpecList} />
            <Route path="/premium" component={Premium} />
            <Route path="/about" component={AboutPage} />
            <Route path="/help-wanted" component={HelpWanted} />
            <Route path="/contributor/:id" component={ContributorPage} />
            <Route path="/search/:searchTerm?" component={Search} />
            <Route component={NotFound} />
          </Switch>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Home;
