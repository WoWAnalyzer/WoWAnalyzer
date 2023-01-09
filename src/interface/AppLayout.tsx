import { useDispatch } from 'react-redux';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { isInternetExplorer } from 'interface/selectors/internetExplorer';
import { getOpenModals } from 'interface/selectors/openModals';
import { useEffect } from 'react';
import { internetExplorer } from 'interface/actions/internetExplorer';
import { fetchUser } from 'interface/actions/user';
import TooltipProvider from 'interface/TooltipProvider';
import FullscreenError from 'interface/FullscreenError';
import { t } from '@lingui/macro';
import { Outlet } from 'react-router-dom';
import Footer from 'interface/Footer';
import PortalTarget from 'interface/PortalTarget';
import Hotkeys from 'interface/Hotkeys';
import 'react-toggle/style.css';

import './App.scss';

function detectInternetExplorer() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.includes('msie') || myNav.includes('trident');
}

const AppLayout = () => {
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
        {!isIE && <Outlet />}
      </div>
      {!isIE && <Footer />}

      <PortalTarget />
      <Hotkeys />
    </>
  );
};

export default AppLayout;
