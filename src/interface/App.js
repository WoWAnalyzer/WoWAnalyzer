import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import lazyLoadComponent from 'common/lazyLoadComponent';
import TooltipProvider from 'interface/common/TooltipProvider/index';
import retryingPromise from 'common/retryingPromise';
import {
  API_DOWN,
  clearError,
  INTERNET_EXPLORER,
  internetExplorerError,
  REPORT_NOT_FOUND,
  UNKNOWN_NETWORK_ISSUE,
} from 'interface/actions/error';
import { fetchUser } from 'interface/actions/user';
import { getError } from 'interface/selectors/error';
import { getOpenModals } from 'interface/selectors/openModals';
import { i18n } from 'interface/RootLocalizationProvider';
import { t } from '@lingui/macro';
import ApiDownBackground from 'interface/common/images/api-down-background.gif';
import FullscreenError from 'interface/FullscreenError';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import Footer from 'interface/layout/Footer/index';
import HomePage from 'interface/home/Page';
import ThunderSoundEffect from 'interface/audio/Thunder Sound effect.mp3';
import ReportPage from 'interface/report';
import PortalTarget from 'interface/PortalTarget';

import 'react-toggle/style.css';
import './layout/App.scss';
import Hotkeys from './Hotkeys';

const CharacterPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'CharacterPage' */ 'interface/CharacterPage').then(
      exports => exports.default,
    ),
  ),
);
const GuildPage = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'GuildPage' */ 'interface/GuildPage').then(
      exports => exports.default,
    ),
  ),
);

function isIE() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.includes('msie') || myNav.includes('trident');
}

class App extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    error: PropTypes.shape({
      error: PropTypes.string.isRequired,
      details: PropTypes.any,
    }),
    clearError: PropTypes.func.isRequired,
    internetExplorerError: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    openModals: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    if (isIE()) {
      props.internetExplorerError();
    }

    TooltipProvider.load();
    if (process.env.REACT_APP_FORCE_PREMIUM !== 'true') {
      // If Premium is forced (development environments), fetching the user would probably fail too
      props.fetchUser();
    }
  }

  renderError(error) {
    if (error.error === API_DOWN) {
      return (
        <FullscreenError
          error={i18n._(t('fullScreenError.apiDown.error')`The API is down.`)}
          details="This is usually because we're leveling up with another patch."
          background={ApiDownBackground}
        >
          <div className="text-muted">
            Aside from the great news that you'll be the first to experience something new that is
            probably going to pretty amazing, you'll probably also enjoy knowing that our updates
            usually only take about 10 seconds. So just{' '}
            <a href={window.location.href}>give it another try</a>.
          </div>
          {/* I couldn't resist */}
          <audio autoPlay>
            <source src={ThunderSoundEffect} />
          </audio>
        </FullscreenError>
      );
    }
    if (error.error === REPORT_NOT_FOUND) {
      return (
        <FullscreenError
          error={i18n._(t('home.reportSelector.search')`Report not found.`)}
          details="Either you entered a wrong report, or it is private."
          background="https://media.giphy.com/media/DAgxA6qRfa5La/giphy.gif"
        >
          <div className="text-muted">
            Private logs can not be used, if your guild has private logs you will have to{' '}
            <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change
            the existing logs to the <i>unlisted</i> privacy option instead.
          </div>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                this.props.clearError();
                this.props.history.push(makeAnalyzerUrl());
              }}
            >
              &lt; Back
            </button>
          </div>
        </FullscreenError>
      );
    }
    if (error.error === UNKNOWN_NETWORK_ISSUE) {
      return (
        <FullscreenError
          error={i18n._(t('fullScreenError.error')`An API error occured.`)}
          details="Something went wrong talking to our servers, please try again."
          background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
        >
          <div className="text-muted">{error.details.message}</div>
          <div>
            <a className="btn btn-primary" href={window.location.href}>
              Refresh
            </a>
          </div>
        </FullscreenError>
      );
    }
    if (error.error === INTERNET_EXPLORER) {
      return (
        <FullscreenError
          error={i18n._(t('home.internetExplorer.error')`A wild INTERNET EXPLORER appeared!`)}
          details="This browser is too unstable for WoWAnalyzer to work properly."
          background="https://media.giphy.com/media/njYrp176NQsHS/giphy.gif"
        >
          {/* Lower case the button so it doesn't seem to aggressive */}
          <a
            className="btn btn-primary"
            href="http://outdatedbrowser.com/"
            style={{ textTransform: 'none' }}
          >
            Download a proper browser
          </a>
        </FullscreenError>
      );
    }
    return (
      <FullscreenError
        error={i18n._(t('home.unknown.error')`An unknown error occured.`)}
        details={error.details.message || error.details}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.props.clearError();
              this.props.history.push(makeAnalyzerUrl());
            }}
          >
            &lt; Back
          </button>
        </div>
      </FullscreenError>
    );
  }
  renderContent() {
    const { error } = this.props;

    if (error) {
      return this.renderError(error);
    }

    return (
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
        <Route path="/report/:reportCode?/:fightId?/:player?/:resultTab?" component={ReportPage} />
        <Route component={HomePage} />
      </Switch>
    );
  }

  render() {
    const { error, openModals } = this.props;

    return (
      <>
        <div className={`app ${openModals > 0 ? 'modal-open' : ''}`}>{this.renderContent()}</div>
        {!error && <Footer />}

        <PortalTarget />
        <Hotkeys />
      </>
    );
  }
}

const mapStateToProps = state => ({
  error: getError(state),
  openModals: getOpenModals(state),
});

const ConnectedComponent = connect(mapStateToProps, {
  clearError,
  internetExplorerError,
  fetchUser,
})(App);

// This needs the `withRouter` so its props change (causing a render) when the route changes
export default withRouter(ConnectedComponent);
