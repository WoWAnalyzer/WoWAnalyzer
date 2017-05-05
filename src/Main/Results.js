import React from 'react';
import { Link } from 'react-router';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import UpArrow from 'Icons/UpArrow';

import StatisticBox from './StatisticBox';
import PlayerBreakdown from './PlayerBreakdown';
import CastEfficiency from './CastEfficiency';
import Talents from './Talents';
import Mana from './Mana';

import {
  RULE_OF_LAW_SPELL_ID,
  T19_4SET_BONUS_BUFF_ID,
  FLASH_OF_LIGHT_SPELL_ID,
  HOLY_LIGHT_SPELL_ID,
  HOLY_SHOCK_HEAL_SPELL_ID,
  BEACON_TYPES,
  LIGHT_OF_THE_MARTYR_SPELL_ID,
  LIGHT_OF_DAWN_CAST_SPELL_ID,
  LIGHT_OF_DAWN_HEAL_SPELL_ID,
  BESTOW_FAITH_SPELL_ID,
  DIVINE_PURPOSE_SPELL_ID,
  DIVINE_PURPOSE_HOLY_SHOCK_SPELL_ID,
  DIVINE_PURPOSE_LIGHT_OF_DAWN_SPELL_ID,
  CRUSADERS_MIGHT_SPELL_ID,
} from './Parser/Constants';
import { SACRED_DAWN_TRAIT_ID } from './Parser/Modules/Features/SacredDawn';
import { DRAPE_OF_SHAME_ITEM_ID } from './Parser/Modules/Legendaries/DrapeOfShame';
import { ILTERENDI_ITEM_ID } from './Parser/Modules/Legendaries/Ilterendi';
import { VELENS_ITEM_ID } from './Parser/Modules/Legendaries/Velens';
import { CHAIN_OF_THRAYN_ITEM_ID } from './Parser/Modules/Legendaries/ChainOfThrayn';
import { PRYDAZ_ITEM_ID } from './Parser/Modules/Legendaries/Prydaz';
import { OBSIDIAN_STONE_SPAULDERS_ITEM_ID } from './Parser/Modules/Legendaries/ObsidianStoneSpaulders';
import { MARAADS_DYING_BREATH_ITEM_ID } from './Parser/Modules/Legendaries/MaraadsDyingBreath';

