import { Trans } from '@lingui/react/macro';
import Ad, { AdErrorBoundary, Location } from 'interface/Ad';
import ErrorBoundary from 'interface/ErrorBoundary';
import HelpWantedIcon from 'interface/icons/Information';
import PremiumIcon from 'interface/icons/Premium';
import Logo from 'interface/images/logo.svg?react';
import NavigationBar from 'interface/NavigationBar';
import { hasPremium } from 'interface/selectors/user';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useWaSelector } from 'interface/utils/useWaSelector';

import './HomeLayout.scss';
import LanguageSwitcher from '../LanguageSwitcher';
import ReportSelectionHeader from '../ReportSelectionHeader';
import { staticHostingEnabled } from 'config/staticHosting';

const pages = [
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

export function HomeLayout() {
  const premium = useWaSelector((state) => hasPremium(state));
  const location = useLocation();

  const url = location.pathname.replace(/^\/|\/$/g, '') || 'local-import';

  return (
    <div className="home-page">
      <NavigationBar style={{ margin: 0, position: 'static' }}>
        <LanguageSwitcher />
      </NavigationBar>

      <ReportSelectionHeader />

      {premium === false && (
        <AdErrorBoundary>
          <Ad location={Location.Top} style={{ marginTop: '-20px' }} />
        </AdErrorBoundary>
      )}

      <main className="container">
        <nav>
          <ul>
            {pages
              .filter((page) => !(staticHostingEnabled && page.url === 'premium'))
              .map((page) => {
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
                      <Link to={page.url} preventScrollReset>
                        {content}
                      </Link>
                    ) : (
                      <a href={page.url}>{content}</a>
                    )}
                  </li>
                );
              })}
          </ul>
        </nav>

        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
