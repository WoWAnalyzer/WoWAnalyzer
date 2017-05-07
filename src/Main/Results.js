import React from 'react';
import { Link } from 'react-router';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import UpArrow from 'Icons/UpArrow';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import StatisticBox from './StatisticBox';
import PlayerBreakdown from './PlayerBreakdown';
import CastEfficiency from './CastEfficiency';
import Talents from './Talents';
import Mana from './Mana';
import getCastEfficiency from './getCastEfficiency';

import {
  DIVINE_PURPOSE_HOLY_SHOCK_SPELL_ID,
  DIVINE_PURPOSE_LIGHT_OF_DAWN_SPELL_ID,
} from './Parser/Constants';
import { SACRED_DAWN_TRAIT_ID } from './Parser/Modules/Features/SacredDawn';
import { ILTERENDI_ITEM_ID } from './Parser/Modules/Legendaries/Ilterendi';
import { MARAADS_DYING_BREATH_ITEM_ID } from './Parser/Modules/Legendaries/MaraadsDyingBreath';

import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}
function getRawHealing(ability) {
  return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
}
function getOverhealingPercentage(ability) {
  return ability.healingOverheal / getRawHealing(ability);
}

const TABS = {
  ISSUES: 'suggestions',
  TALENTS: 'talents',
  MANA: 'mana',
  CAST_EFFICIENCY: 'cast-efficiency',
  PLAYER_BREAKDOWN: 'player-breakdown',
};

const getIssueImportance = (value, regular, major, higherIsWorse = false) => {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
};

class Results extends React.Component {
  static propTypes = {
    parser: React.PropTypes.object.isRequired,
    finished: React.PropTypes.bool.isRequired,
    tab: React.PropTypes.string,
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
      showMinorIssues: false,
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
    return this.props.parser.selectedCombatant.hasBuff(SPELLS.T19_4SET_BONUS_BUFF.id) ? 2 : 1;
  }

  getTotalHealsOnBeaconPercentage(parser) {
    const abilityTracker = parser.modules.abilityTracker;

    const selectedCombatant = parser.selectedCombatant;
    if (!selectedCombatant) {
      return null;
    }

    let casts = 0;
    let castsOnBeacon = 0;

    Object.values(abilityTracker.abilities).forEach((ability) => {
      casts += ability.healingHits || 0;
      castsOnBeacon += ability.healingBeaconHits || 0;
    });

    return castsOnBeacon / casts;
  }

