import React from 'react';
import { Link } from 'react-router';

import StatisticBox from './StatisticBox';
import PlayerBreakdown from './PlayerBreakdown';
import CastEfficiency from './CastEfficiency';
import Talents from './Talents';

import {
  RULE_OF_LAW_SPELL_ID,
  T19_4SET_BONUS_BUFF_ID,
  FLASH_OF_LIGHT_SPELL_ID,
  HOLY_LIGHT_SPELL_ID,
  HOLY_SHOCK_HEAL_SPELL_ID,
  BEACON_TYPES
} from './Parser/Constants';
import { DRAPE_OF_SHAME_ITEM_ID } from './Parser/Modules/Legendaries/DrapeOfShame';
import { ILTERENDI_ITEM_ID } from './Parser/Modules/Legendaries/Ilterendi';
import { VELENS_ITEM_ID } from './Parser/Modules/Legendaries/Velens';
import { CHAIN_OF_THRAYN_ITEM_ID } from './Parser/Modules/Legendaries/ChainOfThrayn';
import { PRYDAZ_ITEM_ID } from './Parser/Modules/Legendaries/Prydaz';
import { OBSIDIAN_STONE_SPAULDERS_ITEM_ID } from './Parser/Modules/Legendaries/ObsidianStoneSpaulders';
import { MARAADS_DYING_BREATH_ITEM_ID } from './Parser/Modules/Legendaries/MaraadsDyingBreath';

import { CPM_ABILITIES } from './CastEfficiency';

function getBeaconIcon(spellId) {
  switch (spellId) {
    case BEACON_TYPES.BEACON_OF_FATH:
      return 'beaconOfFaith';
    case BEACON_TYPES.BEACON_OF_THE_LIGHTBRINGER:
      return 'beaconOfTheLightbringer';
    case BEACON_TYPES.BEACON_OF_VIRTUE:
      return 'beaconOfVirtue';
    default:
      return '';
  }
}

