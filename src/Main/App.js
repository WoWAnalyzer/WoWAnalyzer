import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, browserHistory } from 'react-router';
import ReactTooltip from 'react-tooltip';

import makeWclUrl from 'common/makeWclUrl';
import getFightName from 'common/getFightName';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import UnsupportedSpec from 'Parser/UnsupportedSpec/CONFIG';

import './App.css';

import GithubLogo from './Images/GitHub-Mark-Light-32px.png';

import Home from './Home';
import FightSelecter from './FightSelecter';
import FightSelectorHeader from './FightSelectorHeader';
import PlayerSelecter from './PlayerSelecter';
import PlayerSelectorHeader from './PlayerSelectorHeader';
import Results from './Results';
import ReportSelecter from './ReportSelecter';
import AppBackgroundImage from './AppBackgroundImage';

import makeAnalyzerUrl from './makeAnalyzerUrl';

const toolName = 'WoW Analyzer';
const githubUrl = 'https://github.com/WoWAnalyzer/WoWAnalyzer';

const timeAvailable = console.time && console.timeEnd;

const PROGRESS_STEP1_INITIALIZATION = 0.02;
const PROGRESS_STEP2_FETCH_EVENTS = 0.13;
const PROGRESS_STEP3_PARSE_EVENTS = 0.99;

/* eslint-disable no-alert */

let _footerDeprectatedWarningSent = false;

