import React, { Component } from 'react';
import { Link } from 'react-router';

import './App.css';

import DIFFICULTIES from './DIFFICULTIES';
import WCL_API_KEY from './WCL_API_KEY';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Progress from './Progress';
import PlayerBreakdown from './PlayerBreakdown';

import CombatLogParser, { SPELL_ID_RULE_OF_LAW } from './CombatLogParser';

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

  static calculateStats(parser) {
    let totalHealingWithMasteryAffectedAbilities = 0;
    let totalHealingFromMastery = 0;
    let totalMaxPotentialMasteryHealing = 0;

    const statsByTargetId = parser.masteryHealEvents.reduce((obj, event) => {
      // Update the fight-totals
      totalHealingWithMasteryAffectedAbilities += event.amount;
      totalHealingFromMastery += event.masteryHealingDone;
      totalMaxPotentialMasteryHealing += event.maxPotentialMasteryHealing;

      // Update the player-totals
      if (!obj[event.targetID]) {
        const playerInfo = parser.players[event.targetID];
        obj[event.targetID] = {
          ...playerInfo,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const playerStats = obj[event.targetID];
      playerStats.healingReceived += event.amount;
      playerStats.healingFromMastery += event.masteryHealingDone;
      playerStats.maxPotentialHealingFromMastery += event.maxPotentialMasteryHealing;

      return obj;
    }, {});

    return {
      statsByTargetId,
      totalHealingWithMasteryAffectedAbilities,
      totalHealingFromMastery,
      totalMaxPotentialMasteryHealing,
      ruleOfLawUptimePercentage: parser.getBuffUptime(SPELL_ID_RULE_OF_LAW) / parser.fightDuration,
    };
  }

  get reportCode() {
    return this.props.params.reportCode;
  }
  get playerName() {
    return this.props.params.playerName;
  }
  get fightId() {
    return this.props.params.fightId;
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
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      totalHealing: 0,
      friendlyStats: null,
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
    this.reset = this.reset.bind(this);
  }

  handleReportSelecterSubmit(code) {
    console.log('Selected report:', code);

    this.props.router.push(`/report/${code}`);
  }

  parse(report, playerName, fightId) {
    const player = this.getPlayerFromReport(report, playerName);
    const fight = this.getFightFromReport(report, fightId);

    const parser = new CombatLogParser(player, fight);

    this.setState({
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      totalHealing: 0,
      friendlyStats: null,
    });
    this.parseNextBatch(parser, report.code, player, fight.start_time, fight.end_time);
  }
  parseNextBatch(parser, code, player, fightStart, fightEnd, nextPageTimestamp = null) {
    const isFirstBatch = nextPageTimestamp === null;
    // If this is the first batch the first events will be at the fightStart
    const pageTimestamp = isFirstBatch ? fightStart : nextPageTimestamp;
    // If this is the first batch we want to NOT filter the events by actor id in order to obtain combatantinfo for all players
    const actorId = isFirstBatch ? null : player.id;

    this.fetchEvents(code, actorId, pageTimestamp, fightEnd)
      .then((json) => {
        parser.parseEvents(json.events)
          .then(() => {
            const stats = App.calculateStats(parser);

            // Update the interface with progress
            this.setState({
              progress: (pageTimestamp - fightStart) / (fightEnd - fightStart),
              totalHealing: parser.totalHealing,
              totalHealingFromMastery: stats.totalHealingFromMastery,
              totalMaxPotentialMasteryHealing: stats.totalMaxPotentialMasteryHealing,
              ruleOfLawUptimePercentage: stats.ruleOfLawUptimePercentage,
            });

            if (json.nextPageTimestamp) {
              // Continue on next page
              if (json.nextPageTimestamp > fightEnd) {
                console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
              }
              this.parseNextBatch(parser, code, player, fightStart, fightEnd, json.nextPageTimestamp);
            } else {
              this.onParsingFinished(parser, stats);
            }
          });
      });
  }
  onParsingFinished(parser, stats) {
    console.log('Finished. Parser:', parser);

    const statsByTargetId = stats.statsByTargetId;
    const playersById = this.state.report.friendlies.reduce((obj, player) => {
      obj[player.id] = player;
      return obj;
    }, {});
    const friendlyStats = [];
    Object.keys(statsByTargetId)
      .forEach(targetId => {
        const playerStats = statsByTargetId[targetId];
        const playerInfo = playersById[targetId];

        if (playerInfo) {
          friendlyStats.push({
            ...playerInfo,
            ...playerStats,
            masteryEffectiveness: playerStats.healingFromMastery / (playerStats.maxPotentialHealingFromMastery || 1),
            healingReceivedPercentage: playerStats.healingReceived / stats.totalHealingWithMasteryAffectedAbilities,
          });
        }
      });

    this.setState({
      finished: true,
      friendlyStats,
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
          alert('An error occured. I\'m so terribly sorry. Try again later or in an updated Google Chrome.');
        }
        console.error(err);
        this.reset();
      });
  }

  reset() {
    this.setState({
      report: null,
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      totalHealing: 0,
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
    if (this.reportCode !== prevParams.reportCode) {
      if (this.reportCode) {
        this.fetchReport(this.reportCode);
      }
    }
    if (this.state.report !== prevState.report || this.fightId !== prevParams.fightId || this.playerName !== prevParams.playerName) {
      if (this.state.report && this.playerName && this.fightId) {
        this.parse(this.state.report, this.playerName, Number(this.fightId));
      }
    }
  }

  render() {
    const { report, finished, totalHealingFromMastery, totalMaxPotentialMasteryHealing, ruleOfLawUptimePercentage, totalHealing, friendlyStats } = this.state;

    const player = this.playerName && this.state.report && this.getPlayerFromReport(this.state.report, this.playerName);
    const fight = this.fightId && this.state.report && this.getFightFromReport(this.state.report, Number(this.fightId));

    return (
      <div className="App">
        <div className="panel panel-default">
          <div className="panel-body">
            {(() => {
              if (!this.reportCode) {
                return <ReportSelecter onSubmit={this.handleReportSelecterSubmit} />;
              }
              if (!report) {
                return (
                  <div style={{ width: 650 }}>
                    <h1>Fetching report information...</h1>

                    <div className="spinner"></div>

                    {/*<div className="text-muted">*/}
                      {/*This should only take a brief moment. Not minutes. Never minutes. If it takes minutes something might have crashed. Try*/}
                      {/*Google Chrome if you're using some ancient, broken and insecure browser. Maybe WCL is down.{' '}*/}
                      {/*<a href="https://www.warcraftlogs.com/" target="_blank">Is it down?</a> You know I could have written some code to*/}
                      {/*automatically check if it is down. Nah, it shouldn't happen that often. Now that you have gotten this far reading this I*/}
                      {/*think it's fairly safe to say something crashed. If this happens in an updated Google Chrome it may be that the log is*/}
                      {/*broken. Please send me the log link if you think that's the case. It may also be that this tool broke due to changes to*/}
                      {/*WCLs API. If you think that's the case make a ticket{' '}*/}
                      {/*<a href="https://github.com/MartijnHols/MasteryEffectivenessCalculator/issues">here</a>. Even if I stop playing WoW I'm*/}
                      {/*pretty active on GitHub so it's extremely likely I'll see the ticket there. Doesn't mean I'll decide to respond or act*/}
                      {/*on it though. But usually does. No promises.*/}
                    {/*</div>*/}
                  </div>
                );
              }
              if (!this.playerName) {
                return <PlayerSelecter report={report} />;
              }
              if (!this.fightId) {
                return <FightSelecter report={report} playerName={this.playerName} />;
              }

              const progress = Math.floor(this.state.progress * 100);
              const totalMasteryEffectiveness = totalHealingFromMastery / (totalMaxPotentialMasteryHealing || 1);
              const highestHealingFromMastery = friendlyStats && friendlyStats.reduce((highest, player) => Math.max(highest, player.healingFromMastery), 1);

              return (
                <div style={{ width: 800 }}>
                  <h1 style={{ margin: 0 }}>
                    <a href={`https://www.warcraftlogs.com/reports/${this.reportCode}/#fight=${fight.id}`} target="_blank">{DIFFICULTIES[fight.difficulty]} {fight.name} ({fight.kill ? 'Kill' : 'Wipe'})</a> for {player.name}
                  </h1><br />

                  {!finished && <Progress progress={progress} />}

                  <div className="row">
                    <div className="col-xs-6">
                      <div style={{ width: '100%', backgroundColor: '#7e9e3a', borderRadius: 3, padding: '10px 15px', color: '#fff' }}>
                        <div className="row">
                          <div className="col-xs-3">
                            <img src="./healing.png" style={{ height: 74 }} alt="Healing" />
                          </div>
                          <div className="col-xs-9 text-right">
                            <div style={{ fontSize: '2.5em' }}>
                              {(totalHealing + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                            </div>
                            <div style={{ marginTop: '-0.3em' }}>
                              Healing done
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-6">
                      <div style={{ width: '100%', backgroundColor: '#1C538D', borderRadius: 3, padding: '10px 15px', color: '#fff' }}>
                        <div className="row">
                          <div className="col-xs-3">
                            <img src="./mastery-radius.png" style={{ height: 74 }} alt="Mastery effectiveness" />
                          </div>
                          <div className="col-xs-9 text-right">
                            <div style={{ fontSize: '2.5em' }}>
                              {(Math.round(totalMasteryEffectiveness * 100))} %
                            </div>
                            <div style={{ marginTop: '-0.3em' }}>
                              Mastery effectiveness
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: 15 }}>
                    <div className="col-xs-6">
                      <div style={{ width: '100%', backgroundColor: '#d9762f', borderRadius: 3, padding: '10px 15px', color: '#fff' }}>
                        <div className="row">
                          <div className="col-xs-3">
                            <img src="./ruleoflaw.jpg" style={{ height: 74 }} alt="Healing" />
                          </div>
                          <div className="col-xs-9 text-right">
                            <div style={{ fontSize: '2.5em' }}>
                              {(Math.round(ruleOfLawUptimePercentage * 100))} %
                            </div>
                            <div style={{ marginTop: '-0.3em' }}>
                              Rule of Law uptime
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-6">
                    </div>
                  </div>

                  {friendlyStats && (
                    <div>
                      <h3 style={{ fontWeight: 700 }}>Player breakdown:</h3>

                      <PlayerBreakdown friendlyStats={friendlyStats} highestHealingFromMastery={highestHealingFromMastery} totalHealingFromMastery={totalHealingFromMastery} />
                    </div>
                  )}

                  <br />
                  <Link to={`/report/${this.reportCode}/${this.playerName}`} className="btn btn-primary">
                    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" /> Change fight
                  </Link>
                </div>
              )
            })()}
          </div>
        </div><br />
        {this.reportCode && (
          <Link to="/" className="btn btn-muted">
            <span className="glyphicon glyphicon-repeat" aria-hidden="true" /> Change report
          </Link>
        )}
      </div>
    );
  }
}

export default App;
