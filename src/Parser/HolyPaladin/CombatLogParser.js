import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';
import LowHealthHealingTab from 'Main/LowHealthHealingTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SacredDawn from './Modules/Features/SacredDawn';
import TyrsDeliverance from './Modules/Features/TyrsDeliverance';
import CooldownTracker from './Modules/Features/CooldownTracker';
import HolyAvenger from './Modules/Features/HolyAvenger';
import DevotionAura from './Modules/Features/DevotionAura';

import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Ilterendi from './Modules/Items/Ilterendi';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import ObsidianStoneSpaulders from './Modules/Items/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Items/MaraadsDyingBreath';
import Tier19_4set from './Modules/Items/Tier19_4set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

import UnusedInfusionOfLightImage from './Images/ability_paladin_infusionoflight-bw.jpg';

function getRawHealing(ability) {
  return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
}
function getOverhealingPercentage(ability) {
  return ability.healingOverheal / getRawHealing(ability);
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
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };

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
    const { suggestions } = results;

    const fightDuration = this.fightDuration;

    const ruleOfLawUptime = this.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / fightDuration;

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

    const hasCrusadersMight = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id);
    const hasAuraOfMercy = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_MERCY_TALENT.id);
    const hasAuraOfSacrifice = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_SACRIFICE_TALENT.id);
    const auraOfSacrificeHps = (getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingEffective + getAbility(SPELLS.AURA_OF_SACRIFICE_HEAL.id).healingAbsorbed) / fightDuration * 1000;
    // const hasDevotionAura = this.selectedCombatant.hasTalent(SPELLS.DEVOTION_AURA_TALENT.id);
    const has4PT19 = this.selectedCombatant.hasBuff(SPELLS.HOLY_PALADIN_T19_4SET_BONUS_BUFF.id);

    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const totalHealsOnBeaconPercentage = this.getTotalHealsOnBeaconPercentage(this);
    const hasRuleOfLaw = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id);

    const hasDivinePurpose = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);
    const hasSoulOfTheHighlord = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    const divinePurposeHolyShockProcs = (hasDivinePurpose || hasSoulOfTheHighlord) && this.selectedCombatant.getBuffTriggerCount(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id);
    const divinePurposeLightOfDawnProcs = (hasDivinePurpose || hasSoulOfTheHighlord) && this.selectedCombatant.getBuffTriggerCount(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id);

    //region Suggestions

    //region Misc

    suggestions
      .when(nonHealingTimePercentage).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to cast heals more regularly.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)} non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.15);
      });
    suggestions
      .when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(deadTimePercentage)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(1);
      });

    suggestions
      .when(totalHealsOnBeaconPercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You cast a lot of direct heals on beacon targets. Direct healing beacon targets is inefficient. Try to only cast on beacon targets when they would otherwise die.')
          .icon('ability_paladin_beaconoflight')
          .actual(`${formatPercentage(totalHealsOnBeaconPercentage)}% of all your healing spell casts were on a beacon target`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
    if (hasRuleOfLaw) {
      suggestions
        .when(ruleOfLawUptime).isLessThan(0.25)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges.</span>)
            .icon(SPELLS.RULE_OF_LAW_TALENT.icon)
            .actual(`${(ruleOfLawUptime * 100).toFixed(2)}% uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
    }
    suggestions
      .when(iolFoLToHLCastRatio).isLessThan(0.7)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc try to cast <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> as much as possible, it is a considerably stronger heal ({iolFlashOfLights} Flash of Lights.</span>)
          .icon(SPELLS.INFUSION_OF_LIGHT.icon)
          .actual(`${formatPercentage(iolFoLToHLCastRatio)}%) to ${iolHolyLights} Holy Lights (${formatPercentage(1 - iolFoLToHLCastRatio)}%) cast with Infusion of Light`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.3);
      });

    let recommendedUnusedIolRate = has4PT19 ? 0.2 : 0;
    if (hasCrusadersMight) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    if (hasDivinePurpose) {
      recommendedUnusedIolRate += has4PT19 ? 0.1 : 0.05;
    }
    suggestions
      .when(unusedIolRate).isGreaterThan(recommendedUnusedIolRate)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc usage can be improved. Try to use your Infusion of Light procs before casting your next <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id}/>.</span>)
          .icon(SPELLS.INFUSION_OF_LIGHT.icon)
          .actual(`${formatPercentage(unusedIolRate)}% unused Infusion of Lights`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.2);
      });
    const lightOfTheMartyrs = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id).casts || 0;
    let fillerLotms = lightOfTheMartyrs;
    if (this.modules.maraadsDyingBreath.active) {
      const lightOfTheDawns = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id).casts || 0;
      fillerLotms -= lightOfTheDawns;
    }
    const fillerLotmsPerMinute = fillerLotms / (fightDuration / 1000) * 60;
    suggestions
      .when(fillerLotmsPerMinute).isGreaterThan(1.5)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestionText;
        let actualText;
        if (this.modules.maraadsDyingBreath.active) {
          suggestionText = <span>With <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} /> you should only cast <b>one</b> <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Without the buff <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</span>;
          actualText = `${fillerLotmsPerMinute.toFixed(2)} Casts Per Minute - ${fillerLotms} casts total (unbuffed only)`;
        } else {
          suggestionText = <span>You cast many <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</span>;
          actualText = `${fillerLotmsPerMinute.toFixed(2)} Casts Per Minute - ${fillerLotms} casts total`;
        }
        return suggest(suggestionText)
          .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
          .actual(actualText)
          .recommended(`<${formatPercentage(recommended)} Casts Per Minute is recommended`)
          .regular(recommended + 0.5).major(recommended + 1.5);
      });
    suggestions
      .when(auraOfSacrificeHps).isLessThan(30000)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>The healing done by your <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> is low. Try to find a better moment to cast it or consider changing to <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> or <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable.</span>)
          .icon(SPELLS.AURA_OF_SACRIFICE_TALENT.icon)
          .actual(`${formatNumber(actual)} HPS`)
          .recommended(`>${formatNumber(recommended)} HPS is recommended`)
          .regular(recommended - 5000).major(recommended - 10000);
      });

    //endregion

    //region Overhealing

    const recommendedLodOverhealing = hasDivinePurpose ? 0.45 : 0.4;
    suggestions
      .when(getOverhealingPercentage(lightOfDawnHeal)).isGreaterThan(recommendedLodOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Save it for when people are missing health.</span>)
          .icon(SPELLS.LIGHT_OF_DAWN_CAST.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    const recommendedHsOverhealing = hasDivinePurpose ? 0.4 : 0.35;
    suggestions
      .when(getOverhealingPercentage(holyShock)).isGreaterThan(recommendedHsOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />. Save it for when people are missing health.</span>)
          .icon(SPELLS.HOLY_SHOCK_HEAL.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    const recommendedFolOverhealing = 0.25;
    suggestions
      .when(getOverhealingPercentage(flashOfLight)).isGreaterThan(recommendedFolOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />. If Flash of Light would overheal it is generally advisable to cast a <SpellLink id={SPELLS.HOLY_LIGHT.id} /> instead.</span>)
          .icon(SPELLS.FLASH_OF_LIGHT.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.25);
      });

    const recommendedBfOverhealing = 0.4;
    suggestions
      .when(getOverhealingPercentage(bestowFaith)).isGreaterThan(recommendedBfOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />. Cast it just before someone is about to take damage and consider casting it on targets other than tanks.</span>)
          .icon(SPELLS.BESTOW_FAITH_TALENT.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    //endregion

    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile (also devo damage display)
    // TODO: Suggestion for mana
    // TODO: Suggestion for enchants
    // TODO: Sanctified Wrath healing contribution

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
    castEfficiency.forEach(cpm => {
      if (cpm.ability.noSuggestion || cpm.castEfficiency === null) {
        return;
      }
      suggestions
        .when(cpm.castEfficiency).isLessThan(cpm.recommendedCastEfficiency)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often. {cpm.ability.extraSuggestion || ''}</span>)
            .icon(cpm.ability.spell.icon)
            .actual(`${cpm.casts} out of ${cpm.maxCasts} possible casts; ${formatPercentage(actual)}% cast efficiency`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15).staticImportance(cpm.ability.importance);
        });
    });

    //endregion

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
        label="Healing done"
        tooltip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label="Non healing time"
        tooltip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Damaging Holy Shocks are considered non healing time, Crusader Strike is only considered non healing time if you do not have the Crusader's Might talent.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}
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
        label="IoL FoL to HL cast ratio"
        tooltip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${iolFlashOfLights} Flash of Lights and ${iolHolyLights} Holy Lights during Infusion of Light.`}
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
        label="Unused Infusion of Lights"
        tooltip={`The amount of Infusion of Lights you did not use out of the total available. You cast ${holyShockHeals} (healing) Holy Shocks with a ${formatPercentage(holyShockCrits / holyShockHeals)}% crit ratio. This gave you ${holyShockCrits * iolProcsPerHolyShockCrit} Infusion of Light procs, of which you used ${totalIols}.<br /><br />The ratio may be below zero if you used Infusion of Light procs from damaging Holy Shocks (e.g. cast on boss), or from casting Holy Shock before the fight started. <b>It is accurate to enter this negative value in your spreadsheet!</b> The spreadsheet will consider these bonus Infusion of Light procs and consider it appropriately.`}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLASH_OF_LIGHT.id} />}
        value={`${formatPercentage(fillerCastRatio)} %`}
        label="Filler cast ratio"
        tooltip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${fillerFlashOfLights} filler Flash of Lights and ${fillerHolyLights} filler Holy Lights.`}
      />,
      <StatisticBox
        icon={<SpellIcon id={this.selectedCombatant.lv100Talent} />}
        value={`${formatPercentage(healsOnBeacon)} %`}
        label="FoL/HL cast on beacon"
        tooltip={`The amount of Flash of Lights and Holy Lights cast on beacon targets. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.<br /><br />Your total heals on beacons was <b>${(totalHealsOnBeaconPercentage * 100).toFixed(2)}%</b> (this includes spell other than FoL and HL).`}
      />,
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
          label="Divine Purpose procs"
          tooltip={`Your Divine Purpose proc rate for Holy Shock was ${formatPercentage(divinePurposeHolyShockProcs / (holyShockHeals - divinePurposeHolyShockProcs))}%.<br />Your Divine Purpose proc rate for Light of Dawn was ${formatPercentage(divinePurposeLightOfDawnProcs / (lightOfDawnHeals - divinePurposeLightOfDawnProcs))}%`}
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
      <DevotionAura owner={this} />,
      ...results.statistics,
    ];

    results.items = [
      // Sort by quality > slot > tier
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
      ...results.items,
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
        title: 'Low health healing',
        url: 'low-health-healing',
        render: () => (
          <LowHealthHealingTab parser={this} />
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
