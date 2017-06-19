import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';
import PlayerBreakdownTab from 'Main/PlayerBreakdownTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SacredDawn from './Modules/Features/SacredDawn';
import TyrsDeliverance from './Modules/Features/TyrsDeliverance';
import CooldownTracker from './Modules/Features/CooldownTracker';
import HolyAvenger from './Modules/Features/HolyAvenger';

import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Ilterendi from './Modules/Items/Ilterendi';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import ObsidianStoneSpaulders from './Modules/Items/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Items/MaraadsDyingBreath';
import Tier19_4set from './Modules/Items/Tier19_4set';
import Tier20_4set from './Modules/Items/Tier20_4set';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

import UnusedInfusionOfLightImage from './Images/ability_paladin_infusionoflight-bw.jpg';

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
function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}
function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: PaladinAbilityTracker,

    // PaladinCore
    beaconHealing: BeaconHealing,
    beaconTargets: BeaconTargets,

    // Features
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    sacredDawn: SacredDawn,
    tyrsDeliverance: TyrsDeliverance,
    cooldownTracker: CooldownTracker,
    holyAvenger: HolyAvenger,

    // Items:
    drapeOfShame: DrapeOfShame,
    ilterendi: Ilterendi,
    chainOfThrayn: ChainOfThrayn,
    obsidianStoneSpaulders: ObsidianStoneSpaulders,
    maraadsDyingBreath: MaraadsDyingBreath,
    tier19_4set: Tier19_4set,
    tier20_4set: Tier20_4set,
  };

  calculateMasteryStats() {
    let totalHealingWithMasteryAffectedAbilities = 0;
    let totalHealingFromMastery = 0;
    let totalMaxPotentialMasteryHealing = 0;

    const statsByTargetId = this.modules.masteryEffectiveness.masteryHealEvents.reduce((obj, event) => {
      // Update the fight-totals
      totalHealingWithMasteryAffectedAbilities += event.amount;
      totalHealingFromMastery += event.masteryHealingDone;
      totalMaxPotentialMasteryHealing += event.maxPotentialMasteryHealing;

      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = this.modules.combatants.players[event.targetID];
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
      .filter(ability => ability.isActive === undefined || ability.isActive(selectedCombatant))
      .forEach((ability) => {
        const castCount = getCastCount(ability.spell.id);
        casts += (ability.getCasts ? ability.getCasts(castCount) : castCount.casts) || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }

  get iolProcsPerHolyShockCrit() {
    return this.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id) ? 2 : 1;
  }

  generateResults() {
    const results = super.generateResults();

    const masteryStats = this.calculateMasteryStats();

    const totalMasteryEffectiveness = masteryStats.totalHealingFromMastery / (masteryStats.totalMaxPotentialMasteryHealing || 1);
    const ruleOfLawUptime = this.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / this.fightDuration;

    const abilityTracker = this.modules.abilityTracker;
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

    const fightDuration = this.fightDuration;

    const hasCrusadersMight = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
    const hasAuraOfMercy = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_MERCY_TALENT.id);
    const hasAuraOfSacrifice = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_SACRIFICE_TALENT.id);
    const auraOfSacrificeHps = (getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingAbsorbed) / fightDuration * 1000;
    // const hasDevotionAura = this.selectedCombatant.hasTalent(SPELLS.DEVOTION_AURA_TALENT.id);
    const has4PT19 = this.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id);

    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const totalHealsOnBeaconPercentage = this.getTotalHealsOnBeaconPercentage(this);
    const chainOfThraynHealingPercentage = this.modules.chainOfThrayn.healing / this.totalHealing;
    const obsidianStoneSpauldersHealingPercentage = this.modules.obsidianStoneSpaulders.healing / this.totalHealing;
    const ilterendiHealingPercentage = this.modules.ilterendi.healing / this.totalHealing;
    const hasSacredDawn = this.selectedCombatant.traitsBySpellId[SPELLS.SACRED_DAWN.id] === 1;
    const sacredDawnPercentage = this.modules.sacredDawn.healing / this.totalHealing;
    const tyrsDeliveranceHealHealingPercentage = this.modules.tyrsDeliverance.healHealing / this.totalHealing;
    const tyrsDeliveranceBuffFoLHLHealingPercentage = this.modules.tyrsDeliverance.buffFoLHLHealing / this.totalHealing;
    const tyrsDeliverancePercentage = tyrsDeliveranceHealHealingPercentage + tyrsDeliveranceBuffFoLHLHealingPercentage;
    const hasRuleOfLaw = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id);

    const hasDivinePurpose = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);
    const hasSoulOfTheHighlord = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    const divinePurposeHolyShockProcs = (hasDivinePurpose || hasSoulOfTheHighlord) && this.selectedCombatant.getBuffTriggerCount(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id);
    const divinePurposeLightOfDawnProcs = (hasDivinePurpose || hasSoulOfTheHighlord) && this.selectedCombatant.getBuffTriggerCount(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id);

    if (nonHealingTimePercentage > 0.3) {
      results.addIssue({
        issue: `Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonHealingTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    if (totalHealsOnBeaconPercentage > 0.2) {
      results.addIssue({
        issue: `Try to avoid directly healing your beacon targets; it is ineffecient and the healing from beacon transfers are usually enough (${Math.round(totalHealsOnBeaconPercentage * 100)}% of all your heals were on a beacon).`,
        icon: 'ability_paladin_beaconoflight',
        importance: getIssueImportance(totalHealsOnBeaconPercentage, 0.25, 0.35, true),
      });
    }
    if (totalMasteryEffectiveness < 0.75) {
      results.addIssue({
        issue: `Your Mastery Effectiveness can be improved. Try to improve your positioning, usually by sticking with melee (${Math.round(totalMasteryEffectiveness * 100)}% mastery effectiveness).`,
        icon: 'inv_hammer_04',
        importance: getIssueImportance(totalMasteryEffectiveness, 0.7, 0.6),
      });
    }
    if (hasRuleOfLaw && ruleOfLawUptime < 0.25) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges ({(ruleOfLawUptime * 100).toFixed(2)}% uptime).</span>,
        icon: SPELLS.RULE_OF_LAW_TALENT.icon,
        importance: getIssueImportance(ruleOfLawUptime, 0.2, 0.1),
      });
    }
    if (iolFoLToHLCastRatio < 0.7) {
      results.addIssue({
        issue: <span>Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc try to cast <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> as much as possible, it is a considerably stronger heal ({iolFlashOfLights} Flash of Lights ({Math.round(iolFoLToHLCastRatio * 100)}%) to {iolHolyLights} Holy Lights ({Math.round(100 - iolFoLToHLCastRatio * 100)}%) cast with Infusion of Light).</span>,
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
      results.addIssue({
        issue: <span>Your usage of <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> procs can be improved. Try to use your Infusion of Light procs whenever it wouldn't overheal ({Math.round(unusedIolRate * 100)}% unused Infusion of Lights).</span>,
        // icon: 'ability_paladin_infusionoflight-bw',
        icon: 'ability_paladin_infusionoflight',
        importance: getIssueImportance(unusedIolRate, recommendedUnusedIolRate + 0.05, recommendedUnusedIolRate + 0.2, true),
      });
    }
    if (this.modules.ilterendi.active && ilterendiHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>Your usage of <ItemLink id={ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id} /> can be improved. Try to line <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> and <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> up with the buff or consider using an easier legendary ({(ilterendiHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.icon,
        importance: getIssueImportance(ilterendiHealingPercentage, 0.04, 0.03),
      });
    }
    const lightOfTheMartyrs = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id).casts || 0;
    let fillerLotms = lightOfTheMartyrs;
    if (this.modules.maraadsDyingBreath.active) {
      const lightOfTheDawns = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id).casts || 0;
      fillerLotms -= lightOfTheDawns;
    }
    const fillerLotmsPerMinute = fillerLotms / (fightDuration / 1000) * 60;
    if (fillerLotmsPerMinute >= 1.0) {
      let issue = null;
      if (this.modules.maraadsDyingBreath.active) {
        issue = <span>With <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} /> you should only cast <b>one</b> <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Without the buff <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast additional Light of the Martyr when absolutely necessary ({fillerLotmsPerMinute.toFixed(2)} CPM - {fillerLotms} casts (unbuffed only)).</span>;
      } else {
        issue = <span><SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast Light of the Martyr when absolutely necessary ({fillerLotmsPerMinute.toFixed(2)} CPM - {fillerLotms} casts).</span>;
      }
      results.addIssue({
        issue,
        icon: SPELLS.LIGHT_OF_THE_MARTYR.icon,
        importance: getIssueImportance(fillerLotmsPerMinute, 1.5, 2, true),
      });
    }
    if (auraOfSacrificeHps < 30000) {
      results.addIssue({
        issue: <span>The healing done by your <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> is low. Try to find a better moment to cast it or consider changing to <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable ({formatNumber(auraOfSacrificeHps)} HPS).</span>,
        icon: SPELLS.AURA_OF_SACRIFICE_TALENT.icon,
        importance: getIssueImportance(auraOfSacrificeHps, 25000, 20000),
      });
    }
    const lodOverhealing = getOverhealingPercentage(lightOfDawnHeal);
    const recommendedLodOverhealing = hasDivinePurpose ? 0.45 : 0.4;
    if (lodOverhealing > recommendedLodOverhealing) {
      results.addIssue({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Save it for when people are missing health ({Math.round(lodOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.LIGHT_OF_DAWN_CAST.icon,
        importance: getIssueImportance(lodOverhealing, recommendedLodOverhealing + 0.1, recommendedLodOverhealing + 0.2, true),
      });
    }
    const hsOverhealing = getOverhealingPercentage(holyShock);
    const recommendedHsOverhealing = hasDivinePurpose ? 0.4 : 0.35;
    if (hsOverhealing > recommendedHsOverhealing) {
      results.addIssue({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />. Save it for when people are missing health ({Math.round(hsOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.HOLY_SHOCK_HEAL.icon,
        importance: getIssueImportance(hsOverhealing, recommendedHsOverhealing + 0.1, recommendedHsOverhealing + 0.2, true),
      });
    }
    const folOverhealing = getOverhealingPercentage(flashOfLight);
    const recommendedFolOverhealing = 0.25;
    if (folOverhealing > recommendedFolOverhealing) {
      results.addIssue({
        issue: <span>Try to avoid overhealing with <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />. If Flash of Light would overheal it is generally advisable to cast a <SpellLink id={SPELLS.HOLY_LIGHT.id} /> instead ({Math.round(folOverhealing * 100)}% overhealing).</span>,
        icon: SPELLS.FLASH_OF_LIGHT.icon,
        importance: getIssueImportance(folOverhealing, recommendedFolOverhealing + 0.15, recommendedFolOverhealing + 0.25, true),
      });
    }
    const bfOverhealing = getOverhealingPercentage(bestowFaith);
    const recommendedBfOverhealing = 0.4;
    if (bfOverhealing > recommendedBfOverhealing) {
      results.addIssue({
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

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        results.addIssue({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often ({cpm.casts}/{cpm.maxCasts} casts: {Math.round(cpm.castEfficiency * 100)}% cast efficiency). {cpm.ability.extraSuggestion || ''}</span>,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    results.statistics = [
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber(this.totalHealing / fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}>
            Healing done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label={(
          <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}>
            Non healing time
          </dfn>
        )}
      />,
      <StatisticBox
        icon={(
          <img
            src="/img/mastery-radius.png"
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
      />,
      hasRuleOfLaw && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.RULE_OF_LAW_TALENT.id} />}
          value={`${formatPercentage(ruleOfLawUptime)} %`}
          label="Rule of Law uptime"
        />
      ),
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INFUSION_OF_LIGHT.id} />}
        value={`${formatPercentage(iolFoLToHLCastRatio)} %`}
        label={(
          <dfn data-tip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${iolFlashOfLights} Flash of Lights and ${iolHolyLights} Holy Lights during Infusion of Light.`}>
            IoL FoL to HL cast ratio
          </dfn>
        )}
      />,
      <StatisticBox
        icon={(
          <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id}>
            <img
              src={UnusedInfusionOfLightImage}
              alt="Unused Infusion of Light"
            />
          </SpellLink>
        )}
        value={`${formatPercentage(unusedIolRate)} %`}
        label={(
          <dfn data-tip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockHeals} (healing) Holy Shocks with a ${formatPercentage(holyShockCrits / holyShockHeals)}% crit ratio. This gave you ${holyShockCrits * iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${totalIols}.<br /><br />The ratio may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b> The spreadsheet will consider these bonus Infusion of Light procs and consider it appropriately.`}>
            Unused Infusion of Lights
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLASH_OF_LIGHT.id} />}
        value={`${formatPercentage(fillerCastRatio)} %`}
        label={(
          <dfn data-tip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${fillerFlashOfLights} filler Flash of Lights and ${fillerHolyLights} filler Holy Lights.`}>
            Filler cast ratio
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={this.selectedCombatant.lv100Talent} />}
        value={`${formatPercentage(healsOnBeacon)} %`}
        label={(
          <dfn data-tip={`The amount of Flash of Lights and Holy Lights cast on beacon targets. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.<br /><br />Your total heals on beacons was <b>${(totalHealsOnBeaconPercentage * 100).toFixed(2)}%</b> (this includes spell other than FoL and HL).`}>
            FoL/HL cast on beacon
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TYRS_DELIVERANCE_CAST.id} />}
        value={`${formatPercentage(tyrsDeliverancePercentage)} %`}
        label={(
          <dfn data-tip={`The total actual effective healing contributed by Tyr's Deliverance. This includes the gains from the increase to healing by Flash of Light and Holy Light.<br /><br />The actual healing done by the effect was ${formatPercentage(tyrsDeliveranceHealHealingPercentage)}% of your healing done, and the healing contribution from the Flash of Light and Holy Light heal increase was ${formatPercentage(tyrsDeliveranceBuffFoLHLHealingPercentage)}% of your healing done.`}>
            Tyr's Deliverance healing
          </dfn>
        )}
      />,
      hasSacredDawn && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.SACRED_DAWN.id} />}
          value={`${formatPercentage(sacredDawnPercentage)} %`}
          label={(
            <dfn data-tip={`The actual effective healing contributed by the Sacred Dawn effect.`}>
              Sacred Dawn contribution
            </dfn>
          )}
        />
      ),
      hasDivinePurpose && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />}
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
            <dfn data-tip={`Your Divine Purpose proc rate for Holy Shock was ${formatPercentage(divinePurposeHolyShockProcs / (holyShockHeals - divinePurposeHolyShockProcs))}%.<br />Your Divine Purpose proc rate for Light of Dawn was ${formatPercentage(divinePurposeLightOfDawnProcs / (lightOfDawnHeals - divinePurposeLightOfDawnProcs))}%`}>
              Divine Purpose procs
            </dfn>
          )}
        />
      ),
      this.modules.holyAvenger.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.HOLY_AVENGER_TALENT.id} />}
          value={`${formatNumber((this.modules.holyAvenger.regularHealing + this.modules.holyAvenger.holyShockHealing) / fightDuration * 1000)} HPS`}
          label={(
            <dfn
              data-tip={`
                Calculating Holy Avenger healing contribution is hard.<br /><br />

                What this does is add 30% of all effective healing and 30% of Holy Shock effective healing for the total healing contributed by Holy Avenger. There is no checking for GCDs missed or whatever since the assumption is that you still cast 30% more spells than you normally would, and normally you'd also have missed GCDs.<br /><br />

                This healing gain from the Haste is kinda undervalued since Haste gains are calculated in-game with <code>CurrentHaste * (1 + HasteBonus) + HasteBonus</code>. Here all I include is the absolute Haste bonus, not the relative bonus since it's hard to calculate.<br /><br />

                This statistic can see high numbers if Holy Avenger is paired with Avenging Wrath and/or AoS Aura Masatery. **This is perfectly right.** Those spells increase the ST/cleave healing you do and work nicely with a Haste increaser that increases the amount of heals you can do in that short period of time. But stacking HA with AW/AM may still not be best when you look at the overall fight, as spread out cooldowns often still provide more effective healing.
              `}
            >
              Estimated healing
            </dfn>
          )}
        />
      ),
      hasAuraOfMercy && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.AURA_OF_MERCY_TALENT.id} />}
          value={`${formatNumber((getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingAbsorbed) / fightDuration * 1000)} HPS`}
          label="Healing done"
        />
      ),
      hasAuraOfSacrifice && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} />}
          value={`${formatNumber(auraOfSacrificeHps)} HPS`}
          label="Healing done"
        />
      ),
    ];

    results.items = [
      ...results.items,
      // Sort by quality > slot > tier
      this.modules.obsidianStoneSpaulders.active && {
        item: ITEMS.OBSIDIAN_STONE_SPAULDERS,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Obsidian Stone Spaulders equip effect.">
            {((obsidianStoneSpauldersHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.obsidianStoneSpaulders.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.maraadsDyingBreath.active && {
        item: ITEMS.MARAADS_DYING_BREATH,
        result: (
          <span>
            <dfn
              data-tip={`
                This is the estimated effective healing by Maraad's. This is adjusted for an estimated opportunity cost of casting a Flash of Light. The mana saved from casting a Light of the Martyr instead of a Flash of Light is also included by valuing it as 50% of the base healing of a LotM.<br /><br />

                The effective healing done from Maraad's when adjusted for the opportunity cost of casting a regular (filler) Light of the Martyr was ${((this.modules.maraadsDyingBreath.healingGainOverLotm / this.totalHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.maraadsDyingBreath.healingGainOverLotm / fightDuration * 1000)} HPS.
              `}
            >
              ~{((this.modules.maraadsDyingBreath.healingGainOverFol / this.totalHealing * 100) || 0).toFixed(2)} % / ~{formatNumber(this.modules.maraadsDyingBreath.healingGainOverFol / fightDuration * 1000)} HPS
            </dfn>
            {' '}
            (total: <dfn data-tip="This is the total healing done with Light of the Martyr during the buff from Maraad's. No opportunity cost was accounted for. The healing was adjusted for the damage taken.">
              {((this.modules.maraadsDyingBreath.totalHealing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.maraadsDyingBreath.totalHealing / fightDuration * 1000)} HPS
            </dfn>)
          </span>
        ),
      },
      this.modules.chainOfThrayn.active && {
        item: ITEMS.CHAIN_OF_THRAYN,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Chain of Thrayn equip effect.">
            {((chainOfThraynHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.chainOfThrayn.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.ilterendi.active && {
        item: ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Ilterendi, Crown Jewel of Silvermoon equip effect.">
            {((ilterendiHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.ilterendi.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      hasSoulOfTheHighlord && {
        item: ITEMS.SOUL_OF_THE_HIGHLORD,
        result: (
          <span>
            Procs:{' '}
            {divinePurposeHolyShockProcs} <SpellIcon id={SPELLS.HOLY_SHOCK_CAST.id} style={{ height: '1em' }} /> <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />
            {' '}/{' '}
            {divinePurposeLightOfDawnProcs} <SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} style={{ height: '1em' }} /> <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />
          </span>
        ),
      },
      this.modules.tier19_4set.active && {
        id: `spell-${SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the tier 19 4 set bonus. <b>This does not include any healing "gained" from the Holy Light cast time reduction.</b> You used a total of ${this.modules.tier19_4set.totalIolProcsUsed} Infusion of Light procs, ${this.modules.tier19_4set.bonusIolProcsUsed} of those were from procs from the 4 set bonus and ${this.modules.tier19_4set.bonusIolProcsUsedOnFol} of those bonus procs were used on Flash of Light.`}>
            {((this.modules.tier19_4set.healing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.tier19_4set.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.tier20_4set.active && {
        id: `spell-${SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.HOLY_PALADIN_T20_4SET_BONUS_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the tier 20 4 set bonus. A total of ${formatNumber(this.modules.tier20_4set.totalBeaconHealingDuringLightsEmbrace)} <span style="color:orange">raw</span> healing was done on beacons during the Light's Embrace buff.`}>
            {((this.modules.tier20_4set.healing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.tier20_4set.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
    ];

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Cast efficiency',
        url: 'cast-efficiency',
        render: () => (
          <CastEfficiencyTab
            categories={castEfficiencyCategories}
            abilities={castEfficiency}
          />
        ),
      },
      {
        title: 'Cooldowns',
        url: 'cooldowns',
        render: () => (
          <CooldownsTab
            fightStart={this.fight.start_time}
            fightEnd={this.fight.end_time}
            cooldowns={this.modules.cooldownTracker.pastCooldowns}
            showOutputStatistics
            showResourceStatistics
          />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <ManaTab
            reportCode={this.report.code}
            actorId={this.playerId}
            start={this.fight.start_time}
            end={this.fight.end_time}
          />
        ),
      },
      {
        title: 'Mastery effectiveness',
        url: 'mastery-effectiveness',
        render: () => (
          <PlayerBreakdownTab
            stats={masteryStats}
            playersById={this.playersById}
          />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
