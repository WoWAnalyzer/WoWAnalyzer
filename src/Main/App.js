import React, { Component } from 'react';
import './App.css';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import DIFFICULTIES from './DIFFICULTIES';

import CombatLogParser from './CombatLogParser';

/**
 * TODO:
 * Progress bars
 * Pretty interface
 * Handle connection issues
 * Hide API key (step 1: config file, step 2: proxy)
 * Calculate mastery effectiveness without spreadsheet
 * Get player names and merge them with events
 * -> show mastery effectiveness per player (so you can shout at your hunters)
 * Time per heal
 * Add support for BotLB (a lot of work)
 * Add support for multiple holy paladins
 */

class App extends Component {
  apiKey = null;

  constructor() {
    super();
    this.state = {
      reportCode: null,
      report: null,
      selectedPlayer: null,
      selectedFight: null,
      results: null,
      finished: false,
      totalActualMasteryHealing: null,
      totalMaxPotentialMasteryHealing: null,
    };

    this.handleReportSelecterSubmit = this.handleReportSelecterSubmit.bind(this);
    this.handleSelectPlayer = this.handleSelectPlayer.bind(this);
    this.handleSelectFight = this.handleSelectFight.bind(this);
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
    });
    this.parseNextBatch(parser, code, player, fight.start_time, fight.end_time);
  }
  parseNextBatch(parser, code, player, start, end) {
    this.fetchEvents(code, player, start, end)
      .then((json) => {
        parser.parseEvents(json.events)
          .then((results) => {
            console.log('New results', results);
            this.setState({
              totalActualMasteryHealing: results.totalActualMasteryHealing,
              totalMaxPotentialMasteryHealing: results.totalMaxPotentialMasteryHealing,
            });
            if (json.nextPageTimestamp) {
              if (json.nextPageTimestamp > end) {
                console.error('nextPageTimestamp is after end, do we need to manually filter too?');
              }
              this.parseNextBatch(parser, code, player, json.nextPageTimestamp, end);
            } else {
              this.setState({
                finished: true,
              });
            }
          });
      });
  }

  fetchFights(code) {
    console.log('Fetching fights for report', code);
    fetch(`https://www.warcraftlogs.com:443/v1/report/fights/${code}?api_key=${this.apiKey}`)
      .then(response => response.json())
      .then((json) => {
        console.log('Received fights for', code, json);
        if (json.status === 401) {
          alert(json.error);
        } else {
          this.setState({
            report: json,
          });
        }
      });
  }

  fetchEvents(code, player, start, end) {
    return fetch(`https://www.warcraftlogs.com/v1/report/events/${code}?start=${start}&end=${end}&api_key=${this.apiKey}&actorid=${player.id}`)
      .then(response => response.json());
  }

  render() {
    const { reportCode, report, selectedFight, selectedPlayer, finished, totalActualMasteryHealing, totalMaxPotentialMasteryHealing } = this.state;

    return (
      <div className="App">
        {!reportCode && <ReportSelecter onSubmit={this.handleReportSelecterSubmit} apiKey={this.apiKey} />}
        {reportCode && !report && 'Loading...'}
        {report && !selectedPlayer && <PlayerSelecter report={report} onSelectPlayer={this.handleSelectPlayer} />}
        {selectedPlayer && !selectedFight && <FightSelecter report={report} onSelectFight={this.handleSelectFight} />}

        {selectedPlayer && selectedFight && (
          <div style={{ background: '#eee', margin: '15px auto', border: '1px solid #ddd', borderRadius: 5, maxWidth: 600, padding: 15 }}>
            <h1>{DIFFICULTIES[selectedFight.difficulty]} {selectedFight.name} ({selectedFight.kill ? 'Kill' : 'Wipe'})</h1>

            {!finished && <div>Working...</div>}

            Mastery effectiveness: {Math.round(totalActualMasteryHealing / (totalMaxPotentialMasteryHealing || 1) * 100)}%<br /><br />

            <input type="button" value="Change fight" onClick={() => this.setState({ selectedFight: null })} />
          </div>
        )}

        <center>{reportCode && <input type="button" value="Change report" onClick={() => this.setState({ reportCode: null, report: null, selectedPlayer: null, selectedFight: null })} />}</center>
      </div>
    );
  }
}

export default App;
