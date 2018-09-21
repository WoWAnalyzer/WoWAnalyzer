import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { withRouter } from 'react-router-dom';

import { ApiDownError, JsonParseError, LogNotFoundError } from 'common/fetchWclApi';
import fetchEvents from 'common/fetchEvents';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { captureException } from 'common/errorLogger';
import getFightName from 'common/getFightName';
import { getCombatants } from 'Interface/selectors/combatants';
import { getError } from 'Interface/selectors/error';
import { getFightId, getFightName as getUrlFightName, getPlayerId, getPlayerName, getResultTab } from 'Interface/selectors/url/report';
import { getArticleId } from 'Interface/selectors/url/news';
import { getReport } from 'Interface/selectors/report';
import { getFightById } from 'Interface/selectors/fight';
import { setReportProgress } from 'Interface/actions/reportProgress';
import { fetchCombatants } from 'Interface/actions/combatants';
import { apiDownError, reportNotFoundError, unknownError, unknownNetworkIssueError } from 'Interface/actions/error';
import { appendReportHistory } from 'Interface/actions/reportHistory';
import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';
import ActivityIndicator from 'Interface/common/ActivityIndicator';
import DocumentTitle from 'Interface/common/DocumentTitle';
import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import REPORT_HISTORY_TYPES from 'Interface/Home/ReportHistory/REPORT_HISTORY_TYPES';

import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';
import FightNavigationBar from './FightNavigationBar';
import ReportFetcher from './ReportFetcher';

const timeAvailable = console.time && console.timeEnd;

const PROGRESS_STEP1_INITIALIZATION = 0.01;
const PROGRESS_STEP2_FETCH_EVENTS = 0.13;
const PROGRESS_STEP3_PARSE_EVENTS = 0.99;
const PROGRESS_COMPLETE = 1.0;

/* eslint-disable no-alert */