  render() {
    const { parser, tab, onChangeTab } = this.props;
    const { friendlyStats } = this.state;

    const activeTab = tab || TABS.ISSUES;

    if (!parser.selectedCombatant) {
      return (
        <div>
          <h1>
            <div className="back-button">
              <Link to={`/report/${parser.report.code}/${parser.player.name}`} data-tip="Back to fight selection">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
              </Link>
            </div>
            Initializing report...
          </h1>

          <div className="spinner"></div>
        </div>
      );
    }

    this.issues = [];

    const stats = this.constructor.calculateStats(parser);

    const totalMasteryEffectiveness = stats.totalHealingFromMastery / (stats.totalMaxPotentialMasteryHealing || 1);
    const highestHealingFromMastery = friendlyStats && friendlyStats.reduce((highest, player) => Math.max(highest, player.healingFromMastery), 1);
    const ruleOfLawUptime = parser.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / parser.fightDuration;

    const abilityTracker = parser.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);
    const lightOfDawnCast = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id);
    const lightOfDawnHeal = getAbility(SPELLS.LIGHT_OF_DAWN_HEAL.id);
    const holyShock = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);
    const bestowFaith = getAbility(SPELLS.BESTOW_FAITH_TALENT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;
    const iolFoLToHLCastRatio = iolFlashOfLights / totalIols;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const totalFolsAndHls = flashOfLightHeals + holyLightHeals;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;
    const totalFillers = fillerFlashOfLights + fillerHolyLights;
    const fillerCastRatio = fillerFlashOfLights / totalFillers;

    const beaconFlashOfLights = flashOfLight.healingBeaconHits || 0;
    const beaconHolyLights = holyLight.healingBeaconHits || 0;
    const totalFolsAndHlsOnBeacon = beaconFlashOfLights + beaconHolyLights;
    const healsOnBeacon = totalFolsAndHlsOnBeacon / totalFolsAndHls;

    const lightOfDawnHeals = lightOfDawnCast.casts || 0;
    const holyShockHeals = holyShock.healingHits || 0;
    const holyShockCrits = holyShock.healingCriticalHits || 0;
    const iolProcsPerHolyShockCrit = this.iolProcsPerHolyShockCrit;
    const unusedIolRate = 1 - totalIols / (holyShockCrits * iolProcsPerHolyShockCrit);

    const fightDuration = parser.fightDuration;

    const hasCrusadersMight = parser.selectedCombatant.lv15Talent === SPELLS.CRUSADERS_MIGHT_TALENT.id;
    const hasAuraOfMercy = parser.selectedCombatant.lv60Talent === SPELLS.AURA_OF_MERCY_TALENT.id;
    const hasAuraOfSacrifice = parser.selectedCombatant.lv60Talent === SPELLS.AURA_OF_SACRIFICE_TALENT.id;
    const auraOfSacrificeHps = (getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingAbsorbed) / fightDuration * 1000;
    // const hasDevotionAura = parser.selectedCombatant.lv60Talent === SPELLS.DEVOTION_AURA_TALENT.id;
    const has4PT19 = parser.selectedCombatant.hasBuff(SPELLS.T19_4SET_BONUS_BUFF.id);

    const nonHealingTimePercentage = parser.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = parser.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const totalHealsOnBeaconPercentage = this.getTotalHealsOnBeaconPercentage(parser);
    const velensHealingPercentage = parser.modules.velens.healing / parser.totalHealing;
    const chainOfThraynHealingPercentage = parser.modules.chainOfThrayn.healing / parser.totalHealing;
    const prydazHealingPercentage = parser.modules.prydaz.healing / parser.totalHealing;
    const obsidianStoneSpauldersHealingPercentage = parser.modules.obsidianStoneSpaulders.healing / parser.totalHealing;
    const drapeOfShameHealingPercentage = parser.modules.drapeOfShame.healing / parser.totalHealing;
    const maraadsDyingBreathHealingPercentage = parser.modules.maraadsDyingBreath.healing / parser.totalHealing;
    const ilterendiHealingPercentage = parser.modules.ilterendi.healing / parser.totalHealing;
    const hasSacredDawn = parser.selectedCombatant.traitsBySpellId[SACRED_DAWN_TRAIT_ID] === 1;
    const sacredDawnPercentage = parser.modules.sacredDawn.healing / parser.totalHealing;
    const tyrsDeliveranceHealHealingPercentage = parser.modules.tyrsDeliverance.healHealing / parser.totalHealing;
    const tyrsDeliveranceBuffFoLHLHealingPercentage = parser.modules.tyrsDeliverance.buffFoLHLHealing / parser.totalHealing;
    const tyrsDeliverancePercentage = tyrsDeliveranceHealHealingPercentage + tyrsDeliveranceBuffFoLHLHealingPercentage;
    const hasRuleOfLaw = parser.selectedCombatant.lv30Talent === SPELLS.RULE_OF_LAW_TALENT.id;

    const hasDivinePurpose = parser.selectedCombatant.lv75Talent === SPELLS.DIVINE_PURPOSE_TALENT.id;
    const divinePurposeHolyShockProcs = hasDivinePurpose && parser.selectedCombatant.getBuffTriggerCount(DIVINE_PURPOSE_HOLY_SHOCK_SPELL_ID);
    const divinePurposeLightOfDawnProcs = hasDivinePurpose && parser.selectedCombatant.getBuffTriggerCount(DIVINE_PURPOSE_LIGHT_OF_DAWN_SPELL_ID);

    if (nonHealingTimePercentage > 0.3) {
      this.issues.push({
        issue: `Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonHealingTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      this.issues.push({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    if (totalHealsOnBeaconPercentage > 0.2) {
      this.issues.push({
        issue: `Try to avoid directly healing your beacon targets; it is ineffecient and the healing from beacon transfers are usually enough (${Math.round(totalHealsOnBeaconPercentage * 100)}% of all your heals were on a beacon).`,
        icon: 'ability_paladin_beaconoflight',
        importance: getIssueImportance(totalHealsOnBeaconPercentage, 0.25, 0.35, true),
      });
    }
    if (totalMasteryEffectiveness < 0.75) {
      this.issues.push({
        issue: `Your Mastery Effectiveness can be improved. Try to improve your positioning, usually by sticking with melee (${Math.round(totalMasteryEffectiveness * 100)}% mastery effectiveness).`,
        icon: 'inv_hammer_04',
        importance: getIssueImportance(totalMasteryEffectiveness, 0.7, 0.6),
      });
    }
    if (hasRuleOfLaw && ruleOfLawUptime < 0.25) {
      this.issues.push({
        issue: <span>Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges ({(ruleOfLawUptime * 100).toFixed(2)}% uptime).</span>,
        icon: SPELLS.RULE_OF_LAW_TALENT.icon,
        importance: getIssueImportance(ruleOfLawUptime, 0.2, 0.1),
      });
    }
    if (iolFoLToHLCastRatio < 0.7) {
      this.issues.push({
        issue: <span>Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc try to cast <SpellLink id={SPELLS.HOLY_LIGHT.id} /> as much as possible, it is a considerably stronger heal ({iolFlashOfLights} Flash of Lights ({Math.round(iolFoLToHLCastRatio * 100)}%) to {iolHolyLights} Holy Lights ({Math.round(100 - iolFoLToHLCastRatio * 100)}%) cast with Infusion of Light).</span>,
        icon: SPELLS.INFUSION_OF_LIGHT.icon,
        importance: getIssueImportance(iolFoLToHLCastRatio, 0.6, 0.4),
      });
    }
    let recommendedUnusedIolRate = has4PT19 ? 0.2 : 0;
    if (hasCrusadersMight) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    if (hasDivinePurpose) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    if (unusedIolRate > recommendedUnusedIolRate) {
      this.issues.push({
        issue: <span>Your usage of <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> procs can be improved. Try to use your Infusion of Light procs whenever it wouldn't overheal ({Math.round(unusedIolRate * 100)}% unused Infusion of Lights).</span>,
        icon: 'ability_paladin_infusionoflight-bw',
        importance: getIssueImportance(unusedIolRate, recommendedUnusedIolRate + 0.05, recommendedUnusedIolRate + 0.2, true),
      });
    }
    if (parser.modules.ilterendi.active && ilterendiHealingPercentage < 0.045) {
      this.issues.push({
        issue: <span>Your usage of <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} /> can be improved. Try to line <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> up with the buff or consider using an easier legendary ({(ilterendiHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.icon,
        importance: getIssueImportance(ilterendiHealingPercentage, 0.04, 0.03),
      });
    }
    if (parser.modules.velens.active && velensHealingPercentage < 0.045) {
      this.issues.push({
        issue: <span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.VELENS_FUTURE_SIGHT.icon,
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    const lightOfTheMartyrs = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id).casts || 0;
    let fillerLotms = lightOfTheMartyrs;
    if (parser.modules.maraadsDyingBreath.active) {
      const lightOfTheDawns = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id).casts || 0;
      fillerLotms -= lightOfTheDawns;
    }
    const fillerLotmsPerMinute = fillerLotms / (fightDuration / 1000) * 60;
    if (fillerLotmsPerMinute >= 1.0) {
      let issue = '';
      if (parser.modules.maraadsDyingBreath.active) {
        issue = <span>With <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} /> you should only cast <b>one</b> <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Without the buff <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast additional Light of the Martyr when absolutely necessary ({fillerLotmsPerMinute.toFixed(2)} CPM (unbuffed only)).</span>;
      } else {
        issue = <span><SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast Light of the Martyr when absolutely necessary ({fillerLotmsPerMinute.toFixed(2)} CPM).</span>;
      }
      this.issues.push({
        issue,
        icon: SPELLS.LIGHT_OF_THE_MARTYR.icon,
        importance: getIssueImportance(fillerLotmsPerMinute, 1.5, 2, true),
      });
    }
    if (auraOfSacrificeHps < 30000) {
      this.issues.push({
        issue: <span>The healing done by your <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> is low. Try to find a better moment to cast it or consider changing to <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable ({formatNumber(auraOfSacrificeHps)} HPS).</span>,
        icon: SPELLS.AURA_OF_SACRIFICE_TALENT.icon,
        importance: getIssueImportance(auraOfSacrificeHps, 25000, 20000),
      });
    }
    const lodOverhealing = getOverhealingPercentage(lightOfDawnHeal);
    let recommendedLodOverhealing = hasDivinePurpose ? 0.45 : 0.4;
    if (lodOverhealing > recommendedLodOverhealing) {
      this.issues.push({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Save it for when people are missing health ({Math.round(lodOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.LIGHT_OF_DAWN_CAST.icon,
        importance: getIssueImportance(lodOverhealing, recommendedLodOverhealing + 0.1, recommendedLodOverhealing + 0.2, true),
      });
    }
    const hsOverhealing = getOverhealingPercentage(holyShock);
    let recommendedHsOverhealing = hasDivinePurpose ? 0.4 : 0.35;
    if (hsOverhealing > recommendedHsOverhealing) {
      this.issues.push({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />. Save it for when people are missing health ({Math.round(hsOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.HOLY_SHOCK_HEAL.icon,
        importance: getIssueImportance(hsOverhealing, recommendedHsOverhealing + 0.1, recommendedHsOverhealing + 0.2, true),
      });
    }
    const folOverhealing = getOverhealingPercentage(flashOfLight);
    let recommendedFolOverhealing = 0.25;
    if (folOverhealing > recommendedFolOverhealing) {
      this.issues.push({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />. If Flash of Light would overheal it is generally advisable to cast a <SpellLink id={SPELLS.HOLY_LIGHT.id} /> instead ({Math.round(folOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.FLASH_OF_LIGHT.icon,
        importance: getIssueImportance(folOverhealing, recommendedFolOverhealing + 0.15, recommendedFolOverhealing + 0.25, true),
      });
    }
    const bfOverhealing = getOverhealingPercentage(bestowFaith);
    let recommendedBfOverhealing = 0.4;
    if (bfOverhealing > recommendedBfOverhealing) {
      this.issues.push({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />. Cast it just before someone is about to take damage and consider casting it on targets other than tanks ({Math.round(bfOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.BESTOW_FAITH_TALENT.icon,
        importance: getIssueImportance(bfOverhealing, recommendedBfOverhealing + 0.1, recommendedBfOverhealing + 0.2, true),
      });
    }

    // TODO: Suggestion for AoS when it didn't heal enough to be worthwhile
    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile (also devo damage display)
    // TODO: Suggestion for mana
    // TODO: Suggestion for enchants
    // TODO: Sanctified Wrath healing contribution

    const castEfficiency = getCastEfficiency(parser);
    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        this.issues.push({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often ({cpm.casts}/{cpm.maxCasts} casts: {Math.round(cpm.castEfficiency * 100)}% cast efficiency). {cpm.ability.extraSuggestion || ''}</span>,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    return (
      <div style={{ width: '100%' }}>
        <h1>
          <div className="back-button">
            <Link to={`/report/${parser.report.code}/${parser.player.name}`} data-tip="Back to fight selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          Results
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
                      src="./img/healing.png"
                      style={{ border: 0 }}
                      alt="Healing"
                    />)}
                  value={formatThousands(parser.totalHealing)}
                  label="Healing done"
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <img
                      src="./img/mastery-radius.png"
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
              {hasRuleOfLaw && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={<SpellIcon id={SPELLS.RULE_OF_LAW_TALENT.id} />}
                    value={`${this.constructor.formatPercentage(ruleOfLawUptime)} %`}
                    label="Rule of Law uptime"
                  />
                </div>
              )}
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={<SpellIcon id={SPELLS.INFUSION_OF_LIGHT.id} />}
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
                    <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id}>
                      <img
                        src="./img/icons/ability_paladin_infusionoflight-bw.jpg"
                        alt="Unused Infusion of Light"
                      />
                    </SpellLink>
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
                  icon={<SpellIcon id={SPELLS.FLASH_OF_LIGHT.id} />}
                  value={`${this.constructor.formatPercentage(fillerCastRatio)} %`}
                  label={(
                    <dfn data-tip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${fillerFlashOfLights} filler Flash of Lights and ${fillerHolyLights} filler Holy Lights.`}>
                      Filler cast ratio
                    </dfn>
                  )}
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={<SpellIcon id={parser.selectedCombatant.lv100Talent} />}
                  value={`${this.constructor.formatPercentage(healsOnBeacon)} %`}
                  label={(
                    <dfn data-tip={`The amount of Flash of Lights and Holy Lights cast on beacon targets. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.<br /><br />Your total heals on beacons was <b>${(totalHealsOnBeaconPercentage * 100).toFixed(2)}%</b> (this includes spell other than FoL and HL).`}>
                      FoL/HL cast on beacon
                    </dfn>
                  )}
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <img
                      src="./img/icons/petbattle_health-down.jpg"
                      alt="Non healing time"
                    />
                  )}
                  value={`${this.constructor.formatPercentage(nonHealingTimePercentage)} %`}
                  label={(
                    <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${this.constructor.formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}>
                      Non healing time
                    </dfn>
                  )}
                />
              </div>
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={<SpellIcon id={SPELLS.TYRS_DELIVERANCE_CAST.id} />}
                  value={`${this.constructor.formatPercentage(tyrsDeliverancePercentage)} %`}
                  label={(
                    <dfn data-tip={`The total actual effective healing contributed by Tyr's Deliverance. This includes the gains from the increase to healing by Flash of Light and Holy Light.<br /><br />The actual healing done by the effect was ${this.constructor.formatPercentage(tyrsDeliveranceHealHealingPercentage)}% of your healing done, and the healing contribution from the Flash of Light and Holy Light heal increase was ${this.constructor.formatPercentage(tyrsDeliveranceBuffFoLHLHealingPercentage)}% of your healing done.`}>
                      Tyr's Deliverance healing
                    </dfn>
                  )}
                />
              </div>
              {hasSacredDawn && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={<SpellIcon id={SPELLS.SACRED_DAWN.id} />}
                    value={`${this.constructor.formatPercentage(sacredDawnPercentage)} %`}
                    label={(
                      <dfn data-tip={`The actual effective healing contributed by the Sacred Dawn effect.`}>
                        Sacred Dawn contribution
                      </dfn>
                    )}
                  />
                </div>
              )}
              {hasDivinePurpose && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT.id} />}
                    value={(
                      <span>
                        {divinePurposeHolyShockProcs}{' '}
                        <SpellIcon
                          id={SPELLS.HOLY_SHOCK_CAST.id}
                          style={{
                            height: '1.3em',
                            marginTop: '-.1em',
                          }}
                        />
                        {' '}
                        {divinePurposeLightOfDawnProcs}{' '}
                        <SpellIcon
                          id={SPELLS.LIGHT_OF_DAWN_CAST.id}
                          style={{
                            height: '1.3em',
                            marginTop: '-.1em',
                          }}
                        />
                      </span>
                    )}
                    label={(
                      <dfn data-tip={`Your Divine Purpose proc rate for Holy Shock was ${this.constructor.formatPercentage(divinePurposeHolyShockProcs / (holyShockHeals - divinePurposeHolyShockProcs))}%.<br />Your Divine Purpose proc rate for Light of Dawn was ${this.constructor.formatPercentage(divinePurposeLightOfDawnProcs / (lightOfDawnHeals - divinePurposeLightOfDawnProcs))}%`}>
                        Divine Purpose procs
                      </dfn>
                    )}
                  />
                </div>
              )}
              {hasAuraOfMercy && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={<SpellIcon id={SPELLS.AURA_OF_MERCY_TALENT.id} />}
                    value={`${formatNumber((getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingAbsorbed) / fightDuration * 1000)} HPS`}
                    label="Healing done"
                  />
                </div>
              )}
              {hasAuraOfSacrifice && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={<SpellIcon id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} />}
                    value={`${formatNumber(auraOfSacrificeHps)} HPS`}
                    label="Healing done"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel">
              <div className="panel-heading">
                <h2>Items</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <ul className="list">
                  {(() => {
                    const items = [
                      parser.modules.drapeOfShame.active && (
                        <li className="item clearfix" key={ITEMS.DRAPE_OF_SHAME.id}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
                                  {((drapeOfShameHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.drapeOfShame.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.ilterendi.active && (
                        <li className="item clearfix" key={ILTERENDI_ITEM_ID}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Ilterendi, Crown Jewel of Silvermoon equip effect.">
                                  {((ilterendiHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.ilterendi.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.velens.active && (
                        <li className="item clearfix" key={ITEMS.VELENS_FUTURE_SIGHT.id}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.VELENS_FUTURE_SIGHT.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
                                  {((velensHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.velens.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.chainOfThrayn.active && (
                        <li className="item clearfix" key={ITEMS.CHAIN_OF_THRAYN.id}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.CHAIN_OF_THRAYN.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.CHAIN_OF_THRAYN.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Chain of Thrayn equip effect.">
                                  {((chainOfThraynHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.chainOfThrayn.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.prydaz.active && (
                        <li className="item clearfix" key={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
                                  {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.prydaz.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.obsidianStoneSpaulders.active && (
                        <li className="item clearfix" key={ITEMS.OBSIDIAN_STONE_SPAULDERS.id}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.OBSIDIAN_STONE_SPAULDERS.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.OBSIDIAN_STONE_SPAULDERS.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Obsidian Stone Spaulders equip effect.">
                                  {((obsidianStoneSpauldersHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.obsidianStoneSpaulders.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      parser.modules.maraadsDyingBreath.active && (
                        <li className="item clearfix" key={MARAADS_DYING_BREATH_ITEM_ID}>
                          <article>
                            <figure>
                              <ItemIcon id={ITEMS.MARAADS_DYING_BREATH.id} />
                            </figure>
                            <div>
                              <header>
                                <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} />
                              </header>
                              <main>
                                <dfn data-tip="The actual effective healing contributed by the Maraad's Dying Breath equip effect when compared to casting an unbuffed LotM instead. The damage taken is ignored as this doesn't change with Maraad's and therefore doesn't impact the healing gain.">
                                  {((maraadsDyingBreathHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.maraadsDyingBreath.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      has4PT19 && (
                        <li className="item clearfix" key={SPELLS.T19_4SET_BONUS_BUFF.id}>
                          <article>
                            <figure>
                              <SpellIcon id={SPELLS.T19_4SET_BONUS_BUFF.id} />
                            </figure>
                            <div>
                              <header>
                                <SpellLink id={SPELLS.T19_4SET_BONUS_BUFF.id} />
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
                    className={activeTab === TABS.ISSUES ? 'active' : ''}
                    onClick={() => onChangeTab(TABS.ISSUES)}
                  >
                    Suggestions <span className="badge">{this.issues.length}</span>
                  </li>
                  <li
                    className={activeTab === TABS.CAST_EFFICIENCY ? 'active' : ''}
                    onClick={() => onChangeTab(TABS.CAST_EFFICIENCY)}
                  >
                    Cast efficiency
                  </li>
                  <li
                    className={activeTab === TABS.TALENTS ? 'active' : ''}
                    onClick={() => onChangeTab(TABS.TALENTS)}
                  >
                    Talents
                  </li>
                  <li
                    className={activeTab === TABS.MANA ? 'active' : ''}
                    onClick={() => onChangeTab(TABS.MANA)}
                  >
                    Mana
                  </li>
                  <li
                    className={activeTab === TABS.PLAYER_BREAKDOWN ? 'active' : ''}
                    onClick={() => onChangeTab(TABS.PLAYER_BREAKDOWN)}
                  >
                    Mastery effectiveness player breakdown
                  </li>
                </ul>
              </div>
            </div>
            <div>
              {activeTab === TABS.ISSUES && (
                <div>
                  <div className="panel-heading">
                    <div className="row">
                      <div className="col-md-8">
                        <h2>Suggestions</h2>
                      </div>
                      <div className="col-md-4 text-right minor-issue-toggle">
                        <Toggle
                          defaultChecked={this.state.showMinorIssues}
                          icons={false}
                          onChange={event => this.setState({ showMinorIssues: event.target.checked })}
                          id="minor-issues-toggle"
                        />
                        <label htmlFor="minor-issues-toggle">
                          Minor importance
                        </label>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 0' }}>
                    <ul className="list issues">
                      {!this.issues.find(issue => issue.importance === ISSUE_IMPORTANCE.MAJOR) && (
                        <li className="item" style={{ color: '#25ff00' }}>
                          <img src="./img/icons/thumbsup.jpg" alt="Icon" /> There are no major issues in this fight. Good job!
                        </li>
                      )}
                      {this.issues
                        .filter(issue => this.state.showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR)
                        .map((issue, i) => (
                          <li className={`item ${issue.importance  || ''}`} key={`${i}`}>
                            <div className="importance">
                              {(() => {
                                switch (issue.importance) {
                                  case ISSUE_IMPORTANCE.MAJOR:
                                    return (
                                      <span>
                                        Major <UpArrow />
                                      </span>
                                    );
                                  case ISSUE_IMPORTANCE.REGULAR:
                                    return 'Average';
                                  case ISSUE_IMPORTANCE.MINOR:
                                    return (
                                      <span>
                                        Minor <UpArrow style={{ transform: 'rotate(180deg) translateZ(0)' }} />
                                      </span>
                                    );
                                  default: return '';
                                }
                              })()}
                            </div>
                            <img src={`./img/icons/${issue.icon}.jpg`} alt="Icon" />{' '}
                            {typeof issue.issue === 'string' ? <span dangerouslySetInnerHTML={{ __html: issue.issue }} /> : <span>{issue.issue}</span>}

                          </li>
                        ))}
                      <li className="text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
                        Some of these suggestions may be nitpicky or fight dependent, but often it's still something you could look to improve. Try to focus on improving one thing at a time - don't try to improve everything at once.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === TABS.TALENTS && (
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
              {activeTab === TABS.CAST_EFFICIENCY && (
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
              {activeTab === TABS.MANA && (
                <div>
                  <div className="panel-heading">
                    <h2>Mana</h2>
                  </div>
                  <div style={{ padding: '15px 22px' }}>
                    <Mana
                      reportCode={parser.report.code}
                      actorId={parser.playerId}
                      start={parser.fight.start_time}
                      end={parser.fight.end_time}
                    />
                  </div>
                </div>
              )}
              {activeTab === TABS.PLAYER_BREAKDOWN && (
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
