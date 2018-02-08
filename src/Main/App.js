import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { push as pushAction } from 'react-router-redux';
import { Link } from 'react-router-dom';

import { ApiDownError, LogNotFoundError, CorruptResponseError, JsonParseError } from 'common/fetchWcl';
import fetchEvents from 'common/fetchEvents';
import { captureException } from 'common/errorLogger';
import Wrapper from 'common/Wrapper';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import UnsupportedSpec from 'Parser/UnsupportedSpec/CONFIG';

import { fetchReport as fetchReportAction } from 'actions/report';
import { fetchCombatants as fetchCombatantsAction } from 'actions/combatants';
import { getReportCode, getFightId, getPlayerId, getPlayerName } from 'selectors/url/report';
import { getArticleId } from 'selectors/url/news';
import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';
import { getCombatants } from 'selectors/combatants';
import { clearError, reportNotFoundError, apiDownError, unknownNetworkIssueError, unknownError, internetExplorerError, API_DOWN, REPORT_NOT_FOUND, UNKNOWN_NETWORK_ISSUE, INTERNET_EXPLORER } from 'actions/error';
import { getError } from 'selectors/error';

import 'react-toggle/style.css';
import './App.css';

import ApiDownBackground from './Images/api-down-background.gif';
import ThunderSoundEffect from './Audio/Thunder Sound effect.mp3';

import Home from './Home';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';
import ReportSelecter from './ReportSelecter';
import FullscreenError from './FullscreenError';
import NavigationBar from './Layout/NavigationBar';
import DocumentTitleUpdater from './Layout/DocumentTitleUpdater';
import Footer from './Layout/Footer';
import NewsView from './News/View';
import { default as makeNewsUrl } from './News/makeUrl';
import { title as AboutArticleTitle } from './News/Articles/2017-01-31-About';
import { title as UnlistedLogsTitle } from './News/Articles/2017-01-31-UnlistedLogs';

import makeAnalyzerUrl from './makeAnalyzerUrl';
import ServiceStatus from './ServiceStatus';

const timeAvailable = console.time && console.timeEnd;

const PROGRESS_STEP1_INITIALIZATION = 0.02;
const PROGRESS_STEP2_FETCH_EVENTS = 0.13;
const PROGRESS_STEP3_PARSE_EVENTS = 0.99;

/* eslint-disable no-alert */

function isIE() {
  const myNav = navigator.userAgent.toLowerCase();
  return myNav.indexOf('msie') !== -1 || myNav.indexOf('trident') !== -1;
}