class Report extends React.Component {
  static propTypes = {
    playerId: PropTypes.number,
    urlPlayerName: PropTypes.string,
    fightId: PropTypes.number,
    urlFightName: PropTypes.string,
    resultTab: PropTypes.string,
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
    setReportProgress: PropTypes.func.isRequired,
    fetchCombatants: PropTypes.func.isRequired,
    reportNotFoundError: PropTypes.func.isRequired,
    apiDownError: PropTypes.func.isRequired,
    unknownNetworkIssueError: PropTypes.func.isRequired,
    unknownError: PropTypes.func.isRequired,
    appendReportHistory: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired, // adds to browser history
      replace: PropTypes.func.isRequired, // updates current browser history entry
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
      }).isRequired,
    }),
  };
  static childContextTypes = {
    config: PropTypes.object,
  };
  state = {
    finished: false,
    config: null,
    characterProfile: null,
  };

  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  // Parsing a fight for a player is a "job", if the selected player or fight changes we want to stop parsing it. This integer gives each job an id that if it mismatches stops the job.
  _jobId = 0;
  get isReportValid() {
    return !!this.props.report;
  }
  getConfig(specId) {
    return AVAILABLE_CONFIGS.find(config => config.spec.id === specId);
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
    this.startFakeNetworkProgress();
    const config = this.getConfig(combatant.specID);
    const exportedCharacter = report.exportedCharacters ? report.exportedCharacters.find(char => char.name === player.name) : null;
    let parserClass;
    let characterProfile;
    await Promise.all([
      config.parser().then(result => {
        parserClass = result;
      }),
      this.fetchCharacter(player.guid, exportedCharacter).then(data => {
        this.setState({
          characterProfile: data,
        });
        characterProfile = data;
      }),
    ]);

    timeAvailable && console.time('full parse');
    timeAvailable && console.time('initialize');
    const parser = new parserClass(report, player, fight, combatants, characterProfile);
    timeAvailable && console.timeEnd('initialize');
    await this.setStatePromise({
      config,
      parser,
    });
    await this.parse(parser, report, player, fight);
  }
  async parse(parser, report, player, fight) {
    this._jobId += 1;
    const jobId = this._jobId;
    let events;
    try {
      events = await fetchEvents(report.code, fight.start_time, fight.end_time, player.id);
      this.stopFakeNetworkProgress();
    } catch (err) {
      this.stopFakeNetworkProgress();
      if (err instanceof LogNotFoundError) {
        this.props.reportNotFoundError();
      } else if (err instanceof ApiDownError) {
        this.props.apiDownError();
      } else if (err instanceof JsonParseError) {
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

      const numEvents = events.length;
      // Picking a correct batch duration is hard. I tried various durations to get the batch sizes to 1 frame, but that results in a lot of wasted time waiting for the next frame. 30ms (30 fps) as well causes a lot of wasted time. 60ms seem to have really low wasted time while not blocking the UI anymore than a user might expect.
      const maxBatchDuration = 60; // ms

      timeAvailable && console.time('player event parsing');
      let eventIndex = 0;
      while (eventIndex < numEvents) {
        if (this._jobId !== jobId) {
          return;
        }

        const start = Date.now();
        while (((Date.now() - start) < maxBatchDuration) && eventIndex < numEvents) {
          parser.triggerEvent(events[eventIndex]);
          eventIndex += 1;
        }
        const progress = Math.min(1, eventIndex / numEvents);
        this.props.setReportProgress(PROGRESS_STEP2_FETCH_EVENTS + (PROGRESS_STEP3_PARSE_EVENTS - PROGRESS_STEP2_FETCH_EVENTS) * progress);
        // Delay the next iteration until next frame so the browser doesn't appear to be frozen
        await this.timeout(0); // eslint-disable-line no-await-in-loop
      }
      timeAvailable && console.timeEnd('player event parsing');

      parser.finish();
      timeAvailable && console.timeEnd('full parse');
      this.props.setReportProgress(PROGRESS_COMPLETE);
      this.setState({
        finished: true,
      });
    } catch (err) {
      // Something went wrong during the analysis of the log, there's probably an issue in your analyzer or one of its modules.
      throw err;
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
      // eslint-disable-next-line no-await-in-loop
      await this.timeout(stepInterval);
      step += 1;
    }
  }
  stopFakeNetworkProgress() {
    this._isFakeNetworking = false;
  }
  async fetchCharacter(id, exportedCharacter) {
    let region;
    let realm;
    let name;
    if (exportedCharacter) {
      region = exportedCharacter.region.toLowerCase();
      realm = exportedCharacter.server;
      name = exportedCharacter.name;
      if (region === 'cn') {
        return null;
      }
    }

    try {
      return await fetch(makeCharacterApiUrl(id, region, realm, name, 'talents')).then(data => data.json());
    } catch (error) {
      return null;
    }
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
      characterProfile: null,
    });
    this.props.setReportProgress(null);
    this.stopFakeNetworkProgress();
  }

  componentDidUpdate(prevProps, prevState) {
    ReactTooltip.rebuild();

    this.fetchCombatantsIfNecessary(prevProps, prevState);
    this.fetchEventsAndParseIfNecessary(prevProps, prevState);
    this.updateUrlIfNecessary(prevProps);
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
      || this.props.urlPlayerName !== prevProps.urlPlayerName
      || this.props.playerId !== prevProps.playerId;
    if (changed) {
      this.reset();

      const report = this.props.report;
      const fight = this.props.fight;
      const combatants = this.props.combatants;
      const playerId = this.props.playerId;
      const urlPlayerName = this.props.urlPlayerName;
      const valid = report && fight && combatants && (urlPlayerName || playerId);
      if (valid) {
        //check log if no combatantID is set and the name appears more than once
        if (!playerId && urlPlayerName && report.friendlies.filter(friendly => friendly.name === urlPlayerName).length > 1) {
          alert(`It appears like another '${urlPlayerName}' is in this log, please select the correct one`);
          this.props.history.push(makeAnalyzerUrl(report, fight.id));
          return;
        }
        const player = this.getPlayerFromReport(report, playerId, urlPlayerName);
        if (!player) {
          alert(`Unknown player: ${urlPlayerName}`);
          this.props.history.push(makeAnalyzerUrl(report, fight.id));
          return;
        }
        const combatant = combatants.find(combatant => combatant.sourceID === player.id);
        if (!combatant) {
          alert('This player does not seem to be in this fight.');
          return;
        }
        if (!combatant.specID) {
          alert('The data received from WCL for this player is corrupt, this fight can not be analyzed.');
          return;
        }
        this.fetchEventsAndParse(report, fight, combatants, combatant, player);
        this.appendHistory(report, fight, player);
      }
    }
  }
  updateUrlIfNecessary(prevProps) {
    const hasReport = !!this.props.report;
    if (!hasReport) {
      return;
    }
    const isReportChanged = prevProps.report !== this.props.report;
    if (!isReportChanged) {
      return;
    }

    if (this.isFightNameMissingFromUrl || this.isPlayerNameMissingFromUrl) {
      const url = makeAnalyzerUrl(this.props.report, this.props.fightId, this.props.playerId, this.props.resultTab);
      console.log('Replacing URL from', this.props.history.location.pathname, 'to', url);
      this.props.history.replace(url);
    }
  }
  get isFightNameMissingFromUrl() {
    const isFightSelected = this.props.report && this.props.fightId && this.props.fight;
    const isUrlMissingFightName = !this.props.urlFightName;
    return isFightSelected && isUrlMissingFightName;
  }
  get isPlayerNameMissingFromUrl() {
    const isPlayerSelected = this.props.report && this.props.playerId;
    // urlPlayerName currently defaults to the id when it's not supplied (this should be refactored)
    const isUrlMissingPlayerName = !this.props.urlPlayerName || this.props.urlPlayerName === `${this.props.playerId}`;
    return isPlayerSelected && isUrlMissingPlayerName;
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
      type: REPORT_HISTORY_TYPES.REPORT,
    });
  }

  render() {
    const { report, fightId, fight, urlPlayerName } = this.props;

    if (!fightId || !fight) {
      return (
        <React.Fragment>
          <DocumentTitle title={report.title} />

          <FightSelecter />
        </React.Fragment>
      );
    }
    if (!urlPlayerName) {
      return (
        <React.Fragment>
          <DocumentTitle title={fight ? `${getFightName(report, fight)} in ${report.title}` : report.title} />

          <PlayerSelecter />
        </React.Fragment>
      );
    }

    const { parser } = this.state;
    if (!parser) {
      return (
        <React.Fragment>
          <FightNavigationBar />

          <DocumentTitle title={fight && urlPlayerName ? `${getFightName(report, fight)} by ${urlPlayerName} in ${report.title}` : report.title} />

          <div className="container">
            <ActivityIndicator text="Initializing analyzer..." />
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <FightNavigationBar />

        <DocumentTitle title={`${getFightName(report, fight)} by ${urlPlayerName} in ${report.title}`} />

        <div className="container">
          <Results
            parser={parser}
            finished={this.state.finished}
            characterProfile={this.state.characterProfile}
            makeTabUrl={tab => makeAnalyzerUrl(report, parser.fightId, parser.playerId, tab)}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const fightId = getFightId(state);

  return ({
    fightId,
    urlFightName: getUrlFightName(state),
    playerId: getPlayerId(state),
    urlPlayerName: getPlayerName(state),
    resultTab: getResultTab(state),

    report: getReport(state),
    fight: getFightById(state, fightId),
    combatants: getCombatants(state),

    articleId: getArticleId(state),

    error: getError(state),
  });
};

const ConnectedReport = withRouter(connect(
  mapStateToProps,
  {
    setReportProgress,
    fetchCombatants,
    reportNotFoundError,
    apiDownError,
    unknownNetworkIssueError,
    unknownError,
    appendReportHistory,
  }
)(Report));

export default props => (
  <ReportFetcher>
    {report => <ConnectedReport {...props} report={report} />}
  </ReportFetcher>
);
