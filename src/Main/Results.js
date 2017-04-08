import React from 'react';
import { Link } from 'react-router';

import PlayerBreakdown from './PlayerBreakdown';
import StatisticBox from './StatisticBox';

import { RULE_OF_LAW_SPELL_ID } from './Parser/Constants';
import { DRAPE_OF_SHAME_ITEM_ID } from './Parser/Modules/Legendaries/DrapeOfShame';
import { ILTERENDI_ITEM_ID } from './Parser/Modules/Legendaries/Ilterendi';
import { VELENS_ITEM_ID } from './Parser/Modules/Legendaries/Velens';
import { CHAIN_OF_THRAYN_ITEM_ID } from './Parser/Modules/Legendaries/ChainOfThrayn';
import { PRYDAZ_ITEM_ID } from './Parser/Modules/Legendaries/Prydaz';
import { OBSIDIAN_STONE_SPAULDERS_ITEM_ID } from './Parser/Modules/Legendaries/ObsidianStoneSpaulders';
import { MARAADS_DYING_BREATH_ITEM_ID } from './Parser/Modules/Legendaries/MaraadsDyingBreath';

class Results extends React.Component {
  static propTypes = {
    parser: React.PropTypes.object.isRequired,
    finished: React.PropTypes.bool.isRequired,
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
    };
  }

  constructor() {
    super();
    this.state = {
      friendlyStats: null,
    };
  }

  calculatePlayerBreakdown(parser) {
    const stats = this.constructor.calculateStats(parser);

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
      friendlyStats,
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.parser !== this.props.parser) {
      this.setState({
        friendlyStats: null,
      });
    }
    if (newProps.finished !== this.props.finished && newProps.finished) {
      this.calculatePlayerBreakdown(newProps.parser);
    }
  }

  static formatPercentage(percentage) {
    return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
  }

  render() {
    const { parser } = this.props;
    const { friendlyStats } = this.state;

    const stats = this.constructor.calculateStats(parser);

    const totalMasteryEffectiveness = stats.totalHealingFromMastery / (stats.totalMaxPotentialMasteryHealing || 1);
    const highestHealingFromMastery = friendlyStats && friendlyStats.reduce((highest,
                                                                             player) => Math.max(highest, player.healingFromMastery), 1);

    return (
      <div style={{ width: '100%' }}>
        <h1>
          <div className="back-button">
            <Link to={`/report/${parser.report.code}/${parser.player.name}`} data-tip="Back to fight selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          RESULTS
          <a
            href={`https://www.warcraftlogs.com/reports/${parser.report.code}/#fight=${parser.fight.id}`}
            target="_blank"
            className="pull-right"
            style={{ fontSize: '.6em' }}
          >
            <span className="glyphicon glyphicon-link" aria-hidden="true" /> Open report
          </a>
        </h1>

        <div className="row">
          <div className="col-md-8">
            <div className="row">
              <div className="col-xs-4">
                <StatisticBox
                  icon={<img src="./healing.png" style={{ height: 74 }} alt="Healing" />}
                  value={((parser.totalHealing || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                  label="Healing done"
                />
              </div>
              <div className="col-xs-4">
                <StatisticBox
                  icon={<img src="./mastery-radius.png" style={{ height: 74 }} alt="Mastery effectiveness" />}
                  value={`${(Math.round(totalMasteryEffectiveness * 10000) / 100).toFixed(2)} %`}
                  label={(
                    <dfn data-tip="Effects that temporarily increase your mastery are currently not supported and will skew results.">
                      Mastery effectiveness
                    </dfn>
                  )}
                />
              </div>
              {parser.modules.combatants.selected && parser.modules.combatants.selected.lv30Talent === RULE_OF_LAW_SPELL_ID && (
                <div className="col-xs-4">
                  <StatisticBox
                    icon={(
                      <a href="http://www.wowhead.com/spell=214202" target="_blank">
                        <img src="./ruleoflaw.jpg"
                          style={{ height: 74, borderRadius: 5, border: '1px solid #000' }}
                          alt="Rule of Law" />
                      </a>
                    )}
                    value={`${(Math.round(parser.modules.buffs.getBuffUptime(RULE_OF_LAW_SPELL_ID) / parser.fightDuration * 10000) / 100).toFixed(2)} %`}
                    label="Rule of Law uptime"
                  />
                </div>
              )}
              <div className="col-xs-4">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=53576" target="_blank">
                      <img src="./infusionoflight.jpg"
                        style={{ height: 74, borderRadius: 5, border: '1px solid #000' }}
                        alt="Unused Infusion of Light" />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage(parser.modules.castRatios.casts.flashOfLightWithIol / (parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol))} %`}
                  label={(
                    <dfn data-tip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${parser.modules.castRatios.casts.flashOfLightWithIol} Flash of Lights and ${parser.modules.castRatios.casts.holyLightWithIol} Holy Lights during Infusion of Light.`}>
                      IoL FoL to HL cast ratio
                    </dfn>
                  )}
                />
              </div>
              <div className="col-xs-4">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=53576" target="_blank">
                      <img src="./infusionoflight-bw.png"
                        style={{ height: 74, borderRadius: 5, border: '1px solid #000' }}
                        alt="Unused Infusion of Light" />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage(1 - (parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol) / (parser.modules.castRatios.casts.holyShockCriticals * parser.modules.castRatios.iolProcsPerHolyShockCrit))} %`}
                  label={(
                    <dfn data-tip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${parser.modules.castRatios.casts.holyShock} Holy Shocks with a ${this.constructor.formatPercentage(parser.modules.castRatios.casts.holyShockCriticals / parser.modules.castRatios.casts.holyShock)}% crit ratio. This gave you ${parser.modules.castRatios.casts.holyShockCriticals * parser.modules.castRatios.iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLightWithIol}.<br /><br />The ratio may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b> The spreadsheet will consider these bonus Infusion of Light procs and consider it appropriately.`}>
                      Unused Infusion of Lights
                    </dfn>
                  )}
                />
              </div>
              <div className="col-xs-4">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=19750" target="_blank">
                      <img src="./flashoflight.jpg"
                        style={{ height: 74, borderRadius: 5, border: '1px solid #000' }}
                        alt="Flash of Light" />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage((parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol) / (parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol + parser.modules.castRatios.casts.holyLight - parser.modules.castRatios.casts.holyLightWithIol))} %`}
                  label={(
                    <dfn data-tip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${parser.modules.castRatios.casts.flashOfLight - parser.modules.castRatios.casts.flashOfLightWithIol} filler Flash of Lights and ${parser.modules.castRatios.casts.holyLight - parser.modules.castRatios.casts.holyLightWithIol} filler Holy Lights.`}>
                      Filler cast ratio
                    </dfn>
                  )}
                />
              </div>
              <div className="col-xs-4">
                <StatisticBox
                  icon={(
                    <img src="./nonhealingtime.jpg"
                      style={{ height: 74, borderRadius: 5, border: '1px solid #000' }}
                      alt="Non healing time" />
                  )}
                  value={`${this.constructor.formatPercentage(parser.modules.alwaysBeCasting.totalHealingTimeWasted / (parser.fight.end_time - parser.fight.start_time))} %`}
                  label={(
                    <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${this.constructor.formatPercentage(parser.modules.alwaysBeCasting.totalTimeWasted / (parser.fight.end_time - parser.fight.start_time))} % of your time casting nothing at all.`}>
                      Non healing time
                    </dfn>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel">
              <div className="panel-heading">
                <h2>Items</h2>
              </div>
              <div className="panel-body">
                {parser.modules.combatants.selected && (
                  <ul className="list">
                    {(() => {
                      const items = [
                        parser.modules.combatants.selected.hasBack(DRAPE_OF_SHAME_ITEM_ID) && (
                          <li className="item clearfix" key={DRAPE_OF_SHAME_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=142170" target="_blank">
                              <img
                                src="./drapeofshame.jpg"
                                alt="Drape of Shame"
                              />
                              <header className="epic">
                                Drape of Shame
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
                                {`${((Math.round(parser.modules.drapeOfShame.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasRing(ILTERENDI_ITEM_ID) && (
                          <li className="item clearfix" key={ILTERENDI_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=137046" target="_blank">
                              <img
                                src="./ilterendi.jpg"
                                alt="Ilterendi, Crown Jewel of Silvermoon"
                              />
                              <header className="legendary">
                                Ilterendi, Crown Jewel of Silvermoon
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Ilterendi, Crown Jewel of Silvermoon equip effect.">
                                {`${((Math.round(parser.modules.ilterendi.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasTrinket(VELENS_ITEM_ID) && (
                          <li className="item clearfix" key={VELENS_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=144258" target="_blank">
                              <img
                                src="./velens.jpg"
                                alt="Velen's Future Sight"
                              />
                              <header className="legendary">
                                Velen's Future Sight
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
                                {`${((Math.round(parser.modules.velens.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasWaist(CHAIN_OF_THRAYN_ITEM_ID) && (
                          <li className="item clearfix" key={CHAIN_OF_THRAYN_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=137086" target="_blank">
                              <img
                                src="./chainOfThrayn.jpg"
                                alt="Chain of Thrayn"
                              />
                              <header className="legendary">
                                Chain of Thrayn
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Chain of Thrayn equip effect.">
                                {`${((Math.round(parser.modules.chainOfThrayn.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasNeck(PRYDAZ_ITEM_ID) && (
                          <li className="item clearfix" key={PRYDAZ_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=132444/prydaz-xavarics-magnum-opus" target="_blank">
                              <img
                                src="./prydaz.jpg"
                                alt="Prydaz, Xavaric's Magnum Opus"
                              />
                              <header className="legendary">
                                Prydaz, Xavaric's Magnum Opus
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
                                {`${((Math.round(parser.modules.prydaz.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasShoulder(OBSIDIAN_STONE_SPAULDERS_ITEM_ID) && (
                          <li className="item clearfix" key={OBSIDIAN_STONE_SPAULDERS_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=137076/obsidian-stone-spaulders" target="_blank">
                              <img
                                src="./obsidianstonespaulders.jpg"
                                alt="Obsidian Stone Spaulders"
                              />
                              <header className="legendary">
                                Obsidian Stone Spaulders
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Obsidian Stone Spaulders equip effect.">
                                {`${((Math.round(parser.modules.obsidianStoneSpaulders.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        ),
                        parser.modules.combatants.selected.hasBack(MARAADS_DYING_BREATH_ITEM_ID) && (
                          <li className="item clearfix" key={MARAADS_DYING_BREATH_ITEM_ID}>
                            <a href="http://www.wowhead.com/item=144273/maraads-dying-breath" target="_blank">
                              <img
                                src="./maraadsdyingbreath.jpg"
                                alt="Maraad's Dying Breath"
                              />
                              <header className="legendary">
                                Maraad's Dying Breath
                              </header>
                            </a>
                            <main>
                              <dfn data-tip="The actual effective healing contributed by the Maraad's Dying Breath equip effect when compared to casting an unbuffed LotM instead. The damage taken is ignored as this doesn't change with Maraad's and therefore doesn't impact the healing gain.">
                                {`${((Math.round(parser.modules.maraadsDyingBreath.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                              </dfn>
                            </main>
                          </li>
                        )
                      ];

                      if (items.length === 0) {
                        return (
                          <li className="item clearfix" style={{ paddingTop: 20, paddingBottom: 20 }}>
                            No noteworthy items.
                          </li>
                        );
                      }

                      return items;
                    })()}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {friendlyStats && (
          <div className="panel">
            <div className="panel-heading">
              <h2>Player breakdown</h2>
            </div>
            <div className="panel-body">
              <PlayerBreakdown friendlyStats={friendlyStats}
                highestHealingFromMastery={highestHealingFromMastery}
                totalHealingFromMastery={stats.totalHealingFromMastery} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Results;
