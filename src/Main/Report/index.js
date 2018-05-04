import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { ApiDownError, CorruptResponseError, JsonParseError, LogNotFoundError } from 'common/fetchWcl';
import fetchEvents from 'common/fetchEvents';
import { captureException } from 'common/errorLogger';
import getFightName from 'common/getFightName';
import { getCombatants } from 'selectors/combatants';
import { getError } from 'selectors/error';
import { getFightId, getPlayerId, getPlayerName, getReportCode } from 'selectors/url/report';
import { getArticleId } from 'selectors/url/news';
import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';
import { fetchReport } from 'actions/report';
import { setReportProgress } from 'actions/reportProgress';
import { fetchCombatants } from 'actions/combatants';
import { apiDownError, reportNotFoundError, unknownError, unknownNetworkIssueError } from 'actions/error';
import { appendReportHistory } from 'actions/reportHistory';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import makeAnalyzerUrl from 'Main/makeAnalyzerUrl';

import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';
import ActivityIndicator from '../ActivityIndicator';
import FightNavigationBar from './FightNavigationBar';

const timeAvailable = console.time && console.timeEnd;

const PROGRESS_STEP1_INITIALIZATION = 0.02;
const PROGRESS_STEP2_FETCH_EVENTS = 0.13;
const PROGRESS_STEP3_PARSE_EVENTS = 0.99;
const PROGRESS_COMPLETE = 1.0;

/* eslint-disable no-alert */

class Report extends React.Component {
  static propTypes = {
    reportCode: PropTypes.string,
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
    setReportProgress: PropTypes.func.isRequired,
    fetchCombatants: PropTypes.func.isRequired,
    reportNotFoundError: PropTypes.func.isRequired,
    apiDownError: PropTypes.func.isRequired,
    unknownNetworkIssueError: PropTypes.func.isRequired,
    unknownError: PropTypes.func.isRequired,
    appendReportHistory: PropTypes.func.isRequired,
  };
  static childContextTypes = {
    config: PropTypes.object,
  };
  state = {
    finished: false,
    config: null,
  };

  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  // Parsing a fight for a player is a "job", if the selected player or fight changes we want to stop parsing it. This integer gives each job an id that if it mismatches stops the job.
  _jobId = 0;
  get isReportValid() {
    return this.props.report && this.props.report.code === this.props.reportCode;
  }
  getConfig(specId) {
    return AVAILABLE_CONFIGS.find(config => config.spec.id === specId);
  }
  createParser(ParserClass, report, fight, player) {
    const playerPets = this.getPlayerPetsFromReport(report, player.id);

    return new ParserClass(report, player, playerPets, fight);
  }
  async setStatePromise(newState) {
    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });
  }
  async fetchEventsAndParse(report, fight, combatants, combatant, player) {
    // We use the setState callback for triggering UI updates to allow our CSS animations to work

    this.reset();
    this.props.setReportProgress(0);
    const config = this.getConfig(combatant.specID);
    timeAvailable && console.time('full parse');
    const parserClass = await config.parser();
    const parser = this.createParser(parserClass, report, fight, player);
    // We send combatants already to the analyzer so it can show the results page with the correct items and talents while waiting for the API request
    parser.initialize(combatants);
    await this.setStatePromise({
      config,
      parser,
    });
    this.props.setReportProgress(PROGRESS_STEP1_INITIALIZATION);
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
      // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
      events = events.filter(event => event.type !== 'combatantinfo');
      events = parser.normalize(events);
      this.props.setReportProgress(PROGRESS_STEP2_FETCH_EVENTS);

      const batchSize = 300;
      const numEvents = events.length;
      let offset = 0;

      timeAvailable && console.time('player event parsing');
      while (offset < numEvents) {
        if (this._jobId !== jobId) {
          return;
        }
        const eventsBatch = events.slice(offset, offset + batchSize);
        parser.parseEvents(eventsBatch);
        const progress = Math.min(1, (offset + batchSize) / numEvents);
        this.props.setReportProgress(PROGRESS_STEP2_FETCH_EVENTS + (PROGRESS_STEP3_PARSE_EVENTS - PROGRESS_STEP2_FETCH_EVENTS) * progress);
        // await-ing setState does not ensure we wait until a render completed, so instead we wait 1 frame
        await this.timeout(0);

        offset += batchSize;
      }
      timeAvailable && console.timeEnd('player event parsing');

      parser.fabricateEvent({
        type: 'finished',
      });
      timeAvailable && console.timeEnd('full parse');
      this.props.setReportProgress(PROGRESS_COMPLETE);
      this.setState({
        finished: true,
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
      this.props.setReportProgress(PROGRESS_STEP1_INITIALIZATION + ((PROGRESS_STEP2_FETCH_EVENTS - PROGRESS_STEP1_INITIALIZATION) * progress));
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
      finished: false,
    });
    this.props.setReportProgress(null);
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
  }
  fetchReportIfNecessary(prevProps) {
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
        this.appendHistory(report, fight, player);
      }
    }
  }
  getPlayerFromReport(report, playerId, playerName) {
    if (playerId) {
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
  appendHistory(report, fight, player) {
    this.props.appendReportHistory({
      code: report.code,
      title: report.title,
      start: Math.floor(report.start / 1000),
      end: Math.floor(report.end / 1000),
      fightId: fight.id,
      fightName: getFightName(report, fight),
      playerId: player.id,
      playerName: player.name,
      playerClass: player.type,
    });
  }

  render() {
    const { report, fightId, playerName } = this.props;

    if (!report) {
      return <ActivityIndicator text="Pulling report info..." />;
    }
    if (!fightId) {
      return <FightSelecter />;
    }
    if (!playerName) {
      return <PlayerSelecter />;
    }

    const { parser } = this.state;
    return (
      <React.Fragment>
        <FightNavigationBar />
        <div style={{ marginLeft: 60 }}>
          {!parser && <ActivityIndicator text="Initializing analyzer..." />}
          {parser && (
            <Results
              parser={parser}
              finished={this.state.finished}
              makeTabUrl={tab => makeAnalyzerUrl(report, parser.fightId, parser.playerId, tab)}
            />
          )}
        </div>
      </React.Fragment>
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
    fetchReport,
    setReportProgress,
    fetchCombatants,
    reportNotFoundError,
    apiDownError,
    unknownNetworkIssueError,
    unknownError,
    appendReportHistory,
  }
)(Report);
