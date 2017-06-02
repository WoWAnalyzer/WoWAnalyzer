import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';
import ReactTooltip from 'react-tooltip';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';

import './App.css';

import DIFFICULTIES from './DIFFICULTIES';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';

import makeWclUrl from './makeWclUrl';
import makeAnalyzerUrl from './makeAnalyzerUrl';
import getWipeCount from './getWipeCount';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const toolName = `WoW Analyzer`;
const githubUrl = 'https://github.com/MartijnHols/WoWAnalyzer';

class App extends Component {
  static propTypes = {
    router: React.PropTypes.shape({
      push: React.PropTypes.func.isRequired,
    }).isRequired,
    params: React.PropTypes.shape({
      reportCode: React.PropTypes.string,
      playerName: React.PropTypes.string,
      fightId: React.PropTypes.string,
      resultTab: React.PropTypes.string,
    }),
  };
  static defaultProps = {
    params: {},
  };

  get reportCode() {
    return this.props.params.reportCode;
  }
  get playerName() {
    return this.props.params.playerName;
  }
  get fightId() {
    return this.props.params.fightId ? Number(this.props.params.fightId) : null;
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
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
  }

  handleReportSelecterSubmit(code) {
    console.log('Selected report:', code);

    this.props.router.push(makeAnalyzerUrl(code));
  }

  config = null;
  parser = null;
  parse(report, fightId, playerName) {
    const player = this.getPlayerFromReport(report, playerName);
    if (!player) {
      alert(`Unknown player: ${playerName}`);
      return;
    }
    const fight = this.getFightFromReport(report, fightId);

    const combatant = this.state.combatants.find(combatant => combatant.sourceID === player.id);
    if (!combatant) {
      alert('This player does not seem to be in this fight.');
      return;
    }
    const config = AVAILABLE_CONFIGS.find(config => config.spec.id === combatant.specID);
    if (!config) {
      alert('This spec is not yet supported. Your help building support for this spec would be much appreciated! Click the GitHub link above to find out how you can contribute.');
      return;
    }
    this.config = config;

    const ParserClass = config.parser;
    this.parser = new ParserClass(report, player, fight);

    this.setState({
      progress: 0,
    });
    this.parseNextBatch(this.parser, report.code, player, fight.start_time, fight.end_time);
  }
  parseNextBatch(parser, code, player, fightStart, fightEnd, nextPageTimestamp = null) {
    if (parser !== this.parser) {
      return;
    }

    const isFirstBatch = nextPageTimestamp === null;
    // If this is the first batch the first events will be at the fightStart
    const pageTimestamp = isFirstBatch ? fightStart : nextPageTimestamp;
    // If this is the first batch we want to NOT filter the events by actor id in order to obtain combatantinfo for all players
    const actorId = isFirstBatch ? undefined : player.id;

    this.fetchEvents(code, pageTimestamp, fightEnd, actorId)
      .then((json) => {
        if (parser !== this.parser) {
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
      progress: 1,
    });
  }

  fetchReport(code) {
    console.log('Fetching report:', code);

    this.setState({
      report: null,
    });

    const url = makeWclUrl(`https://www.warcraftlogs.com/v1/report/fights/${code}`);
    return fetch(url)
      .then(response => response.json())
      .then((json) => {
        console.log('Received report', code, ':', json);
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
    console.log('Fetching combatants:', report, fightId);

    this.setState({
      combatants: null,
    });
    const fight = this.getFightFromReport(report, fightId);

    return this.fetchEvents(report.code, fight.start_time, fight.end_time, undefined, 'type="combatantinfo"')
      .then((json) => {
        console.log('Received combatants', report.code, ':', json);
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
    this.parser = null;
    this.config = null;
    this.setState({
      progress: 0,
    });
  }

  fetchEvents(code, start, end, actorId = undefined, filter = undefined) {
    const url = makeWclUrl(`https://www.warcraftlogs.com/v1/report/events/${code}`, { start, end, actorid: actorId, filter });
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
    const isReportValid = this.state.report && this.state.report.code === this.reportCode;
    if (isReportValid && this.fightId && (this.state.report !== prevState.report || this.props.params.fightId !== prevParams.fightId)) {
      // A report has been loaded, it is the report the user wants (this can be a mismatch if a new report is still loading), a fight was selected, and one of the fight-relevant things was changed
      this.fetchCombatants(this.state.report, this.fightId);
    }
    if (this.state.report !== prevState.report || this.state.combatants !== prevState.combatants || this.props.params.fightId !== prevParams.fightId || this.playerName !== prevParams.playerName) {
      this.reset();
      if (this.state.report && this.state.combatants && this.fightId && this.playerName) {
        this.parse(this.state.report, this.fightId, this.playerName);
      }
    }

    let title = toolName;
    if (this.reportCode && this.state.report) {
      if (this.playerName) {
        if (this.fight) {
          title = `${this.getFightName(this.fight)} by ${this.playerName} in ${this.state.report.title} - ${title}`;
        } else {
          title = `${this.playerName} in ${this.state.report.title} - ${title}`;
        }
      } else {
        title = `${this.state.report.title} - ${title}`;
      }
    }
    document.title = title;
  }

  getFightName(fight) {
    const wipeCount = getWipeCount(this.state.report, fight);
    return `${DIFFICULTIES[fight.difficulty]} ${fight.name} - ${fight.kill ? 'Kill' : `Wipe ${wipeCount}`} (${formatDuration((fight.end_time - fight.start_time) / 1000)})`;
  }

  render() {
    const { report, combatants } = this.state;
    const parser = this.parser;

    const progress = Math.floor(this.state.progress * 100);

    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="navbar-progress" style={{ width: `${progress}%`, opacity: progress === 0 || progress === 100 ? 0 : 1 }} />
          <div className="container">
            <ul className="nav navbar-nav navbar-right">
              <li><a href={githubUrl}><span className="hidden-xs"> View on GitHub </span><img src="./img/GitHub-Mark-Light-32px.png" alt="GitHub logo" /></a></li>
            </ul>

            <div className="navbar-header">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={makeAnalyzerUrl()}>{toolName}</Link></li>
                {this.reportCode && report && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(this.reportCode)}>{report.title}</Link></li>}
                {this.fight && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(this.reportCode, this.fightId)}>{this.getFightName(this.fight)}</Link></li>}
                {this.playerName && <li className="breadcrumb-item"><Link to={makeAnalyzerUrl(this.reportCode, this.fightId, this.playerName)}>{this.playerName}</Link></li>}
              </ol>
            </div>
          </div>
        </nav>
        <div className="container">
          {(() => {
            if (!this.reportCode) {
              return <ReportSelecter onSubmit={this.handleReportSelecterSubmit} />;
            }
            if (!report) {
              return (
                <div>
                  <h1>Fetching report information...</h1>

                  <div className="spinner"></div>
                </div>
              );
            }
            if (!this.fightId) {
              return <FightSelecter report={report} />;
            }
            if (!combatants) {
              return (
                <div>
                  <h1>Fetching players...</h1>

                  <div className="spinner"></div>
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
                onChangeTab={newTab => hashHistory.push(makeAnalyzerUrl(report.code, this.fightId, this.playerName, newTab))}
              />
            );
          })()}
          {this.config && this.config.footer && (
            <div className="panel fade-in" style={{ margin: '15px auto 30px', width: 300, textAlign: 'center' }}>
              <div className="panel-body text-muted">
                {this.config.footer}
              </div>
            </div>
          )}
        </div>
        <ReactTooltip html={true} place="bottom" />
      </div>
    );
  }
}

export default App;
