import { t } from '@lingui/macro';
import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import { fetchUser } from 'interface/actions/user';
import Footer from 'interface/Footer';
import FullscreenError from 'interface/FullscreenError';
import HomePage from 'interface/Home';
import PortalTarget from 'interface/PortalTarget';
import PrivacyPage from 'interface/PrivacyPage';
import ReportPage from 'interface/report';
import { getOpenModals } from 'interface/selectors/openModals';
import TooltipProvider from 'interface/TooltipProvider';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import 'react-toggle/style.css';
import './App.scss';
import Hotkeys from './Hotkeys';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { internetExplorer } from 'interface/actions/internetExplorer';
import { isInternetExplorer } from 'interface/selectors/internetExplorer';

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

function detectInternetExplorer() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.includes('msie') || myNav.includes('trident');
}

const App = () => {
  const dispatch = useDispatch();
  const isIE = useWaSelector((state) => isInternetExplorer(state));
  const openModals = useWaSelector((state) => getOpenModals(state));

  useEffect(() => {
    if (detectInternetExplorer()) {
      dispatch(internetExplorer());
    }
    if (process.env.REACT_APP_FORCE_PREMIUM !== 'true') {
      // If Premium is forced (development environments), fetching the user would probably fail too
      dispatch(fetchUser());
    }
  }, [dispatch]);

  useEffect(() => {
    TooltipProvider.load();
  }, []);

  return (
    <>
      <div className={`app ${openModals > 0 ? 'modal-open' : ''}`}>
        {isIE && (
          <FullscreenError
            error={t({
              id: 'home.internetExplorer.error',
              message: `A wild INTERNET EXPLORER appeared!`,
            })}
            details="This browser is too unstable for WoWAnalyzer to work properly."
            background="https://media.giphy.com/media/njYrp176NQsHS/giphy.gif"
          >
            {/* Lower case the button so it doesn't seem to aggressive */}
            <a
              className="btn btn-primary"
              href="https://outdatedbrowser.com/"
              style={{ textTransform: 'none' }}
            >
              Download a proper browser
            </a>
          </FullscreenError>
        )}
        {!isIE && (
          <Switch>
            <Route
              path="/character/:region/:realm/:name"
              render={({ match }) => (
                <CharacterPage
                  region={decodeURI(match.params.region.replace(/\+/g, ' ')).toUpperCase()}
                  realm={decodeURI(match.params.realm.replace(/\+/g, ' '))}
                  name={decodeURI(match.params.name.replace(/\+/g, ' '))}
                />
              )}
            />
            <Route
              path="/guild/:region/:realm/:name"
              render={({ match }) => (
                <GuildPage
                  region={decodeURI(match.params.region.replace(/\+/g, ' ')).toUpperCase()}
                  realm={decodeURI(match.params.realm.replace(/\+/g, ' '))}
                  name={decodeURI(match.params.name.replace(/\+/g, ' '))}
                />
              )}
            />
            <Route
              path="/report/:reportCode?/:fightId?/:player?/:resultTab?"
              component={ReportPage}
            />
            <Route path="/privacy" component={PrivacyPage} />
            <Route component={HomePage} />
          </Switch>
        )}
      </div>
      {!isIE && <Footer />}

      <PortalTarget />
      <Hotkeys />
    </>
  );
};
export default App;
