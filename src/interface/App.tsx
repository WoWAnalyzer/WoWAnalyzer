import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import HomePage from 'interface/Home';
import PrivacyPage from 'interface/PrivacyPage';
import ReportPage from 'interface/report';
import {
  createBrowserRouter,
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import NotFound from 'interface/NotFound';
import RouterErrorBoundary from 'interface/RouterErrorBoundary';

import AppLayout from './AppLayout';

const CharacterPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'CharacterPage' */ 'interface/CharacterPage').then(
      (exports) => exports.default,
    ),
  ),
);
const GuildPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'GuildPage' */ 'interface/GuildPage').then(
      (exports) => exports.default,
    ),
  ),
);
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

const appRoutes = createRoutesFromElements(
  <Route path="/" element={<AppLayout />} errorElement={<RouterErrorBoundary />}>
    <Route path="character/:region/:realm/:name" element={<CharacterPage />} />
    <Route path="guild/:region/:realm/:name" element={<GuildPage />} />
    <Route
      path="report/:reportCode/:fightId?/:player?/:build?/:resultTab?"
      element={<ReportPage />}
    />
    <Route path="privacy" element={<PrivacyPage />} />
    <Route element={<HomePage />}>
      <Route index element={<News />} />
      <Route path="news">
        <Route path=":articleId" element={<NewsPage />} />
        <Route index element={<News />} />
      </Route>
      <Route path="specs" element={<SpecList />} />
      <Route path="premium" element={<Premium />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="help-wanted" element={<HelpWanted />} />
      <Route path="contributor/:id" element={<ContributorPage />} />
      <Route path="search/:searchTerm?" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Route>,
);

const router =
  process.env.NODE_ENV === 'test' ? createMemoryRouter(appRoutes) : createBrowserRouter(appRoutes);

const App = () => <RouterProvider router={router} />;

export default App;