class App extends Component {
  static propTypes = {
    reportCode: PropTypes.string,
    articleId: PropTypes.string,
    playerName: PropTypes.string,
    playerId: PropTypes.number,
    fightId: PropTypes.number,
    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }),
    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
    })),
    fetchReport: PropTypes.func.isRequired,
    fetchCombatants: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,

    error: PropTypes.shape({
      error: PropTypes.string.isRequired,
      details: PropTypes.any,
    }),
    clearError: PropTypes.func.isRequired,
    reportNotFoundError: PropTypes.func.isRequired,
    apiDownError: PropTypes.func.isRequired,
    unknownNetworkIssueError: PropTypes.func.isRequired,
    unknownError: PropTypes.func.isRequired,
    internetExplorerError: PropTypes.func.isRequired,
  };
  static childContextTypes = {
    config: PropTypes.object,
  };

  // Parsing a fight for a player is a "job", if the selected player or fight changes we want to stop parsing it. This integer gives each job an id that if it mismatches stops the job.
  _jobId = 0;
  get isReportValid() {
    return this.props.report && this.props.report.code === this.props.reportCode;
  }

  getPlayerFromReport(report, playerId, playerName) {
    if(playerId){
      return report.friendlies.find(friendly => friendly.id === playerId);
    }
    const fetchByNameAttempt = report.friendlies.find(friendly => friendly.name === playerName);
    if (!fetchByNameAttempt) {
      return report.friendlies.find(friendly => friendly.id === Number(playerName));
    }
    return fetchByNameAttempt;
  }
  getPlayerPetsFromReport(report, playerId) {
    return report.friendlyPets.filter(pet => pet.petOwner === playerId);
  }

  constructor(props) {
    super();
    this.state = {
      progress: 0,
      dataVersion: 0,
      bossId: null,
      config: null,
    };

    if (isIE()) {
      props.internetExplorerError();
    }
  }
  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  getConfig(specId) {
    let config = AVAILABLE_CONFIGS.find(config => config.spec.id === specId);
    if (!config) {
      config = UnsupportedSpec;
    }
    return config;
  }
  createParser(ParserClass, report, fight, player) {
    const playerPets = this.getPlayerPetsFromReport(report, player.id);

    return new ParserClass(report, player, playerPets, fight);
  }
  async fetchEventsAndParse(report, fight, combatants, combatant, player) {
    // We use the setState callback for triggering UI updates to allow our CSS animations to work

    await this.setStatePromise({
      progress: 0,
    });
    const config = this.getConfig(combatant.specID);
    timeAvailable && console.time('full parse');
    const parser = this.createParser(config.parser, report, fight, player);
    // We send combatants already to the analyzer so it can show the results page with the correct items and talents while waiting for the API request
    parser.initialize(combatants);
    await this.setStatePromise({
      config,
      parser,
      progress: PROGRESS_STEP1_INITIALIZATION,
    });
    await this.parse(parser, report, player, fight);
  }
  async parse(parser, report, player, fight) {
    this._jobId += 1;
    const jobId = this._jobId;
    let events;
    try {
      this.startFakeNetworkProgress();
      events = await fetchEvents(report.code, fight.start_time, fight.end_time, player.id);
      this.stopFakeNetworkProgress();
    } catch (err) {
      this.stopFakeNetworkProgress();
      if (err instanceof LogNotFoundError) {
        this.props.reportNotFoundError();
      } else if (err instanceof ApiDownError) {
        this.props.apiDownError();
      } else if (err instanceof JsonParseError) {
        captureException(err);
        this.props.unknownError('JSON parse error, the API response is probably corrupt. Let us know on Discord and we may be able to fix it for you.');
      } else {
        // Some kind of network error, internet may be down.
        captureException(err);
        this.props.unknownNetworkIssueError(err);
      }
      return;
    }
    try {
      events = parser.normalize(events);
      await this.setStatePromise({
        progress: PROGRESS_STEP2_FETCH_EVENTS,
      });

      const batchSize = 400;
      const numEvents = events.length;
      let offset = 0;

      while (offset < numEvents) {
        if (this._jobId !== jobId) {
          return;
        }
        const eventsBatch = events.slice(offset, offset + batchSize);
        parser.parseEvents(eventsBatch);
        // await-ing setState does not ensure we wait until a render completed, so instead we wait 1 frame
        const progress = Math.min(1, (offset + batchSize) / numEvents);
        this.setState({
          progress: PROGRESS_STEP2_FETCH_EVENTS + (PROGRESS_STEP3_PARSE_EVENTS - PROGRESS_STEP2_FETCH_EVENTS) * progress,
          dataVersion: this.state.dataVersion + 1, // each time we parsed events we want to refresh the report, progress might not have updated
        });
        await this.timeout(1000 / 60);

        offset += batchSize;
      }

      parser.triggerEvent('finished');
      timeAvailable && console.timeEnd('full parse');
      this.setState({
        progress: 1.0,
      });
    } catch (err) {
      captureException(err);
      if (process.env.NODE_ENV === 'development') {
        // Something went wrong during the analysis of the log, there's probably an issue in your analyzer or one of its modules.
        throw err;
      } else {
        alert(`The report could not be parsed because an error occured while running the analysis. ${err.message}`);
      }
    }
  }
  _isFakeNetworking = false;
  async startFakeNetworkProgress() {
    this._isFakeNetworking = true;
    const expectedDuration = 5000;
    const stepInterval = 50;

    const jobId = this._jobId;

    let step = 1;
    while (this._isFakeNetworking) {
      if (this._jobId !== jobId) {
        // This could happen when switching players/fights while still loading another one
        break;
      }
      const progress = Math.min(1, step * stepInterval / expectedDuration);
      this.setState({
        progress: PROGRESS_STEP1_INITIALIZATION + ((PROGRESS_STEP2_FETCH_EVENTS - PROGRESS_STEP1_INITIALIZATION) * progress),
      });
      await this.timeout(stepInterval);
      step += 1;
    }
  }
  stopFakeNetworkProgress() {
    this._isFakeNetworking = false;
  }
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchCombatantsForFight(report, fight) {
    try {
      await this.props.fetchCombatants(report.code, fight.start_time, fight.end_time);
    } catch (err) {
      // TODO: Redirect to homepage
      this.reset();
      if (err instanceof LogNotFoundError) {
        this.props.reportNotFoundError();
      } else if (err instanceof ApiDownError) {
        this.props.apiDownError();
      } else if (err instanceof JsonParseError) {
        captureException(err);
        this.props.unknownError('JSON parse error, the API response is probably corrupt. Let us know on Discord and we may be able to fix it for you.');
      } else {
        // Some kind of network error, internet may be down.
        captureException(err);
        this.props.unknownNetworkIssueError(err);
      }
    }
  }

  reset() {
    this._jobId += 1;
    this.setState({
      config: null,
      parser: null,
      progress: 0,
    });
    this.stopFakeNetworkProgress();
  }

  componentWillMount() {
    this.fetchReportIfNecessary({});
  }
  componentDidUpdate(prevProps, prevState) {
    ReactTooltip.rebuild();

    this.fetchReportIfNecessary(prevProps);
    this.fetchCombatantsIfNecessary(prevProps, prevState);
    this.fetchEventsAndParseIfNecessary(prevProps, prevState);
    this.updateBossIdIfNecessary(prevProps, prevState);
  }
  fetchReportIfNecessary(prevProps) {
    if (this.props.error || isIE()) {
      return;
    }
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      this.props.fetchReport(this.props.reportCode)
        .catch(err => {
          this.reset();
          if (err instanceof LogNotFoundError) {
            this.props.reportNotFoundError();
          } else if (err instanceof ApiDownError) {
            this.props.apiDownError();
          } else if (err instanceof CorruptResponseError) {
            captureException(err);
            this.props.unknownError('Corrupt Warcraft Logs API response received, this report can not be processed.');
          } else if (err instanceof JsonParseError) {
            captureException(err);
            this.props.unknownError('JSON parse error, the API response is probably corrupt. Let us know on Discord and we may be able to fix it for you.');
          } else {
            // Some kind of network error, internet may be down.
            captureException(err);
            this.props.unknownNetworkIssueError(err);
          }
        });
    }
  }
  fetchCombatantsIfNecessary(prevProps, prevState) {
    if (this.isReportValid && this.props.fight && (this.props.report !== prevProps.report || this.props.fight !== prevProps.fight)) {
      // A report has been loaded, it is the report the user wants (this can be a mismatch if a new report is still loading), a fight was selected, and one of the fight-relevant things was changed
      this.fetchCombatantsForFight(this.props.report, this.props.fight);
    }
  }
  fetchEventsAndParseIfNecessary(prevProps, prevState) {
    const changed = this.props.report !== prevProps.report
      || this.props.combatants !== prevProps.combatants
      || this.props.fightId !== prevProps.fightId
      || this.props.playerName !== prevProps.playerName
      || this.props.playerId !== prevProps.playerId;
    if (changed) {
      this.reset();

      const report = this.props.report;
      const fight = this.props.fight;
      const combatants = this.props.combatants;
      const playerId = this.props.playerId;
      const playerName = this.props.playerName;
      const valid = report && fight && combatants && (playerName || playerId);
      if (valid) {
        const player = this.getPlayerFromReport(report, playerId, playerName);
        if (!player) {
          alert(`Unknown player: ${playerName}`);
          return;
        }
        const combatant = combatants.find(combatant => combatant.sourceID === player.id);
        if (!combatant) {
          alert('This player does not seem to be in this fight.');
          return;
        }
        this.fetchEventsAndParse(report, fight, combatants, combatant, player);
      }
    }
  }
  updateBossIdIfNecessary(prevProps, prevState) {
    if (this.props.reportCode !== prevProps.reportCode || this.props.report !== prevProps.report || this.props.fightId !== prevProps.fightId) {
      this.updateBossId();
    }
  }

  updateBossId() {
    this.setState({
      bossId: (this.props.reportCode && this.isReportValid && this.props.fight && this.props.fight.boss) || null,
    });
  }

  renderContent() {
    const { parser } = this.state;
    const { report, error } = this.props;

    if (error) {
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

    if (this.props.articleId) {
      return (
        <NewsView articleId={this.props.articleId} />
      );
    }

    if (!this.props.reportCode) {
      return <Home />;
    }

    if (!report) {
      return (
        <div className="container">
          <h1>Fetching report information...</h1>

          <div className="spinner" />
        </div>
      );
    }
    if (!this.props.fightId) {
      return <FightSelecter />;
    }
    if (!this.props.playerName) {
      return <PlayerSelecter />;
    }
    if (!parser) {
      return (
        <div className="container">
          <h1>Initializing...</h1>

          <div className="spinner" />
        </div>
      );
    }

    return (
      <Results
        parser={parser}
        dataVersion={this.state.dataVersion}
        onChangeTab={newTab => this.props.push(makeAnalyzerUrl(report, this.props.fightId, this.props.playerName, newTab))}
      />
    );
  }

  async setStatePromise(newState) {
    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    const { reportCode, error } = this.props;
    const { parser, progress } = this.state;

    // Treat `fatalError` like it's a report so the header doesn't pop over the shown error
    const hasReport = reportCode || this.props.error;

    return (
      <Wrapper>
        <div className={`app ${hasReport ? 'has-report' : ''}`}>
          <NavigationBar
            parser={parser}
            progress={progress}
          />
          <header>
            <div className="container image-overlay">
              <div className="row">
                <div className="col-lg-6 col-md-10">
                  <h1>WoW&shy;Analyzer</h1>
                  <div className="description">
                    Analyze your raid logs to get personal suggestions and metrics to improve your performance. Just enter a Warcraft Logs report:
                  </div>
                  {!hasReport && (
                    <ReportSelecter />
                  )}
                  {process.env.NODE_ENV !== 'test' && <ServiceStatus style={{ marginBottom: 5 }} />}
                  <div className="about">
                    <Link to={makeNewsUrl(AboutArticleTitle)}>About WoWAnalyzer</Link>
                    {' '}| <Link to={makeNewsUrl(UnlistedLogsTitle)}>About unlisted logs</Link>
                    {' '}| <a href="https://discord.gg/AxphPxU">Join Discord</a>
                    {' '}| <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">View source</a>
                    {' '}| <a href="https://www.patreon.com/wowanalyzer">Become a Patron</a>
                    {' '}| <a href="https://status.wowanalyzer.com/">Status</a>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main>
            {this.renderContent()}
          </main>

          <ReactTooltip html place="bottom" />
          <DocumentTitleUpdater />
        </div>
        {!error && <Footer />}
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  const fightId = getFightId(state);

  return ({
    reportCode: getReportCode(state),
    fightId,
    playerName: getPlayerName(state),
    playerId: getPlayerId(state),

    report: getReport(state),
    fight: getFightById(state, fightId),
    combatants: getCombatants(state),

    articleId: getArticleId(state),

    error: getError(state),
  });
};

export default connect(
  mapStateToProps,
  {
    fetchReport: fetchReportAction,
    fetchCombatants: fetchCombatantsAction,
    push: pushAction,
    clearError,
    reportNotFoundError,
    apiDownError,
    unknownNetworkIssueError,
    unknownError,
    internetExplorerError,
  }
)(App);