import { CPM_ABILITIES } from './CastEfficiency';
import ISSUE_IMPORTANCE from './ISSUE_IMPORTANCE';

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
    return this.props.parser.selectedCombatant.hasBuff(T19_4SET_BONUS_BUFF_ID) ? 2 : 1;
  }

  getFightDuration(parser) {
    return (parser.finished ? parser.fight.end_time : parser.currentTimestamp) - parser.fight.start_time;
  }

  getCastEfficiency(parser) {
    const fightDuration = this.getFightDuration(parser);
    const minutes = fightDuration / 1000 / 60;

    const abilityTracker = parser.modules.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

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

        const recommendedCastEfficiency = ability.recommendedCastEfficiency || 0.8;
        const canBeImproved = castEfficiency !== null && castEfficiency < recommendedCastEfficiency;

        if (canBeImproved && !ability.noSuggestion) {
          this.issues.push({
            issue: `Try to cast <a href="http://www.wowhead.com/spell=${ability.spellId}" target="_blank">${ability.name}</a> more often (${casts}/${maxCasts} casts: ${Math.round(castEfficiency * 100)}% cast efficiency). ${ability.extraSuggestion || ''}`,
            icon: ability.icon,
            importance: ability.importance || getIssueImportance(castEfficiency, recommendedCastEfficiency - 0.05, recommendedCastEfficiency - 0.15),
          });
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
    const abilityTracker = parser.modules.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

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
        castsOnBeacon += castCount.healingBeaconHits || 0;
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
    const ruleOfLawUptime = parser.selectedCombatant.getBuffUptime(RULE_OF_LAW_SPELL_ID) / parser.fightDuration;

    const abilityTracker = parser.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(FLASH_OF_LIGHT_SPELL_ID);
    const holyLight = getAbility(HOLY_LIGHT_SPELL_ID);
    const lightOfDawnCast = getAbility(LIGHT_OF_DAWN_CAST_SPELL_ID);
    const lightOfDawnHeal = getAbility(LIGHT_OF_DAWN_HEAL_SPELL_ID);
    const holyShock = getAbility(HOLY_SHOCK_HEAL_SPELL_ID);
    const bestowFaith = getAbility(BESTOW_FAITH_SPELL_ID);

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

    const fightDuration = this.getFightDuration(parser);

    const hasCrusadersMight = parser.selectedCombatant.lv15Talent === CRUSADERS_MIGHT_SPELL_ID;
    const has4PT19 = parser.selectedCombatant.hasBuff(T19_4SET_BONUS_BUFF_ID);

    const nonHealingTimePercentage = parser.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = parser.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const totalHealsOnBeaconPercentage = this.getTotalHealsOnBeaconPercentage(parser);
    const hasVelens = parser.selectedCombatant.hasTrinket(VELENS_ITEM_ID);
    const velensHealingPercentage = parser.modules.velens.healing / parser.totalHealing;
    const chainOfThraynHealingPercentage = parser.modules.chainOfThrayn.healing / parser.totalHealing;
    const prydazHealingPercentage = parser.modules.prydaz.healing / parser.totalHealing;
    const obsidianStoneSpauldersHealingPercentage = parser.modules.obsidianStoneSpaulders.healing / parser.totalHealing;
    const drapeOfShameHealingPercentage = parser.modules.drapeOfShame.healing / parser.totalHealing;
    const maraadsDyingBreathHealingPercentage = parser.modules.maraadsDyingBreath.healing / parser.totalHealing;
    const hasIlterendi = parser.selectedCombatant.hasRing(ILTERENDI_ITEM_ID);
    const ilterendiHealingPercentage = parser.modules.ilterendi.healing / parser.totalHealing;
    const hasSacredDawn = parser.selectedCombatant.traitsBySpellId[SACRED_DAWN_TRAIT_ID] === 1;
    const sacredDawnPercentage = parser.modules.sacredDawn.healing / parser.totalHealing;
    const tyrsDeliveranceHealHealingPercentage = parser.modules.tyrsDeliverance.healHealing / parser.totalHealing;
    const tyrsDeliveranceBuffFoLHLHealingPercentage = parser.modules.tyrsDeliverance.buffFoLHLHealing / parser.totalHealing;
    const tyrsDeliverancePercentage = tyrsDeliveranceHealHealingPercentage + tyrsDeliveranceBuffFoLHLHealingPercentage;
    const hasRuleOfLaw = parser.selectedCombatant.lv30Talent === RULE_OF_LAW_SPELL_ID;
    const hasMaraads = parser.selectedCombatant.hasBack(MARAADS_DYING_BREATH_ITEM_ID);

    const hasDivinePurpose = parser.selectedCombatant.lv75Talent === DIVINE_PURPOSE_SPELL_ID;
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
        issue: `Your <a href="http://www.wowhead.com/spell=214202" target="_blank">Rule of Law</a> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges (${(ruleOfLawUptime * 100).toFixed(2)}% uptime).`,
        icon: 'ability_paladin_longarmofthelaw',
        importance: getIssueImportance(ruleOfLawUptime, 0.2, 0.1),
      });
    }
    if (iolFoLToHLCastRatio < 0.7) {
      this.issues.push({
        issue: `Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <a href="http://www.wowhead.com/spell=53576" target="_blank">Infusion of Light</a> proc try to cast <a href="http://www.wowhead.com/spell=19750" target="_blank">Flash of Light</a> as much as possible, it is a considerably stronger heal (${iolFlashOfLights} Flash of Lights (${Math.round(iolFoLToHLCastRatio * 100)}%) to ${iolHolyLights} Holy Lights (${Math.round(100 - iolFoLToHLCastRatio * 100)}%) cast with Infusion of Light).`,
        icon: 'spell_holy_flashheal',
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
        issue: `Your usage of <a href="http://www.wowhead.com/spell=53576" target="_blank">Infusion of Light</a> procs can be improved. Try to use your Infusion of Light procs whenever it wouldn't overheal (${Math.round(unusedIolRate * 100)}% unused Infusion of Lights).`,
        icon: 'ability_paladin_infusionoflight-bw',
        importance: getIssueImportance(unusedIolRate, recommendedUnusedIolRate + 0.05, recommendedUnusedIolRate + 0.2, true),
      });
    }
    if (hasIlterendi && ilterendiHealingPercentage < 0.045) {
      this.issues.push({
        issue: `Your usage of <a href="http://www.wowhead.com/item=137046" target="_blank" class="legendary">Ilterendi, Crown Jewel of Silvermoon</a> can be improved. Try to line <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a> and <a href="http://www.wowhead.com/spell=20473" target="_blank">Holy Shock</a> up with the buff or consider using an easier legendary (${(ilterendiHealingPercentage * 100).toFixed(2)}% healing contributed).`,
        icon: 'inv_jewelry_ring_firelandsraid_03a',
        importance: getIssueImportance(ilterendiHealingPercentage, 0.04, 0.03),
      });
    }
    if (hasVelens && velensHealingPercentage < 0.045) {
      this.issues.push({
        issue: `Your usage of <a href="http://www.wowhead.com/item=144258" target="_blank" class="legendary">Velen's Future Sight</a> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary (${(velensHealingPercentage * 100).toFixed(2)}% healing contributed).`,
        icon: 'spell_holy_healingfocus',
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    const lightOfTheMartyrs = getAbility(LIGHT_OF_THE_MARTYR_SPELL_ID).casts || 0;
    let fillerLotms = lightOfTheMartyrs;
    if (hasMaraads) {
      const lightOfTheDawns = getAbility(LIGHT_OF_DAWN_CAST_SPELL_ID).casts || 0;
      fillerLotms -= lightOfTheDawns;
    }
    const fillerLotmsPerMinute = fillerLotms / (fightDuration / 1000) * 60;
    if (fillerLotmsPerMinute >= 1.0) {
      this.issues.push({
        issue: hasMaraads ? `With <a href="http://www.wowhead.com/item=144273/maraads-dying-breath" target="_blank" class="legendary">Maraad's Dying Breath</a> you should only cast <b>one</b> <a href="http://www.wowhead.com/spell=137046" target="_blank" class="legendary">Light of the Martyr</a> per <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a>. Without the buff <a href="http://www.wowhead.com/spell=137046" target="_blank" class="legendary">Light of the Martyr</a> is a very inefficient spell to cast. Try to only cast additional Light of the Martyr when absolutely necessary (${fillerLotmsPerMinute.toFixed(2)} CPM (unbuffed only)).` : `<a href="http://www.wowhead.com/spell=137046" target="_blank">Light of the Martyr</a> is a very inefficient spell to cast. Try to only cast Light of the Martyr when absolutely necessary (${fillerLotmsPerMinute.toFixed(2)} CPM).`,
        icon: 'ability_paladin_lightofthemartyr',
        importance: getIssueImportance(fillerLotmsPerMinute, 1.5, 2, true),
      });
    }
    const lodOverhealing = getOverhealingPercentage(lightOfDawnHeal);
    let recommendedLodOverhealing = hasDivinePurpose ? 0.45 : 0.4;
    if (lodOverhealing > recommendedLodOverhealing) {
      this.issues.push({
        issue: `Try to avoid overhealing with <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a>. Save it for when people are missing health (${Math.round(lodOverhealing * 100)}% overhealing).`,
        icon: 'spell_paladin_lightofdawn',
        importance: getIssueImportance(lodOverhealing, recommendedLodOverhealing + 0.1, recommendedLodOverhealing + 0.2, true),
      });
    }
    const hsOverhealing = getOverhealingPercentage(holyShock);
    let recommendedHsOverhealing = hasDivinePurpose ? 0.4 : 0.35;
    if (hsOverhealing > recommendedHsOverhealing) {
      this.issues.push({
        issue: `Try to avoid overhealing with <a href="http://www.wowhead.com/spell=20473" target="_blank">Holy Shock</a>. Save it for when people are missing health (${Math.round(hsOverhealing * 100)}% overhealing).`,
        icon: 'spell_holy_searinglight',
        importance: getIssueImportance(hsOverhealing, recommendedHsOverhealing + 0.1, recommendedHsOverhealing + 0.2, true),
      });
    }
    const folOverhealing = getOverhealingPercentage(flashOfLight);
    let recommendedFolOverhealing = 0.25;
    if (folOverhealing > recommendedFolOverhealing) {
      this.issues.push({
        issue: `Try to avoid overhealing with <a href="http://www.wowhead.com/spell=19750" target="_blank">Flash of Light</a>. If Flash of Light would overheal it is generally advisable to cast a <a href="http://www.wowhead.com/spell=82326" target="_blank">Holy Light</a> instead (${Math.round(folOverhealing * 100)}% overhealing).`,
        icon: 'spell_holy_flashheal',
        importance: getIssueImportance(folOverhealing, recommendedFolOverhealing + 0.15, recommendedFolOverhealing + 0.25, true),
      });
    }
    const bfOverhealing = getOverhealingPercentage(bestowFaith);
    let recommendedBfOverhealing = 0.4;
    if (bfOverhealing > recommendedBfOverhealing) {
      this.issues.push({
        issue: `Try to avoid overhealing with <a href="http://www.wowhead.com/spell=223306" target="_blank">Bestow Faith</a>. Cast it just before someone is about to take damage and consider casting it on targets other than tanks (${Math.round(bfOverhealing * 100)}% overhealing).`,
        icon: 'ability_paladin_blessedmending',
        importance: getIssueImportance(bfOverhealing, recommendedBfOverhealing + 0.1, recommendedBfOverhealing + 0.2, true),
      });
    }

    // TODO: Suggestion for AoS when it didn't heal enough to be worthwhile
    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile (also devo damage display)
    // TODO: Suggestion for mana
    // TODO: Suggestion for enchants

    const castEfficiency = this.getCastEfficiency(parser);

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
                      src="./healing.png"
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
              {hasRuleOfLaw && (
                <div className="col-lg-4 col-sm-6 col-xs-12">
                  <StatisticBox
                    icon={(
                      <a href="http://www.wowhead.com/spell=214202" target="_blank">
                        <img
                          src="./img/icons/ability_paladin_longarmofthelaw.jpg"
                          alt="Rule of Law"
                        />
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
                      <img
                        src="./img/icons/ability_paladin_infusionoflight.jpg"
                        alt="Unused Infusion of Light"
                      />
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
                        src="./img/icons/ability_paladin_infusionoflight-bw.jpg"
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
                        src="./img/icons/spell_holy_flashheal.jpg"
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
              <div className="col-lg-4 col-sm-6 col-xs-12">
                <StatisticBox
                  icon={(
                    <a href={`http://www.wowhead.com/spell=${parser.selectedCombatant.lv100Talent}`} target="_blank">
                      <img
                        src={`./${getBeaconIcon(parser.selectedCombatant.lv100Talent)}.jpg`}
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
                  icon={(
                    <a href="http://www.wowhead.com/spell=200652" target="_blank">
                      <img
                        src="./img/icons/inv_mace_2h_artifactsilverhand_d_01.jpg"
                        alt="Tyr's Deliverance"
                      />
                    </a>
                  )}
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
                    icon={(
                      <a href="http://www.wowhead.com/spell=238132" target="_blank">
                        <img
                          src="./img/icons/spell_paladin_lightofdawn.jpg"
                          alt="Sacred Dawn"
                        />
                      </a>
                    )}
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
                    icon={(
                      <a href="http://www.wowhead.com/spell=197646" target="_blank">
                        <img
                          src="./img/icons/spell_holy_divinepurpose.jpg"
                          alt="Divine Purpose"
                        />
                      </a>
                    )}
                    value={(
                      <span>
                        {divinePurposeHolyShockProcs}{' '}
                        <a href="http://www.wowhead.com/spell=25914" target="_blank">
                          <img
                            src="./img/icons/spell_holy_searinglight.jpg"
                            alt="Holy Shock"
                            style={{
                              height: '1.3em',
                              marginTop: '-.1em',
                            }}
                          />
                        </a>
                        {' '}
                        {divinePurposeLightOfDawnProcs}{' '}
                        <a href="http://www.wowhead.com/spell=85222" target="_blank">
                          <img
                            src="./img/icons/spell_paladin_lightofdawn.jpg"
                            alt="Light of Dawn"
                            style={{
                              height: '1.3em',
                              marginTop: '-.1em',
                            }}
                          />
                        </a>
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
                                  {((drapeOfShameHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.drapeOfShame.healing / fightDuration * 1000)} HPS
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
                                src="./img/icons/inv_jewelry_ring_firelandsraid_03a.jpg"
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
                                  {((ilterendiHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.ilterendi.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      hasVelens && (
                        <li className="item clearfix" key={VELENS_ITEM_ID}>
                          <article>
                            <figure>
                              <img
                                src="./img/icons/spell_holy_healingfocus.jpg"
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
                                  {((velensHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.velens.healing / fightDuration * 1000)} HPS
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
                                  {((chainOfThraynHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.chainOfThrayn.healing / fightDuration * 1000)} HPS
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
                                  {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.prydaz.healing / fightDuration * 1000)} HPS
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
                                  {((obsidianStoneSpauldersHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.obsidianStoneSpaulders.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      hasMaraads && (
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
                                  {((maraadsDyingBreathHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(parser.modules.maraadsDyingBreath.healing / fightDuration * 1000)} HPS
                                </dfn>
                              </main>
                            </div>
                          </article>
                        </li>
                      ),
                      has4PT19 && (
                        <li className="item clearfix" key={T19_4SET_BONUS_BUFF_ID}>
                          <article>
                            <figure>
                              <img
                                src="./img/icons/ability_paladin_infusionoflight.jpg"
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
                            <img src={`./img/icons/${issue.icon}.jpg`} alt="Icon" /> <span dangerouslySetInnerHTML={{ __html: issue.issue || issue }} />
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
