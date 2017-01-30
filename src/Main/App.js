import React, { Component } from 'react';
import './App.css';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import DIFFICULTIES from './DIFFICULTIES';

const SPELL_ID_RULE_OF_LAW = 214202;

const ABILITIES_AFFECTED_BY_MASTERY = [
  225311, // Light of Dawn
  20473, // Holy Shock
  82326, // Holy Light
  19750, // Flash of Light
  196917, // Light of the Martyr
  114165, // Holy Prism
  114158, // Light's Hammer
  183811, // Judgment of Light
  200652, // Tyr's Deliverance
  223306, // Bestow Faith
];

class CombatLogParser {
  lastCast = null;
  lastRuleOfLaw = null;
  totalActualMasteryHealing = 0;
  // The total (so from all abilities) max potential mastery healing if we had a mastery effectiveness of 100% on all abilities. This does NOT include the base healing
  // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
  totalMaxPotentialMasteryHealing = 0;

  players = {};

  player = null;
  playerMasteryPerc = null;
  fight = null;

  constructor(player, fight) {
    this.player = player;
    this.fight = fight;
  }

  // results = [];

  parseEvents(events) {
    // console.log('Received events', events);
    return new Promise((resolve, reject) => {
      events.forEach(event => {
        const methodName = `parse_${event.type}`;
        const method = this[methodName];
        if (method) {
          method.call(this, event);
        }
      });

      resolve({
        totalActualMasteryHealing: this.totalActualMasteryHealing,
        totalMaxPotentialMasteryHealing: this.totalMaxPotentialMasteryHealing,
      });
    });
  }

  parse_cast(event) {
    this.lastCast = event;
  }
  parse_heal(event) {
    const isAbilityAffectedByMastery = ABILITIES_AFFECTED_BY_MASTERY.indexOf(event.ability.guid) !== -1;

    if (isAbilityAffectedByMastery) {
      const distance = CombatLogParser.calculateDistance(this.lastCast.x, this.lastCast.y, event.x, event.y) / 100;
      const hasRuleOfLaw = this.lastRuleOfLaw !== null;
      // We calculate the mastery effectiveness of this *one* heal
      const masteryEffectiveness = CombatLogParser.calculateMasteryEffectiveness(distance, hasRuleOfLaw);

      // The actual heal as shown in the log
      const healingDone = event.amount;
      // The base healing of the spell (excluding any healing added by mastery)
      const baseHealingDone = healingDone / (1 + this.playerMasteryPerc * masteryEffectiveness);
      const masteryHealingDone = healingDone - baseHealingDone;
      const maxPotentialMasteryHealing = baseHealingDone * this.playerMasteryPerc; // * 100% mastery effectiveness

      // Keep track of the total healing done to get an average
      this.totalActualMasteryHealing += masteryHealingDone;
      this.totalMaxPotentialMasteryHealing += maxPotentialMasteryHealing;

      // If we want to make charts we'll have to keep a log
      // this.results.push({
      //   ...event,
      //   distance,
      //   hasRuleOfLaw,
      //   masteryEffectiveness,
      // });
      console.log(event.ability.name,
        `healing:${event.amount},distance:${distance},hasRuleOfLaw:${hasRuleOfLaw},masteryEffectiveness:${masteryEffectiveness}`,
        `playerMasteryPerc:${this.playerMasteryPerc},baseHealingDone:${baseHealingDone},masteryHealingDone:${masteryHealingDone},maxPotentialMasteryHealing=${maxPotentialMasteryHealing}`);
    }
  }
  parse_applybuff(event) {
    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = event;
    }
  }
  parse_refreshbuff(event) {
    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = event;
    }
  }
  parse_removebuff(event) {
    const { ability: { guid } } = event;
    if (guid === SPELL_ID_RULE_OF_LAW) {
      this.lastRuleOfLaw = null;
    }
  }
  parse_combatantinfo(event) {
    console.log('combatantinfo', event, `(looking for ${this.player.id})`, this.player);
    this.players[event.sourceID] = event;

    if (event.sourceID === this.player.id) {
      this.playerMasteryPerc = CombatLogParser.calculateMasteryPercentage(event.mastery);
    }
  }

  static calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
  static calculateMasteryEffectiveness(distance, hasRuleOfLaw) {
    const fullEffectivenessRadius = hasRuleOfLaw ? 15 : 10;
    const falloffRadius = hasRuleOfLaw ? 60 : 40;

    return Math.min(1, Math.max(0, 1 - (distance - fullEffectivenessRadius) / (falloffRadius - fullEffectivenessRadius)));
  }
  static calculateMasteryPercentage(masteryRating) {
    return 0.12 + masteryRating / 26667;
  }
}

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
