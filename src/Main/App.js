import React, { Component } from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import './App.css';

import DIFFICULTIES from './DIFFICULTIES';
import WCL_API_KEY from './WCL_API_KEY';

import ReportSelecter from './ReportSelecter';
import FightSelecter from './FightSelecter';
import PlayerSelecter from './PlayerSelecter';
import Progress from './Progress';
import PlayerBreakdown from './PlayerBreakdown';
import StatisticBox from './StatisticBox';

import CombatLogParser from './Parser/CombatLogParser';
import { RULE_OF_LAW_SPELL_ID } from './Parser/Constants';
import { DRAPE_OF_SHAME_ITEM_ID } from './Parser/Modules/Legendaries/DrapeOfShame';
import { ILTERENDI_ITEM_ID } from './Parser/Modules/Legendaries/Ilterendi';
import { VELENS_ITEM_ID } from './Parser/Modules/Legendaries/Velens';
import { CHAIN_OF_THRAYN_ITEM_ID } from './Parser/Modules/Legendaries/ChainOfThrayn';
import { PRYDAZ_ITEM_ID } from './Parser/Modules/Legendaries/Prydaz';
import { OBSIDION_STONE_SPAULDERS_ITEM_ID } from './Parser/Modules/Legendaries/ObsidianStoneSpaulders';
import { MARAADS_DYING_BREATH_ITEM_ID } from './Parser/Modules/Legendaries/MaraadsDyingBreath';

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

    const statsByTargetId = parser.modules.masteryEffectiveness.masteryHealEvents.reduce((obj, event) => {
      // Update the fight-totals
      totalHealingWithMasteryAffectedAbilities += event.amount;
      totalHealingFromMastery += event.masteryHealingDone;
      totalMaxPotentialMasteryHealing += event.maxPotentialMasteryHealing;

      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = parser.modules.combatants.players[event.targetID];
        obj[event.targetID] = {
          combatant,
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
      ruleOfLawUptimePercentage: parser.modules.buffs.getBuffUptime(RULE_OF_LAW_SPELL_ID) / parser.fightDuration,
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
      parser: null,
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

    const parser = new CombatLogParser(report, player, fight);

    this.setState({
      finished: false,
      progress: 0,
      totalHealingFromMastery: 0,
      totalMaxPotentialMasteryHealing: 0,
      ruleOfLawUptimePercentage: 0,
      parser,
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
              parser,
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
              parser.finished();
              this.onParsingFinished(parser, stats);
            }
          });
      });
  }
  onParsingFinished(parser, stats) {
    console.log('Finished. Parser:', parser);

    const statsByTargetId = stats.statsByTargetId;
    const playersById = parser.playersById;
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
      parser: null,
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
    ReactTooltip.rebuild();
  }

  static formatPercentage(percentage) {
    return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
  }

  render() {
    const { report, finished, totalHealingFromMastery, totalMaxPotentialMasteryHealing, ruleOfLawUptimePercentage, parser, friendlyStats } = this.state;

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
                <div style={{ width: '100%', maxWidth: 1000 }}>
                  <h1 style={{ margin: 0 }}>
                    <a href={`https://www.warcraftlogs.com/reports/${this.reportCode}/#fight=${fight.id}`} target="_blank">{DIFFICULTIES[fight.difficulty]} {fight.name} ({fight.kill ? 'Kill' : 'Wipe'})</a> for {player.name}
                  </h1><br />

                  {!finished && <Progress progress={progress} />}

                  {parser && (
                    <div>
                      <div className="row">
                        <div className="col-md-12">
                          <h3>Mastery effectiveness</h3>
                        </div>
                      </div>
                      <div className="row">
                        <StatisticBox
                          color="#7e9e3a"
                          icon={<img src="./healing.png" style={{ height: 74 }} alt="Healing" />}
                          value={((parser.totalHealing || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                          label="Healing done"
                        />
                        <StatisticBox
                          color="#1C538D"
                          icon={<img src="./mastery-radius.png" style={{ height: 74 }} alt="Mastery effectiveness" />}
                          value={`${(Math.round(totalMasteryEffectiveness * 10000) / 100).toFixed(2)} %`}
                          label={(
                            <dfn data-tip="The Mastery Effectiveness shown by this tool is currently only accurate with Beacon of Faith. If you run this on a log with Beacon of the Lightbringer it will calculate your mastery effectiveness without taking the beacon radius into consideration.<br />Effects that temporarily increase your mastery are also currently not supported.">
                              Mastery effectiveness
                            </dfn>
                          )}
                        />
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.lv30Talent === RULE_OF_LAW_SPELL_ID && (
                          <StatisticBox
                            color="#d9762f"
                            icon={(
                              <a href="http://www.wowhead.com/spell=214202" target="_blank">
                                <img src="./ruleoflaw.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Rule of Law" />
                              </a>
                            )}
                            value={`${(Math.round(ruleOfLawUptimePercentage * 10000) / 100).toFixed(2)} %`}
                            label="Rule of Law uptime"
                          />
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <h3>Cast behavior</h3>
                        </div>
                      </div>
                      <div className="row">
                        <StatisticBox
                          color="#d5f7cf"
                          inverse
                          icon={(
                            <a href="http://www.wowhead.com/spell=53576" target="_blank">
                              <img src="./infusionoflight.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Infusion of Light" />
                            </a>
                          )}
                          value={`${this.constructor.formatPercentage(parser.modules.castRatios.casts.flashOfLightWithIol / (parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol))} %`}
                          label={(
                            <dfn data-tip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${parser.modules.castRatios.casts.flashOfLightWithIol} Flash of Lights and ${parser.modules.castRatios.casts.holyLightWithIol} Holy Lights during Infusion of Light.`}>
                              IoL FoL to IoL HL cast ratio
                            </dfn>
                          )}
                        />
                        <StatisticBox
                          color="#c7c7c7"
                          inverse
                          icon={(
                            <a href="http://www.wowhead.com/spell=53576" target="_blank">
                              <img src="./infusionoflight-bw.png" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Wasted Infusion of Light" />
                            </a>
                          )}
                          value={`${this.constructor.formatPercentage(1 - (parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol) / (parser.modules.castRatios.casts.holyShockCriticals * parser.modules.castRatios.iolProcsPerHolyShockCrit))} %`}
                          label={(
                            <dfn data-tip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${parser.modules.castRatios.casts.holyShock} Holy Shocks with a ${this.constructor.formatPercentage(parser.modules.castRatios.casts.holyShockCriticals / parser.modules.castRatios.casts.holyShock)}% crit ratio. This gave you ${parser.modules.castRatios.casts.holyShockCriticals * parser.modules.castRatios.iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol}.<br /><br />This number may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b>`}>
                              Infusion of Light wasted ratio
                            </dfn>
                          )}
                        />
                        <StatisticBox
                          color="#ccdef5"
                          inverse
                          icon={(
                            <a href="http://www.wowhead.com/spell=19750" target="_blank">
                              <img src="./flashoflight.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Flash of Light" />
                            </a>
                          )}
                          value={`${this.constructor.formatPercentage((parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol) / (parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLight - parser.modules.castRatios.casts.holyLightWithIol))} %`}
                          label={(
                            <dfn data-tip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol} filler Flash of Lights and ${parser.modules.castRatios.casts.holyLight - parser.modules.castRatios.casts.holyLightWithIol} filler Holy Lights.`}>
                              Filler cast ratio
                            </dfn>
                          )}
                        />
                        <StatisticBox
                          color="#000"
                          icon={(
                            <a href="http://www.wowhead.com/spell=53576" target="_blank">
                              <img src="./infusionoflight-bw.png" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Wasted Infusion of Light" />
                            </a>
                          )}
                          value={`${this.constructor.formatPercentage(parser.modules.alwaysBeCasting.totalHealingTimeWasted / (parser.fight.end_time - parser.fight.start_time))} %`}
                          label={(
                            <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. You spent ${this.constructor.formatPercentage(parser.modules.alwaysBeCasting.totalTimeWasted / (parser.fight.end_time - parser.fight.start_time))} % of your time casting nothing at all.`}>
                              Non healing time
                            </dfn>
                          )}
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <h3>Item bonuses</h3>
                        </div>
                      </div>
                      <div className="row">
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasBack(DRAPE_OF_SHAME_ITEM_ID) && (
                          <StatisticBox
                            color="#ad58ca"
                            icon={(
                              <a href="http://www.wowhead.com/item=142170" target="_blank">
                                <img src="./drapeofshame.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Drape of Shame" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.drapeOfShame.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect. This is a bit inaccurate if you are using Beacon of Virtue.">
                                Drape of Shame healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasRing(ILTERENDI_ITEM_ID) && (
                          <StatisticBox
                            color="#3eab90"
                            icon={(
                              <a href="http://www.wowhead.com/item=137046" target="_blank">
                                <img src="./ilterendi.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Ilterendi, Crown Jewel of Silvermoon" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.ilterendi.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Ilterendi, Crown Jewel of Silvermoon equip effect. This is a bit inaccurate if you are using Beacon of Virtue.">
                                Ilterendi healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasTrinket(VELENS_ITEM_ID) && (
                          <StatisticBox
                            color="#ebc505"
                            icon={(
                              <a href="http://www.wowhead.com/item=144258" target="_blank">
                                <img src="./velens.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Velen's Future Sight" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.velens.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect. This is a bit inaccurate if you are using Beacon of Virtue.">
                                Velen's Future Sight healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasWaist(CHAIN_OF_THRAYN_ITEM_ID) && (
                          <StatisticBox
                            color="#984d16"
                            icon={(
                              <a href="http://www.wowhead.com/item=137086" target="_blank">
                                <img src="./chainOfThrayn.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Chain of Thrayn" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.chainOfThrayn.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Chain of Thrayn equip effect. This is a bit inaccurate if you are using Beacon of Virtue.">
                                Chain of Thrayn healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasNeck(PRYDAZ_ITEM_ID) && (
                          <StatisticBox
                            color="#1d4337"
                            icon={(
                              <a href="http://www.wowhead.com/item=132444/prydaz-xavarics-magnum-opus" target="_blank">
                                <img src="./prydaz.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Prydaz, Xavaric's Magnum Opus" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.prydaz.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
                                Prydaz healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasShoulder(OBSIDION_STONE_SPAULDERS_ITEM_ID) && (
                          <StatisticBox
                            color="#1c1a21"
                            icon={(
                              <a href="http://www.wowhead.com/item=137076/obsidian-stone-spaulders" target="_blank">
                                <img src="./obsidianstonespaulders.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Obsidian Stone Spaulders" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.obsidianStoneSpaulders.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Obsidian Stone Spaulders equip effect.">
                                Shoulders healing
                              </dfn>
                            )}
                          />
                        )}
                        {parser.modules.combatants.selected && parser.modules.combatants.selected.hasBack(MARAADS_DYING_BREATH_ITEM_ID) && (
                          <StatisticBox
                            color="#4c0c41"
                            icon={(
                              <a href="http://www.wowhead.com/item=144273/maraads-dying-breath" target="_blank">
                                <img src="./maraadsdyingbreath.jpg" style={{ height: 74, borderRadius: 5, border: '1px solid #000' }} alt="Maraad's Dying Breath" />
                              </a>
                            )}
                            value={`${((Math.round(parser.modules.maraadsDyingBreath.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                            label={(
                              <dfn data-tip="The actual effective healing contributed by the Maraad's Dying Breath equip effect when compared to casting an unbuffed LotM instead. The damage taken is ignored as this doesn't change with Maraad's and therefore doesn't impact the healing gain. This is fairly inaccurate if you are using Beacon of Virtue.">
                                Maraad's healing
                              </dfn>
                            )}
                          />
                        )}
                      </div>

                      {friendlyStats && (
                        <div>
                          <h3 style={{ fontWeight: 700 }}>Player breakdown:</h3>

                          <PlayerBreakdown friendlyStats={friendlyStats} highestHealingFromMastery={highestHealingFromMastery} totalHealingFromMastery={totalHealingFromMastery} />
                        </div>
                      )}
                    </div>
                  )}

                  <br />
                  <Link to={`/report/${this.reportCode}/${this.playerName}`} className="btn btn-primary">
                    <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" /> Change fight
                  </Link>
                </div>
              );
            })()}
          </div>
        </div><br />
        {this.reportCode && (
          <Link to="/" className="btn btn-muted" style={{ marginBottom: '2em' }}>
            <span className="glyphicon glyphicon-repeat" aria-hidden="true" /> Change report
          </Link>
        )}
        <ReactTooltip html={true} place="bottom" />
      </div>
    );
  }
}

export default App;
