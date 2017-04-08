import React, { Component } from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import './App.css';

import DIFFICULTIES from './DIFFICULTIES';
import WCL_API_KEY from './WCL_API_KEY';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Results from './Results';

import CombatLogParser from './Parser/CombatLogParser';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class App extends Component {
  static propTypes = {
    router: React.PropTypes.shape({
      push: React.PropTypes.func.isRequired,
    }).isRequired,
    params: React.PropTypes.shape({
      reportCode: React.PropTypes.string,
      playerName: React.PropTypes.string,
      fightId: React.PropTypes.string,
    }),
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
      results: null,
      progress: 0,
      finished: false,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      friendlyStats: null,
      dataVersion: 0,
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
  }

  handleReportSelecterSubmit(code) {
    console.log('Selected report:', code);

    this.props.router.push(`/report/${code}`);
  }

  parser = null;
  parse(report, playerName, fightId) {
    const player = this.getPlayerFromReport(report, playerName);
    const fight = this.getFightFromReport(report, fightId);

    const parser = new CombatLogParser(report, player, fight);
    this.parser = parser;

    this.setState({
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      friendlyStats: null,
    });
    this.parseNextBatch(parser, report.code, player, fight.start_time, fight.end_time);
  }
  parseNextBatch(parser, code, player, fightStart, fightEnd, nextPageTimestamp = null) {
    if (parser !== this.parser) {
      return;
    }

    const isFirstBatch = nextPageTimestamp === null;
    // If this is the first batch the first events will be at the fightStart
    const pageTimestamp = isFirstBatch ? fightStart : nextPageTimestamp;
    // If this is the first batch we want to NOT filter the events by actor id in order to obtain combatantinfo for all players
    const actorId = isFirstBatch ? null : player.id;

    this.fetchEvents(code, actorId, pageTimestamp, fightEnd)
      .then((json) => {
        if (parser !== this.parser) {
          return;
        }
        parser.parseEvents(json.events)
          .then(() => {
            // Update the interface with progress
            this.setState({
              progress: (pageTimestamp - fightStart) / (fightEnd - fightStart),
              finished: false,
              dataVersion: this.state.dataVersion + 1, // each time we parsed events we want to refresh the report, this triggers that while the `praser` object that's passed on the `<Results>` elem will always be the same reference
            });

            if (json.nextPageTimestamp) {
              if (json.nextPageTimestamp > fightEnd) {
                console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
              }
              this.parseNextBatch(parser, code, player, fightStart, fightEnd, json.nextPageTimestamp);
            } else {
              parser.finished();
              this.onParsingFinished(parser);
            }
          });
      });
  }
  onParsingFinished(parser) {
    console.log('Finished. Parser:', parser);

    this.setState({
      progress: 1,
      finished: true,
    });
  }

  fetchReport(code) {
    console.log('Fetching report:', code);

    this.setState({
      report: null,
    });

    return fetch(`https://www.warcraftlogs.com/v1/report/fights/${code}?api_key=${WCL_API_KEY}`)
      .then(response => response.json())
      .then((json) => {
        console.log('Received report', code, ':', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
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

  reset() {
    this.parser = null;
    this.setState({
      progress: 0,
      finished: false,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      friendlyStats: null,
    });
  }

  fetchEvents(code, actorId, start, end) {
    return fetch(`https://www.warcraftlogs.com/v1/report/events/${code}?start=${start}&end=${end}&api_key=${WCL_API_KEY}${actorId ? `&actorid=${actorId}` : ''}`)
      .then(response => response.json());
  }

  componentWillMount() {
    if (this.reportCode) {
      this.fetchReport(this.reportCode);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevParams = prevProps.params;
    if (this.reportCode && this.reportCode !== prevParams.reportCode) {
      this.fetchReport(this.reportCode);
    }
    if (this.state.report !== prevState.report || this.props.params.fightId !== prevParams.fightId || this.playerName !== prevParams.playerName) {
      this.reset();
      if (this.state.report && this.playerName && this.fightId) {
        this.parse(this.state.report, this.playerName, this.fightId);
      }
    }
    ReactTooltip.rebuild();

    let title = 'Holy Paladin Analyzer';
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

  makeUrl(reportCode = null, playerName = null, fightId = null) {
    let url = '/';
    if (reportCode) {
      url = `${url}report/${reportCode}`;
      if (playerName) {
        url = `${url}/${playerName}`;
        if (fightId) {
          url = `${url}/${fightId}`;
        }
      }
    }

    return url;
  }
  getFightName(fight) {
    return `${DIFFICULTIES[fight.difficulty]} ${fight.name} (${fight.kill ? 'Kill' : 'Wipe'} ${formatDuration((fight.end_time - fight.start_time) / 1000)})`;
  }

  render() {
    const { report } = this.state;
    const parser = this.parser;

    const progress = Math.floor(this.state.progress * 100);

    return (
      <div className={parser ? 'larger' : ''}>
        <nav className="navbar navbar-default">
          <div className="navbar-progress" style={{ width: `${progress}%`, opacity: progress === 0 || progress === 100 ? 0 : 1 }}></div>
          <div className="container">
            <div className="navbar-header">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={this.makeUrl()}>Holy Paladin Analyzer</Link></li>
                {this.reportCode && report && <li className="breadcrumb-item"><Link to={this.makeUrl(this.reportCode)}>{report.title}</Link></li>}
                {this.playerName && <li className="breadcrumb-item"><Link to={this.makeUrl(this.reportCode, this.playerName)}>{this.playerName}</Link></li>}
                {this.fight && <li className="breadcrumb-item"><Link to={this.makeUrl(this.reportCode, this.playerName, this.fightId)}>{this.getFightName(this.fight)}</Link></li>}
              </ol>

            </div>

            <ul className="nav navbar-nav navbar-right">
              <li><a href="https://github.com/MartijnHols/HolyPaladinAnalyzer"><span className="hidden-xs"> View on GitHub </span><img src="GitHub-Mark-Light-32px.png" alt="GitHub logo" /></a></li>
            </ul>
          </div>
        </nav>
        <div className="container">
          {(() => {
            if (!this.reportCode) {
              return <ReportSelecter onSubmit={this.handleReportSelecterSubmit} />;
            }
            if (!report) {
              return (
                <div style={{ width: 650 }}>
                  <h1>Fetching report information...</h1>

                  <div className="spinner"></div>
                </div>
              );
            }
            if (!this.playerName) {
              return <PlayerSelecter report={report} />;
            }
            if (!this.fightId) {
              return <FightSelecter report={report} playerName={this.playerName} />;
            }
            if (!parser) {
              return null;
            }

            return (
              <Results
                parser={parser}
                finished={this.state.finished}
                dataVersion={this.state.dataVersion}
              />
            );
          })()}
          {this.reportCode && (
            <Link to="/" style={{ marginTop: '2em', marginBottom: '2em' }}>
              <span className="glyphicon glyphicon-repeat" aria-hidden="true" /> Change report
            </Link>
          )}
        </div>
        <ReactTooltip html={true} place="bottom" />
      </div>
    );
  }
}

export default App;
