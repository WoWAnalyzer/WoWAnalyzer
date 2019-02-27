import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';

import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import NewsIcon from 'interface/icons/Megaphone';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import FingerprintFilledIcon from 'interface/icons/FingerprintFilled';
import HelpWantedIcon from 'interface/icons/Information';
import ReportSelectionIcon from 'interface/icons/Performance';
import { hasPremium } from 'interface/selectors/user';
import DocumentTitle from 'interface/common/DocumentTitle';

import './Home.scss';
import Header from '../Header';
import NotFound from './NotFound';

class Home extends React.PureComponent {
  static propTypes = {
    premium: PropTypes.bool,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };
  static defaultProps = {
    premium: false,
  };

  get pages() {
    return [
      {
        icon: NewsIcon,
        name: <Trans>News</Trans>,
        url: 'news',
        component: () => lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'News' */ 'interface/news').then(exports => exports.default))),
      },
      {
        icon: FingerprintFilledIcon,
        name: <Trans>Specs</Trans>,
        url: 'specs',
        component: () => lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'SpecListing' */ 'interface/home/SpecListing').then(exports => exports.default))),
      },
      {
        icon: PremiumIcon,
        name: <Trans>Premium</Trans>,
        url: 'premium',
        component: () => lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'Premium' */ 'interface/premium/Page').then(exports => exports.default))),
      },
      {
        icon: Logo,
        name: <Trans>About</Trans>,
        url: 'about',
        component: () => lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'About' */ 'interface/about').then(exports => exports.default))),
      },
      {
        icon: HelpWantedIcon,
        name: <Trans>Help wanted</Trans>,
        url: 'help-wanted',
        component: () => lazyLoadComponent(() => retryingPromise(() => import(/* webpackChunkName: 'HelpWanted' */ 'interface/helpwanted').then(exports => exports.default))),
      },
    ];
  }

  render() {
    const { premium, location } = this.props;
    const url = location.pathname === '/' ? 'news' : location.pathname.replace(/^\/|\/$/g, '');

    const page = this.pages.find(page => page.url === url);
    const Component = page && page.component ? page.component() : NotFound;

    return (
      <div className="container home-page">
        <DocumentTitle /> {/* prettiest is if the Home page has no title at all */}

        <Header />

        <nav>
          <ul>
            <li className="active">
              <a>
                <ReportSelectionIcon />
                Report selection
              </a>
            </li>
            {this.pages.map(page => {
              const Icon = page.icon;

              return (
                <li key={page.url} className={page.url === url ? 'active' : undefined}>
                  <Link to={page.url}>
                    <Icon className="icon" />
                    {page.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="row">
          <div className="col-lg-12">
            <Component />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(
  mapStateToProps
)(Home);
