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
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';
import ReportSelecter from './ReportSelecter';
import AppBackgroundImage from './AppBackgroundImage';

import makeAnalyzerUrl from './makeAnalyzerUrl';

const toolName = `WoW Analyzer`;
const githubUrl = 'https://github.com/MartijnHols/WoWAnalyzer';

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

  config = null;
  parser = null;
  parse(report, combatants, fightId, playerName) {
    const player = this.getPlayerFromReport(report, playerName);
    if (!player) {
      alert(`Unknown player: ${playerName}`);
      return;
    }
    const fight = this.getFightFromReport(report, fightId);

    const combatant = combatants.find(combatant => combatant.sourceID === player.id);
    if (!combatant) {
      alert('This player does not seem to be in this fight.');
      return;
    }
    let config = AVAILABLE_CONFIGS.find(config => config.spec.id === combatant.specID);
    if (!config) {
      if (process.env.NODE_ENV === 'development') {
        config = UnsupportedSpec;
      } else {
        alert('This spec is not yet supported. Your help adding support for this spec would be much appreciated! Click the GitHub link above to find out how you can contribute.');
        return;
      }
    }

    const ParserClass = config.parser;
    const parser = new ParserClass(report, player, fight);

    this.setState({
      config,
      parser,
      progress: 0,
    }, () => {
      parser.parseEvents(combatants)
        .then(() => {
          parser.triggerEvent('initialized');
          this.setState({
            progress: 0.1,
          });
          this.parseNextBatch(parser, report.code, player, fight.start_time, fight.end_time);
        });
    });
  }
  parseNextBatch(parser, code, player, fightStart, fightEnd, nextPageTimestamp = null) {
    if (parser !== this.state.parser) {
      return;
    }

    const isFirstBatch = nextPageTimestamp === null;
    // If this is the first batch the first events will be at the fightStart
    const pageTimestamp = isFirstBatch ? fightStart : nextPageTimestamp;
    const actorId = player.id;

    this.fetchEvents(code, pageTimestamp, fightEnd, actorId)
      .then((json) => {
        if (parser !== this.state.parser) {
          return;
        }

        parser.parseEvents(json.events)
          .then(() => {
            // Update the interface with progress
            this.setState({
              progress: (pageTimestamp - fightStart) / (fightEnd - fightStart),
              dataVersion: this.state.dataVersion + 1, // each time we parsed events we want to refresh the report, this triggers that while the `praser` object that's passed on the `<Results>` elem will always be the same reference
            });

            if (json.nextPageTimestamp) {
              if (json.nextPageTimestamp > fightEnd) {
                console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
              }
              this.parseNextBatch(parser, code, player, fightStart, fightEnd, json.nextPageTimestamp);
            } else {
              parser.triggerEvent('finished');
              this.onParsingFinished(parser);
            }
          })
          .catch((err) => {
            alert(`The report could not be parsed because an error occured. ${err.message}`);
            if (process.env.NODE_ENV === 'development') {
              throw err;
            } else {
              console.error(err);
            }
          });
      });
  }
  onParsingFinished(parser) {
    console.log('Finished. Parser:', parser);

    this.setState({
      progress: 0.99,
    }, () => {
      this.setState({
        progress: 1,
      });
    });
  }

  fetchReport(code, refresh = false) {
    // console.log('Fetching report:', code);

    this.setState({
      report: null,
    });

    const url = makeWclUrl(`report/fights/${code}`, {
      _: refresh ? +new Date() : undefined,
    });
    return fetch(url)
      .then(response => response.json())
      .then((json) => {
        // console.log('Received report', code, ':', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else if (this.reportCode === code) {
          this.setState({
            report: {
              ...json,
              code: code,
            },
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
  fetchCombatants(report, fightId) {
    // console.log('Fetching combatants:', report, fightId);

    this.setState({
      combatants: null,
    });
    const fight = this.getFightFromReport(report, fightId);

    return this.fetchEvents(report.code, fight.start_time, fight.end_time, undefined, 'type="combatantinfo"')
      .then((json) => {
        // console.log('Received combatants', report.code, ':', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else if (this.reportCode === report.code) {
          this.setState({
            combatants: json.events,
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

  fetchEvents(code, start, end, actorId = undefined, filter = undefined) {
    const url = makeWclUrl(`report/events/${code}`, { start, end, actorid: actorId, filter });
    return fetch(url)
      .then(response => response.json());
  }

  componentWillMount() {
    if (this.reportCode) {
      this.fetchReport(this.reportCode);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    ReactTooltip.rebuild();

    const prevParams = prevProps.params;
    if (this.reportCode && this.reportCode !== prevParams.reportCode) {
      // User provided a reportCode AND it changed since previous render, so fetch the new report
      this.fetchReport(this.reportCode);
    }
    if (this.isReportValid && this.fightId && (this.state.report !== prevState.report || this.props.params.fightId !== prevParams.fightId)) {
      // A report has been loaded, it is the report the user wants (this can be a mismatch if a new report is still loading), a fight was selected, and one of the fight-relevant things was changed
      this.fetchCombatants(this.state.report, this.fightId);
    }
    if (this.state.report !== prevState.report || this.state.combatants !== prevState.combatants || this.props.params.fightId !== prevParams.fightId || this.playerName !== prevParams.playerName) {
      this.reset();
      if (this.state.report && this.state.combatants && this.fightId && this.playerName) {
        this.parse(this.state.report, this.state.combatants, this.fightId, this.playerName);
      }
    }

    this.updatePageTitle();
    if (this.reportCode !== prevParams.reportCode || this.state.report !== prevState.report || this.props.params.fightId !== prevParams.fightId) {
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

          <div className="spinner"/>
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

          <div className="spinner"/>
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

  render() {
    const { report } = this.state;

    const progress = Math.floor(this.state.progress * 100);

    return (
      <div className={`app ${this.reportCode ? 'has-report' : ''}`}>
        <AppBackgroundImage bossId={this.state.bossId} />

        <nav className="navbar navbar-default">
          <div className="navbar-progress" style={{ width: `${progress}%`, opacity: progress === 0 || progress === 100 ? 0 : 1 }} />
          <div className="container">
            <div className="navbar-header">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={makeAnalyzerUrl()}>{toolName}</Link></li>
                {this.reportCode && report && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(report)}>{report.title}</Link></li>}
                {this.fight && report && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(report, this.fightId)}>{getFightName(report, this.fight)}</Link></li>}
                {this.playerName && report && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(report, this.fightId, this.playerName)}>{this.playerName}</Link></li>}
              </ol>
            </div>

            <ul className="nav navbar-nav navbar-right github-link">
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
        <ReactTooltip html={true} place="bottom" />
      </div>
    );
  }
}

export default App;