const TABS = {
  ISSUES: 'ISSUES',
  TALENTS: 'TALENTS',
  CAST_EFFICIENCY: 'CAST_EFFICIENCY',
  PLAYER_BREAKDOWN: 'PLAYER_BREAKDOWN',
};

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

  issues = [];

  constructor() {
    super();
    this.state = {
      friendlyStats: null,
      activeTab: TABS.ISSUES,
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

  get iolProcsPerHolyShockCrit() {
    return this.props.parser.buffs.hasBuff(T19_4SET_BONUS_BUFF_ID) ? 2 : 1;
  }

  getFightDuration(parser) {
    return (parser.finished ? parser.fight.end_time : parser.currentTimestamp) - parser.fight.start_time;
  }

  getCastEfficiency(parser) {
    const fightDuration = this.getFightDuration(parser);
    const minutes = fightDuration / 1000 / 60;

    const castCounter = parser.modules.castCounter;
    const getCastCount = spellId => castCounter.casts[spellId] || {};

    const selectedCombatant = parser.selectedCombatant;
    if (!selectedCombatant) {
      return null;
    }

    const hastePercentage = selectedCombatant ? selectedCombatant.hastePercentage : 0;

    return CPM_ABILITIES
      .filter(ability => !ability.isActive || ability.isActive(selectedCombatant))
      .map((ability) => {
        const castCount = getCastCount(ability.spellId);
        const casts = (ability.getCasts ? ability.getCasts(castCount) : castCount.casts) || 0;
        if (ability.hideWithZeroCasts && casts === 0) {
          return null;
        }
        const cpm = casts / minutes;

        const cooldown = ability.getCooldown(hastePercentage);
        // By dividing the fight duration by the cooldown we get the max amount of casts during this particular fight, we round this up because you would be able to cast once at the start of the fight and once at the end since abilities always start off cooldown (e.g. fight is 100 seconds long, you could cast 2 Holy Avengers with a 90 sec cooldown). Good players should be able to reasonably predict this and maximize their casts.
        const rawMaxCasts = (fightDuration / 1000 / cooldown) + (ability.charges ? ability.charges - 1 : 0);
        const maxCasts = Math.ceil(rawMaxCasts);
        const maxCpm = cooldown === null ? null : maxCasts / minutes;
        // The reason cast efficiency is based on the `rawMaxCasts` is that it you usually want to save cooldowns for periods where there is a lot of damage coming. Instead of adding a static buffer, this is more dynamic in that if you had 90% of the cooldown time to cast it you probably could have found a good moment, while if you only had 10% of the time then it isn't as likely there was a good opportunity. By making this based on the cooldown time, this scales with the strength of the cooldown; a 1.5 min cooldown is weaker than a 3 min cooldown.
        const castEfficiency = cooldown === null ? null : Math.min(1, casts / rawMaxCasts);

        const canBeImproved = castEfficiency !== null && castEfficiency < (ability.recommendedCastEfficiency || 0.8);

        if (canBeImproved) {
          this.issues.push(`Try to cast <a href="http://www.wowhead.com/spell=${ability.spellId}" target="_blank">${ability.name}</a> more often (${casts}/${maxCasts} casts: ${Math.round(castEfficiency * 100)}% cast efficiency). ${ability.extraSuggestion || ''}`);
        }

        return {
          ability,
          cpm,
          maxCpm,
          casts,
          maxCasts,
          castEfficiency,
          canBeImproved,
        };
      })
      .filter(item => item !== null);
  }

  getTotalHealsOnBeaconPercentage(parser) {
    const castCounter = parser.modules.castCounter;
    const getCastCount = spellId => castCounter.casts[spellId] || {};

    const selectedCombatant = parser.selectedCombatant;
    if (!selectedCombatant) {
      return null;
    }

    let casts = 0;
    let castsOnBeacon = 0;

    CPM_ABILITIES
      .filter(ability => !ability.isActive || ability.isActive(selectedCombatant))
      .forEach((ability) => {
        const castCount = getCastCount(ability.spellId);
        casts += (ability.getCasts ? ability.getCasts(castCount) : castCount.casts) || 0;
        castsOnBeacon += castCount.withBeacon || 0;
      });

    return castsOnBeacon / casts;
  }

  render() {
    const { parser } = this.props;
    const { friendlyStats } = this.state;

    this.issues = [];

    const stats = this.constructor.calculateStats(parser);

    const totalMasteryEffectiveness = stats.totalHealingFromMastery / (stats.totalMaxPotentialMasteryHealing || 1);
    const highestHealingFromMastery = friendlyStats && friendlyStats.reduce((highest, player) => Math.max(highest, player.healingFromMastery), 1);
    const ruleOfLawUptime = parser.modules.buffs.getBuffUptime(RULE_OF_LAW_SPELL_ID) / parser.fightDuration;

    const castCounter = parser.modules.castCounter;
    const getCastCount = spellId => castCounter.casts[spellId] || {};

    const iolFlashOfLights = getCastCount(FLASH_OF_LIGHT_SPELL_ID).withIol || 0;
    const iolHolyLights = getCastCount(HOLY_LIGHT_SPELL_ID).withIol || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;
    const iolFoLToHLCastRatio = iolFlashOfLights / totalIols;

    const flashOfLightHeals = getCastCount(FLASH_OF_LIGHT_SPELL_ID).hits || 0;
    const holyLightHeals = getCastCount(HOLY_LIGHT_SPELL_ID).hits || 0;
    const totalFolsAndHls = flashOfLightHeals + holyLightHeals;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;
    const totalFillers = fillerFlashOfLights + fillerHolyLights;
    const fillerCastRatio = fillerFlashOfLights / totalFillers;

    const beaconFlashOfLights = getCastCount(FLASH_OF_LIGHT_SPELL_ID).withBeacon || 0;
    const beaconHolyLights = getCastCount(HOLY_LIGHT_SPELL_ID).withBeacon || 0;
    const totalFolsAndHlsOnBeacon = beaconFlashOfLights + beaconHolyLights;
    const healsOnBeacon = totalFolsAndHlsOnBeacon / totalFolsAndHls;

    const holyShockHeals = getCastCount(HOLY_SHOCK_HEAL_SPELL_ID).hits || 0;
    const holyShockCrits = getCastCount(HOLY_SHOCK_HEAL_SPELL_ID).crits || 0;
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const unusedIolRate = 1 - totalIols / (holyShockCrits * iolProcsPerHolyShockCrit);

    const fightDuration = this.getFightDuration(parser);

    const nonHealingTimePercentage = parser.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = parser.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const totalHealsOnBeaconPercentage = this.getTotalHealsOnBeaconPercentage(parser);
    const hasIlterendi = parser.selectedCombatant && parser.selectedCombatant.hasRing(ILTERENDI_ITEM_ID);
    const ilterendiHealingPercentage = parser.modules.ilterendi.healing / parser.totalHealing;

    if (nonHealingTimePercentage > 0.3) {
      this.issues.push(`Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`);
    }
    if (deadTimePercentage > 0.2) {
      this.issues.push(`Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`);
    }
    if (totalHealsOnBeaconPercentage > 0.2) {
      this.issues.push(`Try to avoid directly healing your tanks; it is ineffecient and beacon transfers are usually enough (${Math.round(totalHealsOnBeaconPercentage * 100)}% of all your heals were on a beacon).`);
    }
    if (totalMasteryEffectiveness < 0.7) {
      this.issues.push(`Your Mastery Effectiveness can be improved. Try to improve your positioning, usually by sticking with melee (${Math.round(totalMasteryEffectiveness * 100)}% mastery effectiveness).`);
    }
    if (ruleOfLawUptime < 0.25) {
      this.issues.push(`Your <a href="http://www.wowhead.com/spell=214202" target="_blank">Rule of Law</a> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges (${Math.round(ruleOfLawUptime * 100)}% uptime).`);
    }
    if (iolFoLToHLCastRatio < 0.6) {
      this.issues.push(`Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <a href="http://www.wowhead.com/spell=53576" target="_blank">Infusion of Light</a> proc try to cast Flash of Light as much as possible, it is a considerably stronger heal (${Math.round(iolFoLToHLCastRatio * 100)}% Flash of Lights to Holy Lighs cast with Infusion of Light).`);
    }
    if (unusedIolRate > 0.3) {
      this.issues.push(`Your usage of <a href="http://www.wowhead.com/spell=53576" target="_blank">Infusion of Light</a> procs can be improved. Try to use your Infusion of Light procs whenever it wouldn't overheal (${Math.round(unusedIolRate * 100)}% unused Infusion of Lights).`);
    }
    if (hasIlterendi && ilterendiHealingPercentage < 0.04) {
      this.issues.push(`Your usage of <a href="http://www.wowhead.com/item=137046" target="_blank" class="legendary">Ilterendi, Crown Jewel of Silvermoon</a> can be improved. Try to line Light of Dawn and Holy Shock up with the buff (${(ilterendiHealingPercentage * 100).toFixed(2)}% healing contributed).`);
    }

    const castEfficiency = this.getCastEfficiency(parser);


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
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <img
                      src="./healing.png"
                      style={{ border: 0 }}
                      alt="Healing"
                    />)}
                  value={((parser.totalHealing || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}
                  label="Healing done"
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <img
                      src="./mastery-radius.png"
                      style={{ border: 0 }}
                      alt="Mastery effectiveness"
                    />
                  )}
                  value={`${(Math.round(totalMasteryEffectiveness * 10000) / 100).toFixed(2)} %`}
                  label={(
                    <dfn data-tip="Effects that temporarily increase your mastery are currently not supported and will skew results.">
                      Mastery effectiveness
                    </dfn>
                  )}
                />
              </div>
              {parser.selectedCombatant && parser.selectedCombatant.lv30Talent === RULE_OF_LAW_SPELL_ID && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={(
                      <a href="http://www.wowhead.com/spell=214202" target="_blank">
                        <img src="./ruleoflaw.jpg"
                          alt="Rule of Law" />
                      </a>
                    )}
                    value={`${this.constructor.formatPercentage(ruleOfLawUptime)} %`}
                    label="Rule of Law uptime"
                  />
                </div>
              )}
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=53576" target="_blank">
                      <img src="./infusionoflight.jpg"
                        alt="Unused Infusion of Light" />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage(iolFoLToHLCastRatio)} %`}
                  label={(
                    <dfn data-tip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${iolFlashOfLights} Flash of Lights and ${iolHolyLights} Holy Lights during Infusion of Light.`}>
                      IoL FoL to HL cast ratio
                    </dfn>
                  )}
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=53576" target="_blank">
                      <img
                        src="./infusionoflight-bw.png"
                        alt="Unused Infusion of Light"
                      />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage(unusedIolRate)} %`}
                  label={(
                    <dfn data-tip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockHeals} (healing) Holy Shocks with a ${this.constructor.formatPercentage(holyShockCrits / holyShockHeals)}% crit ratio. This gave you ${holyShockCrits * iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${totalIols}.<br /><br />The ratio may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b> The spreadsheet will consider these bonus Infusion of Light procs and consider it appropriately.`}>
                      Unused Infusion of Lights
                    </dfn>
                  )}
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <a href="http://www.wowhead.com/spell=19750" target="_blank">
                      <img
                        src="./flashoflight.jpg"
                        alt="Flash of Light"
                      />
                    </a>
                  )}
                  value={`${this.constructor.formatPercentage(fillerCastRatio)} %`}
                  label={(
                    <dfn data-tip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${fillerFlashOfLights} filler Flash of Lights and ${fillerHolyLights} filler Holy Lights.`}>
                      Filler cast ratio
                    </dfn>
                  )}
                />
              </div>
              {parser.selectedCombatant && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={(
                      <a href={`http://www.wowhead.com/spell=${parser.selectedCombatant && parser.selectedCombatant.lv100Talent}`} target="_blank">
                        <img
                          src={`./${getBeaconIcon(parser.selectedCombatant && parser.selectedCombatant.lv100Talent)}.jpg`}
                          alt="Beacon"
                        />
                      </a>
                    )}
                    value={`${this.constructor.formatPercentage(healsOnBeacon)} %`}
                    label={(
                      <dfn data-tip={`The amount of Flash of Lights and Holy Lights cast on beacon targets. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.<br /><br />Your total heals on beacons was <b>${(totalHealsOnBeaconPercentage * 100).toFixed(2)}%</b> (this includes spell other than FoL and HL).`}>
                        FoL/HL cast on beacon
                      </dfn>
                    )}
                  />
                </div>
              )}
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <img
                      src="./nonhealingtime.jpg"
                      alt="Non healing time"
                    />
                  )}
                  value={`${this.constructor.formatPercentage(nonHealingTimePercentage)} %`}
                  label={(
                    <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${this.constructor.formatPercentage(deadTimePercentage)} % of your time casting nothing at all.`}>
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
              <div className="panel-body" style={{ padding: 0 }}>
                {parser.selectedCombatant && (
                  <ul className="list">
                    {(() => {
                      const items = [
                        parser.selectedCombatant.hasBack(DRAPE_OF_SHAME_ITEM_ID) && (
                          <li className="item clearfix" key={DRAPE_OF_SHAME_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./drapeofshame.jpg"
                                  alt="Drape of Shame"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=142170" target="_blank" className="epic">
                                    Drape of Shame
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
                                    {`${((Math.round(parser.modules.drapeOfShame.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        hasIlterendi && (
                          <li className="item clearfix" key={ILTERENDI_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./ilterendi.jpg"
                                  alt="Ilterendi, Crown Jewel of Silvermoon"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=137046" target="_blank" className="legendary">
                                    Ilterendi, Crown Jewel of Silvermoon
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Ilterendi, Crown Jewel of Silvermoon equip effect.">
                                    {`${((ilterendiHealingPercentage * 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.selectedCombatant.hasTrinket(VELENS_ITEM_ID) && (
                          <li className="item clearfix" key={VELENS_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./velens.jpg"
                                  alt="Velen's Future Sight"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=144258" target="_blank" className="legendary">
                                    Velen's Future Sight
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
                                    {`${((Math.round(parser.modules.velens.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.selectedCombatant.hasWaist(CHAIN_OF_THRAYN_ITEM_ID) && (
                          <li className="item clearfix" key={CHAIN_OF_THRAYN_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./chainOfThrayn.jpg"
                                  alt="Chain of Thrayn"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=137086" target="_blank" className="legendary">
                                    Chain of Thrayn
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Chain of Thrayn equip effect.">
                                    {`${((Math.round(parser.modules.chainOfThrayn.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.selectedCombatant.hasNeck(PRYDAZ_ITEM_ID) && (
                          <li className="item clearfix" key={PRYDAZ_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./prydaz.jpg"
                                  alt="Prydaz, Xavaric's Magnum Opus"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=132444/prydaz-xavarics-magnum-opus" target="_blank" className="legendary">
                                    Prydaz, Xavaric's Magnum Opus
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
                                    {`${((Math.round(parser.modules.prydaz.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.selectedCombatant.hasShoulder(OBSIDIAN_STONE_SPAULDERS_ITEM_ID) && (
                          <li className="item clearfix" key={OBSIDIAN_STONE_SPAULDERS_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./obsidianstonespaulders.jpg"
                                  alt="Obsidian Stone Spaulders"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=137076/obsidian-stone-spaulders" target="_blank" className="legendary">
                                    Obsidian Stone Spaulders
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Obsidian Stone Spaulders equip effect.">
                                    {`${((Math.round(parser.modules.obsidianStoneSpaulders.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.selectedCombatant.hasBack(MARAADS_DYING_BREATH_ITEM_ID) && (
                          <li className="item clearfix" key={MARAADS_DYING_BREATH_ITEM_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./maraadsdyingbreath.jpg"
                                  alt="Maraad's Dying Breath"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/item=144273/maraads-dying-breath" target="_blank" className="legendary">
                                    Maraad's Dying Breath
                                  </a>
                                </header>
                                <main>
                                  <dfn data-tip="The actual effective healing contributed by the Maraad's Dying Breath equip effect when compared to casting an unbuffed LotM instead. The damage taken is ignored as this doesn't change with Maraad's and therefore doesn't impact the healing gain.">
                                    {`${((Math.round(parser.modules.maraadsDyingBreath.healing / parser.totalHealing * 10000) / 100) || 0).toFixed(2)} %`}
                                  </dfn>
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
                        parser.modules.buffs.hasBuff(T19_4SET_BONUS_BUFF_ID) && (
                          <li className="item clearfix" key={T19_4SET_BONUS_BUFF_ID}>
                            <article>
                              <figure>
                                <img
                                  src="./infusionoflight.jpg"
                                  alt="Infusion of Light"
                                />
                              </figure>
                              <div>
                                <header>
                                  <a href="http://www.wowhead.com/spell=211438/item-paladin-t19-holy-4p-bonus" target="_blank">
                                    T19 4 set bonus
                                  </a>
                                </header>
                                <main>
                                  {holyShockCrits * (iolProcsPerHolyShockCrit - 1)} bonus Infusion of Light charges gained
                                </main>
                              </div>
                            </article>
                          </li>
                        ),
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

        <div className="panel">
          <div className="panel-body flex" style={{ padding: '0' }}>
            <div className="navigation" style={{ flex: '0 0 auto', width: 200, minHeight: 400 }}>
              <div className="panel-heading">
                <h2>Menu</h2>
              </div>
              <div style={{ padding: '10px 0' }}>
                <ul>
                  <li
                    className={this.state.activeTab === TABS.ISSUES ? 'active' : ''}
                    onClick={() => this.setState({ activeTab: TABS.ISSUES })}
                  >
                    Suggestions <span className="badge">{this.issues.length}</span>
                  </li>
                  <li
                    className={this.state.activeTab === TABS.TALENTS ? 'active' : ''}
                    onClick={() => this.setState({ activeTab: TABS.TALENTS })}
                  >
                    Talents
                  </li>
                  <li
                    className={this.state.activeTab === TABS.CAST_EFFICIENCY ? 'active' : ''}
                    onClick={() => this.setState({ activeTab: TABS.CAST_EFFICIENCY })}
                  >
                    Cast efficiency
                  </li>
                  <li
                    className={this.state.activeTab === TABS.PLAYER_BREAKDOWN ? 'active' : ''}
                    onClick={() => this.setState({ activeTab: TABS.PLAYER_BREAKDOWN })}
                  >
                    Mastery effectiveness player breakdown
                  </li>
                </ul>
              </div>
            </div>
            <div>
              {this.state.activeTab === TABS.ISSUES && (
                <div>
                  <div className="panel-heading">
                    <h2>Suggestions (BETA)</h2>
                  </div>
                  <div style={{ padding: '0 0' }}>
                    <ul className="list">
                      {this.issues.map(issue => (
                        <li className="item" style={{ padding: '10px 22px' }} dangerouslySetInnerHTML={{ __html: issue }} />
                      ))}
                      <li className="text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
                        Some of these suggestions may be nitpicky or fight dependent but often it's still something you could look to improve. You will have to figure out yourself what you should focus on improving
                        <b>first</b>, don't try to improve everything at once.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {this.state.activeTab === TABS.TALENTS && (
                <div>
                  <div className="panel-heading">
                    <h2>Talents</h2>
                  </div>
                  <div style={{ padding: '10px 0' }}>
                    <Talents
                      combatant={parser.selectedCombatant}
                    />
                  </div>
                </div>
              )}
              {this.state.activeTab === TABS.CAST_EFFICIENCY && (
                <div>
                  <div className="panel-heading">
                    <h2>Cast efficiency</h2>
                  </div>
                  <div style={{ padding: '10px 0' }}>
                    <CastEfficiency
                      abilities={castEfficiency}
                    />
                  </div>
                </div>
              )}
              {this.state.activeTab === TABS.PLAYER_BREAKDOWN && (
                <div>
                  <div className="panel-heading">
                    <h2>Mastery effectiveness player breakdown</h2>
                  </div>
                  <div style={{ padding: '10px 0 15px' }}>
                    <PlayerBreakdown
                      friendlyStats={friendlyStats}
                      highestHealingFromMastery={highestHealingFromMastery}
                      totalHealingFromMastery={stats.totalHealingFromMastery}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Results;
