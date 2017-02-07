import React, { Component } from 'react';
import './App.css';

import DIFFICULTIES from './DIFFICULTIES';
import SPEC_IDS from './SPEC_IDS';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Progress from './Progress';

import CombatLogParser from './CombatLogParser';

class App extends Component {
  apiKey = null;

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
    };
  }

  constructor() {
    super();
    this.state = {
      reportCode: null,
      report: null,
      selectedPlayer: null,
      selectedFight: null,
      results: null,
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      totalHealing: 0,
      friendlyStats: null,
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
    this.handleSelectPlayer = this.handleSelectPlayer.bind(this);
    this.handleSelectFight = this.handleSelectFight.bind(this);
    this.reset = this.reset.bind(this);
  }

  handleReportSelecterSubmit(apiKey, code) {
    console.log('Selected report:', code);
    this.apiKey = apiKey;
    this.setState({
      reportCode: code,
    });
    return this.fetchFights(code);
  }
  handleSelectPlayer(player) {
    console.log('Selected player:', player);
    this.setState({
      selectedPlayer: player,
    });
  }
  handleSelectFight(fight) {
    console.log('Selected fight:', fight);
    this.setState({
      selectedFight: fight,
    });

    return this.parse(this.state.reportCode, this.state.selectedPlayer, fight);
  }

  parse(code, player, fight) {
    const parser = new CombatLogParser(player, fight);

    this.setState({
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      totalHealing: 0,
      friendlyStats: null,
    });
    this.parseNextBatch(parser, code, player, fight.start_time, fight.end_time);
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
    Object.keys(statsByTargetId).forEach(targetId => {
      const playerStats = statsByTargetId[targetId];
      const playerInfo = playersById[targetId];

      friendlyStats.push({
        ...playerInfo,
        ...playerStats,
        masteryEffectiveness: playerStats.healingFromMastery / (playerStats.maxPotentialHealingFromMastery || 1),
        healingReceivedPercentage: playerStats.healingReceived / stats.totalHealingWithMasteryAffectedAbilities,
      });
    });

    console.log(friendlyStats)

    this.setState({
      finished: true,
      friendlyStats,
    });
  }

  fetchFights(code) {
    console.log('Fetching fights for report', code);

    fetch(`https://www.warcraftlogs.com/v1/report/fights/${code}?api_key=${this.apiKey}`)
      .then(response => response.json())
      .then((json) => {
        console.log('Received fights for', code, json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            report: json,
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
      reportCode: null,
      report: null,
      selectedPlayer: null,
      selectedFight: null,
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      totalHealing: 0,
      friendlyStats: null,
    });
  }

  fetchEvents(code, actorId, start, end) {
    return fetch(`https://www.warcraftlogs.com/v1/report/events/${code}?start=${start}&end=${end}&api_key=${this.apiKey}${actorId ? `&actorid=${actorId}` : ''}`)
      .then(response => response.json());
  }

  render() {
    const { reportCode, report, selectedFight, selectedPlayer, finished, totalHealingFromMastery, totalMaxPotentialMasteryHealing, totalHealing, friendlyStats } = this.state;

    return (
      <div className="App">
        <div className="panel panel-default">
          <div className="panel-body">
            {(() => {
              if (!reportCode) {
                return <ReportSelecter onSubmit={this.handleReportSelecterSubmit} apiKey={this.apiKey} />;
              }
              if (!report) {
                return (
                  <div style={{ width: 650 }}>
                    <h1>Fetching report information...</h1>

                    <div className="spinner"></div>

                    <div className="text-muted">
                      This should only take a brief moment. Not minutes. Never minutes. If it takes minutes something might have crashed. Try
                      Google Chrome if you're using some ancient, broken and insecure browser. Maybe WCL is down.{' '}
                      <a href="https://www.warcraftlogs.com/" target="_blank">Is it down?</a> You know I could have written some code to
                      automatically check if it is down. Nah, it shouldn't happen that often. Now that you have gotten this far reading this I
                      think it's fairly safe to say something crashed. If this happens in an updated Google Chrome it may be that the log is
                      broken. Please send me the log link if you think that's the case. It may also be that this tool broke due to changes to
                      WCLs API. If you think that's the case make a ticket{' '}
                      <a href="https://github.com/MartijnHols/MasteryEffectivenessCalculator/issues">here</a>. Even if I stop playing WoW I'm
                      pretty active on GitHub so it's extremely likely I'll see the ticket there. Doesn't mean I'll decide to respond or act
                      on it though. But usually does. No promises.
                    </div>
                  </div>
                );
              }
              if (!selectedPlayer) {
                return <PlayerSelecter report={report} onSelectPlayer={this.handleSelectPlayer} />;
              }
              if (!selectedFight) {
                return <FightSelecter report={report} onSelectFight={this.handleSelectFight} />;
              }

              const progress = Math.floor(this.state.progress * 100);
              const totalMasteryEffectiveness = totalHealingFromMastery / (totalMaxPotentialMasteryHealing || 1);
              const highestHealingFromMastery = friendlyStats && friendlyStats.reduce((highest, player) => Math.max(highest, player.healingFromMastery), 1);

              return (
                <div style={{ width: 800 }}>
                  <h1 style={{ margin: 0 }}>
                    <a href={`https://www.warcraftlogs.com/reports/${reportCode}/#fight=${selectedFight.id}`} target="_blank">{DIFFICULTIES[selectedFight.difficulty]} {selectedFight.name} ({selectedFight.kill ? 'Kill' : 'Wipe'})</a> for {selectedPlayer.name}
                  </h1><br />

                  {!finished && <Progress progress={progress} />}

                  <div className="row">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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

                  {friendlyStats && (
                    <div>
                      <h3 style={{ fontWeight: 700 }}>Player breakdown:</h3>

                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th colSpan="2">Mastery effectiveness</th>
                            <th colSpan="2"><dfn title="This is the amount of healing done with abilities that are affected by mastery. Things like beacons are NOT included.">Healing done</dfn></th>
                          </tr>
                        </thead>
                        <tbody>
                          {friendlyStats
                            .filter(player => !!player.name)
                            .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
                            .map((player, i) => {
                              const spec = SPEC_IDS[player.specID];
                              const specClassName = spec.className.replace(' ', '');
                              // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
                              // it easier to see relative amounts.
                              const performanceBarHealingReceivedPercentage = player.healingFromMastery / highestHealingFromMastery;
                              const actualHealingReceivedPercentage = player.healingFromMastery / (totalHealingFromMastery || 1);

                              return (
                                <tr key={player.name}>
                                  <td style={{ width: '20%'}}>
                                    <img src={`./specs/${specClassName}-${spec.spec.replace(' ', '')}.jpg`} style={{ width: '20px', height: '20px', border: '1px solid #000' }} alt="Spec logo" />{' '}
                                    {player.name}
                                  </td>
                                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                                    {(Math.round(player.masteryEffectiveness * 10000) / 100).toFixed(2)}%
                                  </td>
                                  <td style={{ width: '40%' }}>
                                    <div
                                      className={`performance-bar ${specClassName}-bg`}
                                      style={{ width: `${player.masteryEffectiveness * 100}%` }}
                                    ></div>
                                  </td>
                                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                                    {(Math.round(actualHealingReceivedPercentage * 10000) / 100).toFixed(2)}%
                                  </td>
                                  <td style={{ width: '40%' }}>
                                    <div
                                      className={`performance-bar ${specClassName}-bg`}
                                      style={{ width: `${performanceBarHealingReceivedPercentage * 100}%` }}
                                    ></div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <br />
                  <button type="button" className="btn btn-primary" onClick={() => this.setState({ selectedFight: null })} >
                    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" /> Change fight
                  </button>
                </div>
              )
            })()}
          </div>
        </div><br />
        {reportCode && (
          <button type="button" className="btn btn-muted" onClick={this.reset}>
            <span className="glyphicon glyphicon-repeat" aria-hidden="true" /> Change report
          </button>
        )}
      </div>
    );
  }
}

export default App;
