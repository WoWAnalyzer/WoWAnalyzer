import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Trans } from '@lingui/macro';
import ExtendableError from 'es6-error';

import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { fetchEvents, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import getFightName from 'common/getFightName';
import sleep from 'common/sleep';
import EventEmitter from 'parser/core/modules/EventEmitter';
import REPORT_HISTORY_TYPES from 'interface/home/ReportHistory/REPORT_HISTORY_TYPES';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import { setReportProgress } from 'interface/actions/reportProgress';
import { appendReportHistory } from 'interface/actions/reportHistory';

import Ghuun from './images/Ghuun.gif';
import handleApiError from './handleApiError';
import './EventParser.css';

const timeAvailable = console.time && console.timeEnd;

const PROGRESS_STEP1_INITIALIZATION = 0.01;
const PROGRESS_STEP2_FETCH_EVENTS = 0.13;
const PROGRESS_STEP3_PARSE_EVENTS = 0.99;
const PROGRESS_COMPLETE = 1.0;
const CHINESE_REGION = 'cn';
const BENCHMARK = false;

export class EventsParseError extends ExtendableError {
  reason = null;
  constructor(reason) {
    super();
    this.reason = reason;
  }
}

class EventParser extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      guid: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,

    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
    })),
    setReportProgress: PropTypes.func.isRequired,
    appendReportHistory: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired, // adds to browser history
      replace: PropTypes.func.isRequired, // updates current browser history entry
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
      }).isRequired,
    }),
  };
  state = {
    error: null,
    parser: null,
    finished: false,
  };

  // Parsing a fight for a player is a "job", if the selected player or fight changes we want to cancel parsing it. This integer gives each job an id that if it mismatches stops the job.
  _jobId = 0;

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.parse();
  }
  componentDidUpdate(prevProps, prevState) {
    const changed = this.props.report !== prevProps.report
      || this.props.fight !== prevProps.fight
      || this.props.player !== prevProps.player
      || this.props.config !== prevProps.config;
    if (changed) {
      // noinspection JSIgnoredPromiseFromCall
      this.parse();
    }
  }
  componentWillUnmount() {
    this._jobId += 1;
  }

  async parse() {
    const { report, fight, combatants, player } = this.props;

    this.reset();
    this.appendHistory(report, fight, player);
    this._jobId += 1;

    this.props.setReportProgress(0);
    // noinspection JSIgnoredPromiseFromCall
    this.startFakeNetworkProgress();
    // Make 3 requests asynchronous so we don't waste any time waiting
    let parserClass = null;
    let characterProfile = null;
    let events = null;
    return Promise.all([
      this.loadParser().then(result => {
        parserClass = result;
      }),
      this.loadCharacterProfile().then(result => {
        characterProfile = result;
      }),
      this.loadEvents().then(result => {
        events = result;
      }),
    ])
      .then(() => {
        this.stopFakeNetworkProgress();
        timeAvailable && console.time('full parse');
        const parser = new parserClass(report, player, fight, combatants, characterProfile);
        return this.parseEvents(parser, report, player, fight, events);
      })
      .catch(error => {
        this.stopFakeNetworkProgress();
        const isCommonError = error instanceof LogNotFoundError;
        if (!isCommonError) {
          captureException(error);
        }
        this.reset();
        this.setState({
          error,
        });
      });

  }
  async parseEvents(parser, report, player, fight, events) {
    const jobId = this._jobId;
    try {
      // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
      events = events.filter(event => event.type !== 'combatantinfo');
      events = parser.normalize(events);
      if (!BENCHMARK) {
        this.props.setReportProgress(PROGRESS_STEP2_FETCH_EVENTS);
      }

      const numEvents = events.length;
      // Picking a correct batch duration is hard. I tried various durations to get the batch sizes to 1 frame, but that results in a lot of wasted time waiting for the next frame. 30ms (30 fps) as well causes a lot of wasted time. 60ms seem to have really low wasted time while not blocking the UI anymore than a user might expect.
      const maxBatchDuration = 60; // ms

      const eventEmitter = parser.getModule(EventEmitter);
      timeAvailable && console.time('player event parsing');
      let eventIndex = 0;
      while (eventIndex < numEvents) {
        if (this._jobId !== jobId) {
          return;
        }

        const start = Date.now();
        while ((BENCHMARK || (Date.now() - start) < maxBatchDuration) && eventIndex < numEvents) {
          eventEmitter.triggerEvent(events[eventIndex]);
          eventIndex += 1;
        }
        const progress = Math.min(1, eventIndex / numEvents);
        if (!BENCHMARK) {
          this.props.setReportProgress(PROGRESS_STEP2_FETCH_EVENTS + (PROGRESS_STEP3_PARSE_EVENTS - PROGRESS_STEP2_FETCH_EVENTS) * progress);
          // Delay the next iteration until next frame so the browser doesn't appear to be frozen
          await sleep(0); // eslint-disable-line no-await-in-loop
        }
      }
      timeAvailable && console.timeEnd('player event parsing');

      parser.finish();
      timeAvailable && console.timeEnd('full parse');
      this.props.setReportProgress(PROGRESS_COMPLETE);
      this.setState({
        parser: parser,
        finished: true,
      });
    } catch (err) {
      // Something went wrong during the analysis of the log, there's probably an issue in your analyzer or one of its modules.
      if (process.env.NODE_ENV === 'production') {
        throw new EventsParseError(err);
      } else {
        throw err;
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
      // eslint-disable-next-line no-await-in-loop
      await sleep(stepInterval);
      step += 1;
    }
  }
  stopFakeNetworkProgress() {
    this._isFakeNetworking = false;
  }

  async loadParser() {
    return this.props.config.parser();
  }
  async loadCharacterProfile() {
    const report = this.props.report;
    const player = this.props.player;
    const exportedCharacter = report.exportedCharacters ? report.exportedCharacters.find(char => char.name === player.name) : null;
    const id = player.guid;
    let region;
    let realm;
    let name;
    if (exportedCharacter) {
      region = exportedCharacter.region.toLowerCase();
      realm = exportedCharacter.server;
      name = exportedCharacter.name;
      if (region === CHINESE_REGION) {
        return null;
      }
    }

    try {
      return await fetch(makeCharacterApiUrl(id, region, realm, name)).then(data => data.json());
    } catch (error) {
      // This only provides optional info, so it's no big deal if it fails
      console.warn('Unable to obtain character information because of:', error);
      return null;
    }
  }
  loadEvents() {
    const { report, fight, player } = this.props;

    return fetchEvents(report.code, fight.start_time, fight.end_time, player.id);
  }

  async setStatePromise(newState) {
    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });
  }

  reset() {
    this.setState({
      parser: null,
      finished: false,
      events: null,
    });
    this.props.setReportProgress(null);
    this.stopFakeNetworkProgress();
  }

  appendHistory(report, fight, player) {
    // TODO: Move this to another component, it doesn't make sense here as it has nothing to do with event parsing
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

  renderError(error) {
    return handleApiError(error, () => {
      this.reset();
      this.props.history.push(makeAnalyzerUrl());
    });
  }
  renderLoading() {
    return (
      <div className="event-parser-loading-text">
        <Trans>Loading...</Trans><br /><br />

        <img src={Ghuun} alt="Ghuun" style={{ transform: 'scaleX(-1)' }} />
      </div>
    );
  }
  render() {
    const error = this.state.error;
    if (error) {
      return this.renderError(error);
    }

    if (!this.state.finished) {
      return this.renderLoading();
    }

    return this.props.children(this.state.parser);
  }
}

export default compose(
  withRouter,
  connect(null, {
    setReportProgress,
    appendReportHistory,
  })
)(EventParser);
