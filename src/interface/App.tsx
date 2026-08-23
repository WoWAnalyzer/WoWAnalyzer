import { wrapCreateBrowserRouterV6 } from '@sentry/react';
import {
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import RouterErrorBoundary from 'interface/RouterErrorBoundary';
import { AppLayout } from 'interface/layouts/AppLayout';
import { HomeLayout } from 'interface/layouts/HomeLayout';
import WclOAuthCallbackGate from 'interface/WclOAuthCallbackGate';
import { staticHostingEnabled, wclIntegrationEnabled } from 'config/staticHosting';

const reportRoutes = () => (
  <>
    <Route index lazy={() => import('./routes/report/overview')} />
    <Route path="overview" lazy={() => import('./routes/report/overview')} />
    <Route path="statistics" lazy={() => import('./routes/report/statistics')} />
    <Route path="timeline" lazy={() => import('./routes/report/timeline')} />
    <Route path="events" lazy={() => import('./routes/report/events')} />
    <Route path="debug" lazy={() => import('./routes/report/debug')} />
    <Route path="character" lazy={() => import('./routes/report/character')} />
    <Route path="about" lazy={() => import('./routes/report/about')} />
    <Route path=":resultTab" lazy={() => import('./routes/report/dynamic')} />
  </>
);

const appRoutes = createRoutesFromElements(
  <Route path="/" element={<AppLayout />} errorElement={<RouterErrorBoundary />}>
    {!staticHostingEnabled && wclIntegrationEnabled && (
      <>
        <Route path="character/:region/:realm/:name" lazy={() => import('./routes/character')} />
        <Route path="guild/:region/:realm/:name" lazy={() => import('./routes/guild')} />
      </>
    )}
    {wclIntegrationEnabled && (
      <Route path="report/:reportCode/:fightId?/:player?/:build?" lazy={() => import('./report')}>
        {reportRoutes()}
      </Route>
    )}
    <Route path="local/:localReportId/:fightId?/:player?/:build?" lazy={() => import('./report')}>
      {reportRoutes()}
    </Route>
    <Route path="privacy" lazy={() => import('./routes/privacy')} />
    <Route element={<HomeLayout />}>
      <Route index lazy={() => import('./routes/local-import')} />
      {!staticHostingEnabled && <Route path="premium" lazy={() => import('./routes/premium')} />}
      <Route path="about" lazy={() => import('./routes/about')} />
      <Route path="help-wanted" lazy={() => import('./routes/help-wanted')} />
      <Route path="contributor/:id" lazy={() => import('./routes/contributor')} />
      {!staticHostingEnabled && wclIntegrationEnabled && (
        <Route path="search/:searchTerm?" lazy={() => import('./routes/search')} />
      )}
      <Route path="local-import" lazy={() => import('./routes/local-import')} />
      <Route path="*" lazy={() => import('./routes/not-found')} />
    </Route>
    {!staticHostingEnabled && wclIntegrationEnabled && (
      <Route path="support-stats" lazy={() => import('./routes/support-stats')} />
    )}
  </Route>,
);

const sentryCreateBrowserRouter = import.meta.env.VITE_SENTRY_DSN
  ? wrapCreateBrowserRouterV6(createBrowserRouter)
  : createBrowserRouter;
const router =
  import.meta.env.MODE === 'test'
    ? createMemoryRouter(appRoutes)
    : staticHostingEnabled
      ? createHashRouter(appRoutes)
      : sentryCreateBrowserRouter(appRoutes);

const App = () => {
  const provider = <RouterProvider router={router} />;
  return wclIntegrationEnabled ? <WclOAuthCallbackGate>{provider}</WclOAuthCallbackGate> : provider;
};

export default App;
