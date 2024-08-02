import { Trans } from '@lingui/macro';
import Ad, { AdErrorBoundary, Location } from 'interface/Ad';
import ErrorBoundary from 'interface/ErrorBoundary';
import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';
import HelpWantedIcon from 'interface/icons/Information';
import NewsIcon from 'interface/icons/Megaphone';
import PremiumIcon from 'interface/icons/Premium';
import Logo from 'interface/images/logo.svg?react';
import NavigationBar from 'interface/NavigationBar';
import { hasPremium } from 'interface/selectors/user';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useWaSelector } from 'interface/utils/useWaSelector';

import './HomeLayout.scss';
import LanguageSwitcher from '../LanguageSwitcher';
import ReportSelectionHeader from '../ReportSelectionHeader';

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

export function HomeLayout() {
  const premium = useWaSelector((state) => hasPremium(state));
  const location = useLocation();

  const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

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