class App extends Component {
  static propTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
    params: PropTypes.shape({
      reportCode: PropTypes.string,
      playerName: PropTypes.string,
      fightId: PropTypes.string,
      resultTab: PropTypes.string,
    }),
  };
  static defaultProps = {
    params: {},
  };
  static childContextTypes = {
    config: PropTypes.object,
  };

  get reportCode() {
    return this.props.params.reportCode;
  }
  get isReportValid() {
    return this.state.report && this.state.report.code === this.reportCode;
  }
  get playerName() {
    return this.props.params.playerName;
  }
  get fightId() {
    if (this.props.params.fightId) {
      return Number(this.props.params.fightId.split('-')[0]);
    }
    return null;
  }
  get fight() {
    return this.fightId && this.state.report && this.getFightFromReport(this.state.report, this.fightId);
  }
  get resultTab() {
    return this.props.params.resultTab;
  }

  getPlayerFromReport(report, playerName) {
    return report.friendlies.find(friendly => friendly.name === playerName);
  }
  getPlayerPetsFromReport(report, playerId) {
    return report.friendlyPets.filter(pet => pet.petOwner === playerId);
  }
  getFightFromReport(report, fightId) {
    return report.fights.find(fight => fight.id === fightId);
  }

  constructor() {
    super();
    this.state = {
      report: null,
      combatants: null,
      selectedSpec: null,
      progress: 0,
      dataVersion: 0,
      bossId: null,
      config: null,
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }
  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  handleReportSelecterSubmit(code) {
    console.log('Selected report:', code);

    this.props.router.push(`report/${code}`);
  }
  handleRefresh() {
    this.fetchReport(this.reportCode, true);
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
    parser.parseEvents(combatants)
      .then(() => parser.triggerEvent('initialized'))
      .then(async () => {
        await this.setStatePromise({
          config,
          parser,
          progress: PROGRESS_STEP1_INITIALIZATION,
        });
        await this.parse(parser, report, player, fight);
      });
  }
  async parse(parser, report, player, fight) {
    let events;
    try {
      this.startFakeNetworkProgress();
      events = await this.fetchEvents(report.code, fight.start_time, fight.end_time, player.id);
      this.stopFakeNetworkProgress();
    } catch (err) {
      this.stopFakeNetworkProgress();
      if (process.env.NODE_ENV === 'development') {
        // Something went wrong while fetching the events, this usually doesn't have anything to do with a spec analyzer but is a core issue.
        throw err;
      } else {
        alert(`The report could not be parsed because an error occured. Warcraft Logs might be having issues. ${err.message}`);
        console.error(err);
      }
    }
    events = parser.reorderEvents(events);
    await this.setStatePromise({
      progress: PROGRESS_STEP2_FETCH_EVENTS,
    });

    const batchSize = 300;
    const numEvents = events.length;
    let offset = 0;

    try {
      while (offset < numEvents) {
        const eventsBatch = events.slice(offset, offset + batchSize);
        await parser.parseEvents(eventsBatch);
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
      if (process.env.NODE_ENV === 'development') {
        // Something went wrong during the analysis of the log, there's probably an issue in your analyzer or one of its modules.
        throw err;
      } else {
        alert(`The report could not be parsed because an error occured while running the analysis. ${err.message}`);
        console.error(err);
      }
    }
  }
  _isFakeNetworking = false;
  async startFakeNetworkProgress() {
    this._isFakeNetworking = true;
    const expectedDuration = 5000;
    const stepInterval = 50;

    let step = 1;
    while (this._isFakeNetworking) {
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
  async fetchEvents(reportCode, fightStart, fightEnd, actorId = undefined, filter = undefined) {
    let pageStartTimestamp = fightStart;

    let events = [];
    while (true) {
      timeAvailable && console.time('WCL events');
      const json = await this.fetchEventsPage(reportCode, pageStartTimestamp, fightEnd, actorId, filter);
      timeAvailable && console.timeEnd('WCL events');
      events = [
        ...events,
        ...json.events,
      ];
      if (json.nextPageTimestamp) {
        if (json.nextPageTimestamp > fightEnd) {
          console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
        }
        pageStartTimestamp = json.nextPageTimestamp;
      } else {
        break;
      }
    }
    return events;
  }

  fetchReport(code, refresh = false) {
    // console.log('Fetching report:', code);

    this.setState({
      report: null,
    });

    const url = makeWclUrl(`report/fights/${code}`, {
      _: refresh ? +new Date() : undefined,
      translate: true, // so long as we don't have the entire site localized, it's better to have 1 consistent language
    });
    return fetch(url)
      .then(response => response.json())
      .then((json) => {
        // console.log('Received report', code, ':', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else if (this.reportCode === code) {
          if (!json.fights) {
            let message = 'Corrupt WCL response received.';
            if (json.error) {
              message = json.error;
              if (json.message) {
                try {
                  const errorMessage = JSON.parse(json.message);
                  if (errorMessage.error) {
                    message = errorMessage.error;
                  }
                } catch (error) {}
              }
            }

            throw new Error(message);
          }

          this.setState({
            report: {
              ...json,
              code,
            },
          });
        }
      })
      .catch((err) => {
        alert(`I'm so terribly sorry, an error occured. Try again later, in an updated Google Chrome and make sure that Warcraft Logs is up and functioning properly. Please let us know on Discord if the problem persists.\n\n${err}`);
        console.error(err);
        this.setState({
          report: null,
        });
        this.reset();
      });
  }
  fetchCombatantsForFight(report, fightId) {
    // console.log('Fetching combatants:', report, fightId);

    this.setState({
      combatants: null,
    });
    const fight = this.getFightFromReport(report, fightId);

    return this.fetchEvents(report.code, fight.start_time, fight.end_time, undefined, 'type="combatantinfo"')
      .then((events) => {
        // console.log('Received combatants', report.code, ':', json);
        if (this.reportCode === report.code && this.fightId === fightId) {
          this.setState({
            combatants: events,
          });
        }
      })
      .catch((err) => {
        if (err) {
          alert(err);
        } else {
          alert('I\'m so terribly sorry, an error occured. Try again later or in an updated Google Chrome. (Is Warcraft Logs up?)');
        }
        console.error(err);
        this.setState({
          report: null,
        });
        this.reset();
      });
  }

  reset() {
    this.setState({
      config: null,
      parser: null,
      progress: 0,
    });
  }

  fetchEventsPage(code, start, end, actorId = undefined, filter = undefined) {
    const url = makeWclUrl(`report/events/${code}`, {
      start,
      end,
      actorid: actorId,
      filter,
      translate: true, // it's better to have 1 consistent language so long as we don't have the entire site localized
    });
    return fetch(url).then(response => response.json());
  }

  componentWillMount() {
    if (this.reportCode) {
      this.fetchReport(this.reportCode);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    ReactTooltip.rebuild();

    this.fetchReportIfNecessary(prevProps);
    this.fetchCombatantsIfNecessary(prevProps, prevState);
    this.fetchEventsAndParseIfNecessary(prevProps, prevState);
    this.updatePageTitle();
    this.updateBossIdIfNecessary(prevProps, prevState);
  }
  fetchReportIfNecessary(prevProps) {
    const curParams = this.props.params;
    const prevParams = prevProps.params;
    if (curParams.reportCode && curParams.reportCode !== prevParams.reportCode) {
      this.fetchReport(curParams.reportCode);
    }
  }
  fetchCombatantsIfNecessary(prevProps, prevState) {
    const curParams = this.props.params;
    const prevParams = prevProps.params;
    if (this.isReportValid && this.fightId && (this.state.report !== prevState.report || curParams.fightId !== prevParams.fightId)) {
      // A report has been loaded, it is the report the user wants (this can be a mismatch if a new report is still loading), a fight was selected, and one of the fight-relevant things was changed
      this.fetchCombatantsForFight(this.state.report, this.fightId);
    }
  }
  fetchEventsAndParseIfNecessary(prevProps, prevState) {
    const curParams = this.props.params;
    const prevParams = prevProps.params;
    if (this.state.report !== prevState.report || this.state.combatants !== prevState.combatants || curParams.fightId !== prevParams.fightId || this.playerName !== prevParams.playerName) {
      this.reset();

      const report = this.state.report;
      const combatants = this.state.combatants;
      const playerName = this.playerName;
      if (report && combatants && this.fightId && playerName) {
        const player = this.getPlayerFromReport(report, playerName);
        if (!player) {
          alert(`Unknown player: ${playerName}`);
          return;
        }
        const combatant = combatants.find(combatant => combatant.sourceID === player.id);
        if (!combatant) {
          alert('This player does not seem to be in this fight.');
          return;
        }
        const fight = this.getFightFromReport(report, this.fightId);
        this.fetchEventsAndParse(report, fight, combatants, combatant, player);
      }
    }
  }
  updateBossIdIfNecessary(prevProps, prevState) {
    const curParams = this.props.params;
    const prevParams = prevProps.params;
    if (curParams.reportCode !== prevParams.reportCode || this.state.report !== prevState.report || curParams.fightId !== prevParams.fightId) {
      this.updateBossId();
    }
  }

  updatePageTitle() {
    let title = toolName;
    if (this.reportCode && this.state.report) {
      if (this.playerName) {
        if (this.fight) {
          title = `${getFightName(this.state.report, this.fight)} by ${this.playerName} in ${this.state.report.title} - ${title}`;
        } else {
          title = `${this.playerName} in ${this.state.report.title} - ${title}`;
        }
      } else {
        title = `${this.state.report.title} - ${title}`;
      }
    }
    document.title = title;
  }
  updateBossId() {
    this.setState({
      bossId: (this.reportCode && this.isReportValid && this.fight && this.fight.boss) || null,
    });
  }

  renderContent() {
    const { report, combatants, parser } = this.state;
    if (!this.reportCode) {
      return <Home />;
    }
    if (!report) {
      return (
        <div>
          <h1>Fetching report information...</h1>

          <div className="spinner" />
        </div>
      );
    }
    if (!this.fightId) {
      return <FightSelecter report={report} onRefresh={this.handleRefresh} />;
    }
    if (!combatants) {
      return (
        <div>
          <h1>Fetching players...</h1>

          <div className="spinner" />
        </div>
      );
    }
    if (!this.playerName) {
      return <PlayerSelecter report={report} fightId={this.fightId} combatants={combatants} />;
    }
    if (!parser) {
      return null;
    }

    return (
      <Results
        parser={parser}
        dataVersion={this.state.dataVersion}
        tab={this.resultTab}
        onChangeTab={newTab => browserHistory.push(makeAnalyzerUrl(report, this.fightId, this.playerName, newTab))}
      />
    );
  }

  async setStatePromise(newState) {
    return new Promise((resolve, reject) => {
      this.setState(newState, resolve);
    });
  }

  render() {
    const { report, combatants, parser } = this.state;

    const progress = (this.state.progress * 100);

    if (this.state.config && this.state.config.footer && !_footerDeprectatedWarningSent) {
      console.error('Using `config.footer` is deprectated. You should add the information you want to share to the description property in the config, which is shown on the spec information overlay.');
      _footerDeprectatedWarningSent = true;
    }

    return (
      <div className={`app ${this.reportCode ? 'has-report' : ''}`}>
        <AppBackgroundImage bossId={this.state.bossId} />

        <nav className="navbar navbar-default">
          <div className="navbar-progress" style={{ width: `${progress}%`, opacity: progress === 0 || progress >= 100 ? 0 : 1 }} />
          <div className="container">
            <div className="navbar-header">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={makeAnalyzerUrl()}>{toolName}</Link></li>
                {this.reportCode && report && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(report)}>{report.title}</Link></li>}
                {this.fight && report && <li className="breadcrumb-item"><FightSelectorHeader report={report} selectedFightName={getFightName(report, this.fight)} parser={parser} /></li>}
                {this.playerName && report && <li className="breadcrumb-item"><PlayerSelectorHeader report={report} fightId={this.fightId} combatants={combatants || []} selectedPlayerName={this.playerName} /></li>}
              </ol>
            </div>

            <ul className="nav navbar-nav navbar-right github-link hidden-xs">
              <li><a href={githubUrl}><span className="hidden-xs"> View on GitHub </span><img src={GithubLogo} alt="GitHub logo" /></a></li>
            </ul>
          </div>
        </nav>
        <header>
          <div className="container hidden-md hidden-sm hidden-xs">
            Analyze your performance
          </div>
          {!this.reportCode && (
            <ReportSelecter onSubmit={this.handleReportSelecterSubmit} />
          )}
        </header>
        <div className="container">
          {this.renderContent()}
          {this.state.config && this.state.config.footer}
        </div>
        <ReactTooltip html place="bottom" />
      </div>
    );
  }
}

export default App;
