import { wrapCreateBrowserRouter } from '@sentry/react';
import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import HomePage from 'interface/Home';
import PrivacyPage from 'interface/PrivacyPage';
import ReportLayout from 'interface/report';
import {
  createBrowserRouter,
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import NotFound from 'interface/NotFound';
import RouterErrorBoundary from 'interface/RouterErrorBoundary';
import {
  AboutTab,
  CharacterTab,
  DefaultTab,
  EventsTab,
  OverviewTab,
  StatisticsTab,
  TimelineTab,
} from 'interface/report/Results/ResultsContent';

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
    <Route path="report/:reportCode/:fightId?/:player?/:build?" element={<ReportLayout />}>
      <Route index element={<OverviewTab />} />
      <Route path="overview" element={<OverviewTab />} />
      <Route path="statistics" element={<StatisticsTab />} />
      <Route path="timeline" element={<TimelineTab />} />
      <Route path="events" element={<EventsTab />} />
      <Route path="character" element={<CharacterTab />} />
      <Route path="about" element={<AboutTab />} />
      <Route path=":resultTab" element={<DefaultTab />} />
    </Route>
    <Route path="privacy" element={<PrivacyPage />} />
    <Route element={<HomePage />}>
      <Route index element={<News />} />
      <Route path="news" element={<News />} />
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

const sentryCreateBrowserRouter = import.meta.env.SENTRY_DSN
  ? wrapCreateBrowserRouter(createBrowserRouter)
  : createBrowserRouter;
const router =
  import.meta.env.MODE === 'test'
    ? createMemoryRouter(appRoutes)
    : sentryCreateBrowserRouter(appRoutes);

const App = () => <RouterProvider router={router} />;

export default App;
