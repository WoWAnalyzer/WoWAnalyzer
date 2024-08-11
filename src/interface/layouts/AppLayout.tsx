import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { isInternetExplorer } from 'interface/selectors/internetExplorer';
import { getOpenModalCount } from 'interface/selectors/openModals';
import { useEffect } from 'react';
import FullscreenError from 'interface/FullscreenError';
import { t } from '@lingui/macro';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Footer from 'interface/Footer';
import PortalTarget from 'interface/PortalTarget';
import Hotkeys from 'interface/Hotkeys';
import 'react-toggle/style.css';

import '../App.scss';
import { setInternetExplorer } from '../reducers/internetExplorer';
import { fetchUser } from '../reducers/user';
import { ProgressBar } from 'interface/ProgressBar';

function detectInternetExplorer() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.includes('msie') || myNav.includes('trident');
}

export function AppLayout() {
  const dispatch = useWaDispatch();
  const isIE = useWaSelector((state) => isInternetExplorer(state));
  const openModals = useWaSelector((state) => getOpenModalCount(state));

  useEffect(() => {
    if (detectInternetExplorer()) {
      dispatch(setInternetExplorer(true));
    }
    if (import.meta.env.VITE_FORCE_PREMIUM !== 'true') {
      // If Premium is forced (development environments), fetching the user would probably fail too
      dispatch(fetchUser());
    }
  }, [dispatch]);

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
        {!isIE && <Outlet />}
      </div>
      {!isIE && <Footer />}

      <PortalTarget />
      <Hotkeys />
      <ScrollRestoration />
      <ProgressBar />
    </>
  );
}
