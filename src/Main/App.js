import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { getLocation, push } from 'react-router-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import lazyLoadComponent from 'common/lazyLoadComponent';
import TooltipProvider from 'Interface/common/TooltipProvider';
import { track } from 'common/analytics';
// import RouteChangeScroller from 'Interface/RouteChangeScroller';
import { API_DOWN, clearError, INTERNET_EXPLORER, internetExplorerError, REPORT_NOT_FOUND, UNKNOWN_NETWORK_ISSUE } from 'Interface/actions/error';
import { fetchUser } from 'Interface/actions/user';
import { getError } from 'Interface/selectors/error';
import Home from 'Interface/Home';
import NewsView from 'Interface/News/View';
import Premium from 'Interface/Premium';
import ApiDownBackground from 'Interface/common/Images/api-down-background.gif';
import FullscreenError from 'Interface/common/FullscreenError';
import ErrorBoundary from 'Interface/common/ErrorBoundary';

import 'react-toggle/style.css';
import './App.css';

import ThunderSoundEffect from './Audio/Thunder Sound effect.mp3';

import NavigationBar from './Layout/NavigationBar';
import DocumentTitleUpdater from './Layout/DocumentTitleUpdater';
import Footer from './Layout/Footer';
import makeAnalyzerUrl from './makeAnalyzerUrl';
import Report from './Report';

import Header from './Header';

const ContributorDetails = lazyLoadComponent(() => import(/* webpackChunkName: 'ContributorDetails' */ 'Interface/Contributor/Details').then(exports => exports.default));
const CharacterParses = lazyLoadComponent(() => import(/* webpackChunkName: 'CharacterParses' */ 'Interface/Character/Parses').then(exports => exports.default));

function isIE() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.includes('msie') || myNav.includes('trident');
}

class App extends React.Component {
  static propTypes = {
    isHome: PropTypes.bool,
    push: PropTypes.func.isRequired,

    error: PropTypes.shape({
      error: PropTypes.string.isRequired,
      details: PropTypes.any,
    }),
    clearError: PropTypes.func.isRequired,
    internetExplorerError: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
    }).isRequired,
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
          error="The API is down."
          details="This is usually because we're leveling up with another patch."
          background={ApiDownBackground}
        >
          <div className="text-muted">
            Aside from the great news that you'll be the first to experience something new that is probably going to pretty amazing, you'll probably also enjoy knowing that our updates usually only take about 10 seconds. So just <a href={window.location.href}>give it another try</a>.
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
          error="Report not found."
          details="Either you entered a wrong report, or it is private."
          background="https://media.giphy.com/media/DAgxA6qRfa5La/giphy.gif"
        >
          <div className="text-muted">
            Private logs can not be used, if your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.
          </div>
          <div>
            <button type="button" className="btn btn-primary" onClick={() => {
              this.props.clearError();
              this.props.push(makeAnalyzerUrl());
            }}>
              &lt; Back
            </button>
          </div>
        </FullscreenError>
      );
    }
    if (error.error === UNKNOWN_NETWORK_ISSUE) {
      return (
        <FullscreenError
          error="An API error occured."
          details="Something went talking to our servers, please try again."
          background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
        >
          <div className="text-muted">
            {error.details.message}
          </div>
          <div>
            <a className="btn btn-primary" href={window.location.href}>Refresh</a>
          </div>
        </FullscreenError>
      );
    }
    if (error.error === INTERNET_EXPLORER) {
      return (
        <FullscreenError
          error="A wild INTERNET EXPLORER appeared!"
          details="This browser is too unstable for WoWAnalyzer to work properly."
          background="https://media.giphy.com/media/njYrp176NQsHS/giphy.gif"
        >
          {/* Lower case the button so it doesn't seem to aggressive */}
          <a className="btn btn-primary" href="http://outdatedbrowser.com/" style={{ textTransform: 'none' }}>Download a proper browser</a>
        </FullscreenError>
      );
    }
    return (
      <FullscreenError
        error="An unknown error occured."
        details={error.details.message || error.details}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button type="button" className="btn btn-primary" onClick={() => {
            this.props.clearError();
            this.props.push(makeAnalyzerUrl());
          }}>
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
          path="/contributor/:id"
          render={({ match }) => (
            <ContributorDetails
              contributorId={decodeURI(match.params.id.replace(/\+/g, ' '))}
              ownPage
            />
          )}
        />
        <Route
          path="/character/:region/:realm/:name"
          render={({ match }) => (
            <CharacterParses
              region={decodeURI(match.params.region.replace(/\+/g, ' '))}
              realm={decodeURI(match.params.realm.replace(/\+/g, ' '))}
              name={decodeURI(match.params.name.replace(/\+/g, ' '))}
            />
          )}
        />
        <Route
          path="/news/:articleId"
          render={({ match }) => (
            <NewsView articleId={decodeURI(match.params.articleId.replace(/\+/g, ' '))} />
          )}
        />
        <Route
          path="/report/:reportCode?/:fightId?/:player?/:resultTab?"
          component={Report}
        />
        <Route
          path="/premium"
          component={Premium}
        />
        <Route
          path="/"
          exact
          component={Home}
        />
      </Switch>
    );
  }

  get showReportSelecter() {
    return this.props.isHome && !this.props.error;
  }

  getPath(location) {
    return `${location.pathname}${location.search}`;
  }
  componentDidUpdate(prevProps) {
    // The primary reason to use this lifecycle method is so the document.title is updated in time
    if (prevProps.location !== this.props.location) {
      // console.log('Location changed. Old:', prevProps.location, 'new:', this.props.location);
      track(this.getPath(prevProps.location), this.getPath(this.props.location));
    }
  }

  render() {
    const { error } = this.props;

    return (
      <React.Fragment>
        <div className={`app ${this.showReportSelecter ? 'show-report-selecter' : ''}`}>
          <NavigationBar />
          <Header showReportSelecter={this.showReportSelecter} />
          <main>
            <ErrorBoundary>
              {this.renderContent()}
            </ErrorBoundary>
          </main>

          <ReactTooltip html place="bottom" />
          {/*<RouteChangeScroller />*/}
          <DocumentTitleUpdater />
        </div>
        {!error && <Footer />}
        <div id="portal" />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  error: getError(state),
  isHome: getLocation(state).pathname === '/', // createMatchSelector doesn't seem to be consistent
});

export default withRouter(connect(
  mapStateToProps,
  {
    push,
    clearError,
    internetExplorerError,
    fetchUser,
  }
)(App));
