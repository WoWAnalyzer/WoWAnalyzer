import React, { Component } from 'react';
import './App.css';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import DIFFICULTIES from './DIFFICULTIES';

import CombatLogParser from './CombatLogParser';

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
      progress: 0,
      totalActualMasteryHealing: null,
      totalMaxPotentialMasteryHealing: null,
      totalHealingSeen: null,
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
      totalActualMasteryHealing: null,
      totalMaxPotentialMasteryHealing: null,
      totalHealingSeen: null,
    });
    this.parseNextBatch(parser, code, player, fight.start_time, fight.end_time, fight.start_time);
  }
  parseNextBatch(parser, code, player, fightStart, fightEnd, batchStart) {
    this.fetchEvents(code, player, batchStart, fightEnd)
      .then((json) => {
        parser.parseEvents(json.events)
          .then((results) => {
            console.log('New results', results);
            this.setState({
              totalActualMasteryHealing: results.totalActualMasteryHealing,
              totalMaxPotentialMasteryHealing: results.totalMaxPotentialMasteryHealing,
              totalHealingSeen: results.totalHealingSeen,
              progress: (batchStart - fightStart) / (fightEnd - fightStart),
            });
            if (json.nextPageTimestamp) {
              if (json.nextPageTimestamp > fightEnd) {
                console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
              }
              this.parseNextBatch(parser, code, player, fightStart, fightEnd, json.nextPageTimestamp);
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

    fetch(`https://www.warcraftlogs.com/v1/report/fights/${code}?api_key=${this.apiKey}`)
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
      })
      .catch((err) => {
        alert('An error occured. I\'m so terribly sorry. Try again later or in an updated Google Chrome.');
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
    });
  }

  fetchEvents(code, player, start, end) {
    return fetch(`https://www.warcraftlogs.com/v1/report/events/${code}?start=${start}&end=${end}&api_key=${this.apiKey}&actorid=${player.id}`)
      .then(response => response.json());
  }

  render() {
    const { reportCode, report, selectedFight, selectedPlayer, finished, totalActualMasteryHealing, totalMaxPotentialMasteryHealing, totalHealingSeen } = this.state;

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          {reportCode && (
            <input type="button" className="btn pull-right" value="Change report" onClick={this.reset} />
          )}

          {(() => {
            if (!reportCode) {
              return <ReportSelecter onSubmit={this.handleReportSelecterSubmit} apiKey={this.apiKey} />;
            }
            if (!report) {
              return (
                <div>
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

            return (
              <div>
                <h1 style={{ margin: 0 }}>{DIFFICULTIES[selectedFight.difficulty]} {selectedFight.name} ({selectedFight.kill ? 'Kill' : 'Wipe'}) for {selectedPlayer.name}</h1><br />

                {!finished && (
                  <div className="progress">
                    <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${progress}%` }}>
                      {progress}%
                    </div>
                  </div>
                )}

                Mastery effectiveness: {Math.round(totalActualMasteryHealing / (totalMaxPotentialMasteryHealing || 1) * 100)}% (saw {Math.round(totalHealingSeen/100000)/10}m healing)<br /><br />

                <a href={`https://www.warcraftlogs.com/reports/${reportCode}/#fight=${selectedFight.id}`} target="_blank">{`https://www.warcraftlogs.com/reports/${reportCode}/#fight=${selectedFight.id}`}</a><br /><br />

                <button type="button" className="btn btn-primary" onClick={() => this.setState({ selectedFight: null })} >
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" /> Change fight
                </button>
              </div>
            )
          })()}
        </div>
      </div>
    );
  }
}

export default App;
