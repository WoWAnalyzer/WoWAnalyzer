import Ad, { Location } from 'interface/Ad';
import ErrorBoundary from 'interface/ErrorBoundary';
import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';
import HelpWantedIcon from 'interface/icons/Information';
import NewsIcon from 'interface/icons/Megaphone';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import NavigationBar from 'interface/NavigationBar';
import { hasPremium } from 'interface/selectors/user';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useWaSelector } from 'interface/utils/useWaSelector';

import './Home.scss';
import ReportSelectionHeader from './ReportSelectionHeader';

const pages = [
  {
    icon: NewsIcon,
    name: <>News</>,
    url: 'news',
  },
  {
    icon: FingerprintFilledIcon,
    name: <>Specs</>,
    url: 'specs',
  },
  {
    icon: Logo,
    name: <>About</>,
    url: 'about',
  },
  {
    icon: PremiumIcon,
    name: <>Premium</>,
    url: 'premium',
  },
  {
    icon: HelpWantedIcon,
    name: <>Help wanted</>,
    url: 'help-wanted',
  },
];

const Home = () => {
  const premium = useWaSelector((state) => hasPremium(state));
  const location = useLocation();

  const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

  return (
    <div className="home-page">
      <NavigationBar style={{ margin: 0, position: 'static' }} />

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
                    <Link to={page.url}>{content}</Link>
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
};

export default Home;
