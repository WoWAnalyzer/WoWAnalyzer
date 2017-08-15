// TODO:

import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';
import MonkSpreadsheet from 'Main/MonkSpreadsheet';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

// Core
import HealingDone from './Modules/Core/HealingDone';

// Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

// Traits
import ManaSavingTalents from './Modules/Traits/ManaSavingTalents';
import MistsOfSheilun from './Modules/Traits/MistsOfSheilun';
import CelestialBreath from './Modules/Traits/CelestialBreath';

// Spells
import UpliftingTrance from './Modules/Spells/UpliftingTrance';
import ThunderFocusTea from './Modules/Spells/ThunderFocusTea';
import SheilunsGift from './Modules/Spells/SheilunsGift';
import RenewingMist from './Modules/Spells/RenewingMist';
import EssenceFontMastery from './Modules/Spells/EssenceFontMastery';

// Talents
import ChiJi from './Modules/Talents/ChiJi';
import ChiBurst from './Modules/Talents/ChiBurst';
import ManaTea from './Modules/Talents/ManaTea';
import RefreshingJadeWind from './Modules/Talents/RefreshingJadeWind';

// Setup for Items
import Eithas from './Modules/Items/Eithas';
import T20_4pc from './Modules/Items/T20_4pc';
import T20_2pc from './Modules/Items/T20_2pc';
import ShelterOfRin from './Modules/Items/ShelterOfRin';
import DoorwayToNowhere from './Modules/Items/DoorwayToNowhere';
import PetrichorLagniappe from './Modules/Items/PetrichorLagniappe';
import OvydsWinterWrap from './Modules/Items/OvydsWinterWrap';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

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
function getRawHealing(ability) {
  return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
}
function getOverhealingPercentage(ability) {
  return ability.healingOverheal / getRawHealing(ability);
}

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Core
    lowHealthHealing: LowHealthHealing,
    healingDone: HealingDone,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,

    // Traits
    mistsOfSheilun: MistsOfSheilun,
    celestialBreath: CelestialBreath,
    manaSavingTalents: ManaSavingTalents,

    // Spells
    essenceFontMastery: EssenceFontMastery,
    renewingMist: RenewingMist,
    sheilunsGift: SheilunsGift,
    thunderFocusTea: ThunderFocusTea,
    upliftingTrance: UpliftingTrance,

    // Talents
    chiBurst: ChiBurst,
    chiJi: ChiJi,
    manaTea: ManaTea,
    refreshingJadeWind: RefreshingJadeWind,

    // Legendaries / Items:
    eithas: Eithas,
    t20_4pc: T20_4pc,
    t20_2pc: T20_2pc,
    shelterOfRin: ShelterOfRin,
    doorwayToNowhere: DoorwayToNowhere,
    petrichorLagniappe: PetrichorLagniappe,
    ovydsWinterWrap: OvydsWinterWrap,
  };

  damageTaken = 0;
  on_toPlayer_damage(event){
    this.damageTaken += event.amount;
  }

  generateResults() {
    const results = super.generateResults();
    const { suggestions } = results;

    const fightDuration = this.fightDuration;
    const getPercentageOfTotal = healingDone => healingDone / this.totalHealing;
    const formatItemHealing = healingDone => `${formatPercentage(getPercentageOfTotal(healingDone))} % / ${formatNumber(healingDone / fightDuration * 1000)} HPS`;
    const fightEndTime = this.fight.end_time;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const t20_4pcHealingPercentage = this.modules.t20_4pc.healing / this.totalHealing;

    const unusedUTProcs = 1 - (this.modules.upliftingTrance.consumedUTProc / this.modules.upliftingTrance.UTProcsTotal);

    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;
    const avgSGstacks = this.modules.sheilunsGift.stacksTotalSG / SGcasts || 0;
    const wastedSGStacks = this.modules.sheilunsGift.stacksWastedSG + Math.floor((fightEndTime - this.modules.sheilunsGift.lastSGStack) / 10000);

    const manaTea = getAbility(SPELLS.MANA_TEA_TALENT.id);
    const mtCasts = manaTea.casts || 0;
    const avgMTsaves = this.modules.manaTea.manaSavedMT / mtCasts || 0;

    const efMasteryCasts = (this.modules.essenceFontMastery.healEF / 2) || 0;
    const efMasteryEffectiveHealing = ((this.modules.essenceFontMastery.healing) / 2) || 0;
    const avgEFMasteryHealing = efMasteryEffectiveHealing / efMasteryCasts || 0;

    const avgMasteryCastsPerEF = (efMasteryCasts / this.modules.essenceFontMastery.castEF) || 0;
    const avgTargetsHitPerEF = (this.modules.essenceFontMastery.targetsEF / this.modules.essenceFontMastery.castEF) || 0;

    // Trait Checks
    const hasWhispersOfShaohao = this.selectedCombatant.traitsBySpellId[SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.id] === 1;

    const hasSotC = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);
    const hasLifecycles = this.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id);

    const sheilunsGiftHealing = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const sheilunsGiftOverhealingPercentage = getOverhealingPercentage(sheilunsGiftHealing) || 0;

    // Suggestions

    // Misc Suggestions
    suggestions
      .when(nonHealingTimePercentage).isGreaterThan(0.5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to cast heals more regularly.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)} non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
    suggestions
      .when(deadTimePercentage).isGreaterThan(0.4)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you\'re not healing try to contribute some damage')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)} non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    // Healing Suggestions

    // Missed Whispers healing
    const missedWhispersHeal = ((Math.floor(fightDuration / 10000) + this.modules.sheilunsGift.countEff) - this.modules.sheilunsGift.countWhispersHeal);
    if(hasWhispersOfShaohao) {
      suggestions
        .when(missedWhispersHeal).isGreaterThan(5)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You missed multiple <SpellLink id={SPELLS.WHISPERS_OF_SHAOHAO.id} /> healing procs. While you cannot actively place the clouds that spawn, work to position yourself near other members of the raid so that when the clouds are used, they heal someone. </span>)
            .icon(SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.icon)
            .actual(`${missedWhispersHeal} missed heals`)
            .recommended(`<${recommended} missed is recommended`)
            .regular(recommended + 2).major(recommended + 5);
        });
    }

    // Sheilun's Gift Overhealing issue
    suggestions
      .when(sheilunsGiftOverhealingPercentage).isGreaterThan(.5)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestionText;
        if (avgSGstacks >= 6) {
          suggestionText = <span>You had high overheal when using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> and casted with greater than 6 stacks. Consider using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> at lower stacks to increase effectiveness.</span>;
        } else {
          suggestionText = <span>You had high overheal when using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> and casted with less than 6 stacks. Consider using <SpellLink id={SPELLS.SHEILUNS_GIFT.id} /> on injured targets to increase effectiveness.</span>;
        }
        return suggest(suggestionText)
          .icon(SPELLS.SHEILUNS_GIFT.icon)
          .actual(`${formatPercentage(sheilunsGiftOverhealingPercentage)}% Sheilun's Gift Overhealing - ${avgSGstacks.toFixed(0)} average Sheilun's Gift stacks`)
          .recommended(`<${formatPercentage(recommended)}% Sheilun's Gift Overheal is recommended`)
          .regular(recommended + .1).major(recommended + .2);
      });

    // Uplifting Trance Usage
    suggestions
      .when(unusedUTProcs).isGreaterThan(.35)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs should be used as soon as you get them so they are not overwritten. While some will be overwritten due to the nature of the spell interactions, holding <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs is not optimal.</span>)
          .icon(SPELLS.UPLIFTING_TRANCE_BUFF.icon)
          .actual(`${formatPercentage(unusedUTProcs)}% Unused Uplifting Trance procs`)
          .recommended(`<${formatPercentage(recommended)}% wasted UT Buffs is recommended`)
          .regular(recommended +.15).major(recommended + .25);
      });

    if (unusedUTProcs > 0.30) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> procs should be used as soon as you get them so they are not overwritten. You missed {(this.modules.upliftingTrance.UTProcsTotal - this.modules.upliftingTrance.consumedUTProc)}/{(this.modules.upliftingTrance.UTProcsTotal)} procs. ({formatPercentage((this.modules.upliftingTrance.UTProcsTotal - this.modules.upliftingTrance.consumedUTProc) / this.modules.upliftingTrance.UTProcsTotal)} %)</span>,
        icon: SPELLS.UPLIFTING_TRANCE_BUFF.icon,
        importance: getIssueImportance(unusedUTProcs, 0.45, 0.6, true),
      });
    }
    // Mana Tea Usage issue
    if (this.modules.manaTea.active) {
      suggestions
        .when(avgMTsaves).isLessThan(180000)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your mana spent during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> can be improved. Always aim to cast your highest mana spells such as <SpellLink id={SPELLS.ESSENCE_FONT.id} /> or <SpellLink id={SPELLS.VIVIFY.id} />.</span>)
            .icon(SPELLS.MANA_TEA_TALENT.icon)
            .actual(`${((this.modules.manaTea.manaSavedMT / this.modules.manaTea.manateaCount) / 1000).toFixed(0)}k average mana saved per Mana Tea cast`)
            .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`)
            .regular(recommended - 30000).major(recommended - 60000);
        });
    }

    // Lifecycles Manasavings
    if(hasLifecycles && this.modules.manaSavingTalents.manaSaved < 200000) {
      results.addIssue({
        issue: <span>Your current spell usage is not taking full advantage of the <SpellLink id={SPELLS.LIFECYCLES_TALENT.id} />  talent. You casted {this.modules.manaSavingTalents.castsNonRedViv} / {(this.modules.manaSavingTalents.castsRedViv + this.modules.manaSavingTalents.castsNonRedViv)} Vivfy's and {this.modules.manaSavingTalents.castsNonRedEnm} / {(this.modules.manaSavingTalents.castsRedEnm + this.modules.manaSavingTalents.castsNonRedEnm)} Enveloping Mists without the mana saving buffs provided by <a href="http://www.wowhead.com/spell=197915" target="_blank" rel="noopener noreferrer">Lifecycles</a></span>,
        icon:SPELLS.LIFECYCLES_TALENT.icon,
        importance: getIssueImportance(this.modules.manaSavingTalents.manaSaved, 170000, 140000),
      });
    }
    // Incorrect TFT Usage
    if(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftEf + this.modules.thunderFocusTea.castsTftViv + this.modules.thunderFocusTea.castsTftRem) > 1) {
      results.addIssue({
        issue: <span>You are currently using <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> to buff spells other than <SpellLink id={SPELLS.VIVIFY.id} />, <SpellLink id={SPELLS.ESSENCE_FONT.id} />, or <SpellLink id={SPELLS.RENEWING_MIST.id} />. You used the TFT buff on {(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftEf + this.modules.thunderFocusTea.castsTftViv + this.modules.thunderFocusTea.castsTftRem))} spells other than Essence Font, Vivify, or Renewing Mist.</span>,
        icon: SPELLS.THUNDER_FOCUS_TEA.icon,
        importance: getIssueImportance(this.modules.thunderFocusTea.castsUnderTft - (this.modules.thunderFocusTea.castsTftEf + this.modules.thunderFocusTea.castsTftViv), 2, 4, true),
      });
    }
    // EF Mastery Proc Usage
    suggestions
      .when(avgMasteryCastsPerEF).isLessThan(3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are currently not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOT buffs effectively. Casting into injured targets with the <SpellLink id={SPELLS.ESSENCE_FONT.id} /> allows you to take advantage of the double <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> procs.</span>)
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${avgMasteryCastsPerEF.toFixed(2)} average EF HoTs`)
          .recommended(`${recommended} or more EF HoTs utilized is recommended`)
          .regular(recommended - 1).major(recommended - 2);
      });

    // EF Targets Hit
    if(avgTargetsHitPerEF < 17) {
      results.addIssue({
        issue: <span>You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> effectively. You only hit an average of {(avgTargetsHitPerEF).toFixed(0)} targets over {this.modules.essenceFontMastery.castEF} <SpellLink id={SPELLS.ESSENCE_FONT.id} /> casts. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18 targets. Your missed an average of {(18 - avgTargetsHitPerEF).toFixed(0)} targets.</span>,
        icon: SPELLS.ESSENCE_FONT.icon,
        importance: getIssueImportance(avgTargetsHitPerEF, 14, 12),
      });
    }
    // SotC Usage
    if(hasSotC) {
      suggestions
        .when(this.modules.manaSavingTalents.manaReturnSotc).isLessThan(300000)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest()
          .icon(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon)
          .actual()
          .recommended()
          .regular(recommended - 50000).major(recommended - 150000);
        });
    }
    if (hasSotC && this.modules.manaSavingTalents.manaReturnSotc < 300000) {
      results.addIssue({
        issue: <span>You are not utilizing your <SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> talent as effectively as you could. You only received {(this.modules.manaSavingTalents.manaReturnSotc / 1000).toFixed(0)}k mana back during this fight. You also lost {(this.modules.manaSavingTalents.totmOverCap + this.modules.manaSavingTalents.totmBuffWasted)} Teachings of the Monestery stacks</span>,
        icon: SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon,
        importance: getIssueImportance(this.modules.manaSavingTalents.manaReturnSotc, 250000, 150000),
      });
    }
    /*
    // RJW Targets Hit
    if (hasRJW && avgRJWTargets < (78 * .9)) {
      results.addIssue({
        issue: <span>You are not utilizing your <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> effectively. <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> excells when you hit 6 targets for the duration of the spell. The easiest way to accomplish this is to stand in melee, but there can be other uses when the raid stacks for various abilities.</span>,
        icon: SPELLS.REFRESHING_JADE_WIND_TALENT.icon,
        importance: getIssueImportance(avgRJWTargets, (78 * .8), (78 * .7)),
      });
    }
    */
    // T20 2pc Buff missed
    if(this.modules.t20_2pc.active && (this.modules.t20_2pc.procs - this.modules.t20_2pc.casts) > 0) {
      results.addIssue({
        issue: <span>You missed {this.modules.t20_2pc.procs - this.modules.t20_2pc.casts} <SpellLink id={SPELLS.SURGE_OF_MISTS.id} /> procs. This proc provides not only a large mana savings on <SpellLink id={SPELLS.ENVELOPING_MISTS.id} />. If you have the Tier 20 4 piece bonus, you also gain a 12% healing buff through <SpellLink id={SPELLS.DANCE_OF_MISTS.id} /> </span>,
        icon: SPELLS.SURGE_OF_MISTS.icon,
        importance: getIssueImportance((this.modules.t20_2pc.procs - this.modules.t20_2pc.casts), 0, 1, true),
      });
    }

    results.statistics = [
      // Thunder Focus Tea Usage
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THUNDER_FOCUS_TEA.id} />}
        value={`${this.modules.thunderFocusTea.castsTft}`}
        label={(
          <dfn data-tip={`With your ${this.modules.thunderFocusTea.castsTft} Thunder Focus Tea casts, you buffed the following spells:
            <ul>
              ${this.modules.thunderFocusTea.castsTftViv > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftViv)} Vivify buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftViv / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftRem > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftRem)} Renewing Mist buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftRem / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEnm > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEnm)} Enveloping Mists buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEnm / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEff > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEff)} Effuse buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEff / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
              ${this.modules.thunderFocusTea.castsTftEf > 0 ?
              `<li>${(this.modules.thunderFocusTea.castsTftEf)} Essence Font buffed (${formatPercentage(this.modules.thunderFocusTea.castsTftEf / this.modules.thunderFocusTea.castsTft)}%)</li>`
              : ""
              }
            </ul>
            `}>
            Total casts
          </dfn>
        )}
      />,
      // UT Proc Usage
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UPLIFTING_TRANCE_BUFF.id} />}
        value={`${formatPercentage(unusedUTProcs)}%`}
        label={(
          <dfn data-tip={`You got total <b>${this.modules.upliftingTrance.UTProcsTotal} uplifting trance procs</b> and <b>used ${this.modules.upliftingTrance.consumedUTProc}</b> of them. ${this.modules.upliftingTrance.nonUTVivify} of your vivify's were used without an uplifting trance procs.`}>
            Unused Procs
          </dfn>
        )}
      />,
      // Mana Tea Usage
      this.modules.manaTea.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.MANA_TEA_TALENT.id} />}
          value={`${formatNumber(avgMTsaves)}`}
          label={(
            <dfn
              data-tip={`
                  During your ${this.modules.manaTea.manateaCount} <a href="http://www.wowhead.com/spell=197908" target="_blank" rel="noopener noreferrer">Mana Teas</a> saved the following mana (${formatThousands(this.modules.manaTea.manaSavedMT / this.fightDuration * 1000 * 5)} MP5):
                  <ul>
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.efCasts)} Essence Font casts</li>`
                  : ""
                  }
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.vivCasts)} Vivfy casts</li>`
                  : ""
                  }
                  ${this.modules.manaTea.efCasts > 0 ?
                  `<li>${(this.modules.manaTea.enmCasts)} Enveloping Mists casts</li>`
                  : ""
                  }
                  <li>${(this.modules.manaTea.rjwCasts + this.modules.manaTea.revCasts + this.modules.manaTea.remCasts + this.modules.manaTea.lcCasts + this.modules.manaTea.effCasts)} other spells casted.</li>
                  <li>${(this.modules.manaTea.nonManaCasts)} non-mana casts during Mana Tea</li>
              </ul>`}
            >
              Average mana saved
            </dfn>
          )}
        />
      ),
    // Lifecycles Usage
      hasLifecycles && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.LIFECYCLES_TALENT.id} />}
          value={`${formatNumber(this.modules.manaSavingTalents.manaSaved)}`}
          label={(
            <dfn data-tip={`You saved a total of ${this.modules.manaSavingTalents.manaSaved} from the Lifecycles talent.
              <ul><li>On ${this.modules.manaSavingTalents.castsRedViv} Vivify casts, you saved ${(this.modules.manaSavingTalents.manaSavedViv / 1000).toFixed(0)}k mana. (${formatPercentage(this.modules.manaSavingTalents.castsRedViv / (this.modules.manaSavingTalents.castsRedViv + this.modules.manaSavingTalents.castsNonRedViv))}%)</li>
              <li>On ${this.modules.manaSavingTalents.castsRedEnm} Enveloping Mists casts, you saved ${(this.modules.manaSavingTalents.manaSavedEnm / 1000).toFixed(0)}k mana. (${formatPercentage(this.modules.manaSavingTalents.castsRedEnm / (this.modules.manaSavingTalents.castsRedEnm + this.modules.manaSavingTalents.castsNonRedEnm))}%)</li>
              <li>You casted ${this.modules.manaSavingTalents.castsNonRedViv} Vivify's and ${this.modules.manaSavingTalents.castsNonRedEnm} Enveloping Mists at full mana.</li>
              </ul>
              `}>
              Mana Saved
            </dfn>
          )}
        />
      ),
      // SotC Usage
      hasSotC && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} />}
          value={`${formatNumber(this.modules.manaSavingTalents.manaReturnSotc)}`}
          label={(
            <dfn data-tip={`
                You gained a raw total of ${((this.modules.manaSavingTalents.manaReturnSotc + this.modules.manaSavingTalents.sotcWasted) / 1000).toFixed(0)}k mana from SotC with ${(this.modules.manaSavingTalents.sotcWasted / 1000).toFixed(0)}k wasted.<br>
                You lost ${(this.modules.manaSavingTalents.totmOverCap + this.modules.manaSavingTalents.totmBuffWasted)} Teachings of the Monestery stacks
              <ul>
                ${this.modules.manaSavingTalents.totmOverCap > 0 ?
                `<li>You overcapped Teachings ${(this.modules.manaSavingTalents.totmOverCap)} times</li>`
                : ""
                }
                ${this.modules.manaSavingTalents.totmBuffWasted > 0 ?
                `<li>You let Teachings drop off ${(this.modules.manaSavingTalents.totmBuffWasted)} times</li>`
                : ""
                }
              </ul>
              `}>
              Mana Returned
            </dfn>
          )}
        />
      ),
      // Average SG Stacks
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHEILUNS_GIFT.id} />}
        value={`${(avgSGstacks).toFixed(0)}`}
        label={(
          <dfn data-tip={`${SGcasts > 0 ? `You healed for an average of ${formatNumber(this.modules.sheilunsGift.sgHeal / this.modules.sheilunsGift.castsSG)} with each Sheilun's cast.` : ""}
            ${wastedSGStacks > 0 ? `<br>You wasted ${(wastedSGStacks)} stack(s) during this fight.` : ""}
            `}>
            Avg stacks used
          </dfn>
        )}
      />,
      // Whispers Usage
      hasWhispersOfShaohao && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.WHISPERS_OF_SHAOHAO.id} />}
          value={`${(missedWhispersHeal)}`}
          label={(
            <dfn data-tip={`You had a total of ${(this.modules.sheilunsGift.countWhispersHeal)} Whispers of Shaohao heals, but had a chance at ${(missedWhispersHeal)} additional heals.`}>
              Total Heals Missed
            </dfn>
          )}
        />
      ),
      // Dancing Mist Tracking
      this.modules.renewingMist.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DANCING_MISTS.id} />}
          value={`${formatNumber(this.modules.renewingMist.dancingMistHeal)}`}
          label={(
            <dfn data-tip={`You had a total of ${(this.modules.renewingMist.dancingMistProc)} procs on ${this.modules.renewingMist.castsREM} REM casts.`}>
              Total Healing
            </dfn>
          )}
        />
      ),

      // EF Mastery stats
      efMasteryCasts > 0 && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.GUSTS_OF_MISTS.id} />}
          value={`${efMasteryCasts}`}
          label={(
            <dfn data-tip={`You healed a total of ${efMasteryCasts} targets with the Essence Font buff for ${formatNumber(efMasteryEffectiveHealing)} healing. You also healed an average of ${avgMasteryCastsPerEF.toFixed(2)} targets per Essence Font cast. (${formatNumber(avgEFMasteryHealing)} average healing per cast.)`}>
              Mastery Buffs utilized
            </dfn>
          )}
        />
      ),
      // EF Targets Hit
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ESSENCE_FONT.id} />}
        value={`${(avgTargetsHitPerEF).toFixed(0)}`}
        label={(
          <dfn data-tip={`You healed an average of ${(avgTargetsHitPerEF).toFixed(2)} targets per Essence Font cast over your ${this.modules.essenceFontMastery.castEF} casts.`}>
            Average Targets hit
          </dfn>
        )}
      />,
      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      this.modules.t20_4pc.active && {
        id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
        title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the Tier 20 4 piece effect.<br />Buff Uptime: ${((this.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_MISTS.id)/this.fightDuration)*100).toFixed(2)}%`}>
            {((t20_4pcHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.t20_4pc.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.t20_2pc.active && {
        id: `spell-${SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
        title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual mana saved by the Tier 20 2 piece effect.`}>
            {formatNumber(this.modules.t20_2pc.manaSaved)} mana saved ({formatNumber((this.modules.t20_2pc.manaSaved / this.fightDuration * 1000 * 5))} MP5)
          </dfn>
        ),
      },
      this.modules.eithas.active && {
        item: ITEMS.EITHAS_LUNAR_GLIDES,
        result: formatItemHealing(this.modules.eithas.healing),
      },
      this.modules.shelterOfRin.active && {
        item: ITEMS.SHELTER_OF_RIN,
        result: formatItemHealing(this.modules.shelterOfRin.healing),
      },
      this.modules.doorwayToNowhere.active && {
        item: ITEMS.DOORWAY_TO_NOWHERE,
        result: formatItemHealing(this.modules.doorwayToNowhere.healing),
      },
      this.modules.ovydsWinterWrap.active && {
        item: ITEMS.OVYDS_WINTER_WRAP,
        result: formatItemHealing(this.modules.ovydsWinterWrap.healing),
      },
      this.modules.petrichorLagniappe.active && {
        item: ITEMS.PETRICHOR_LAGNIAPPE,
        result: (
          <dfn data-tip={`The wasted cooldown reduction from the legendary bracers. ${formatNumber((this.modules.petrichorLagniappe.wastedReductionTime / getAbility(SPELLS.REVIVAL.id).casts) / 1000)} seconds (Average wasted cooldown reduction per cast).`}>
            {formatNumber(this.modules.petrichorLagniappe.wastedReductionTime / 1000)} seconds wasted
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
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
      {
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab title="Player Log Data" style={{ padding: '15px 22px 15px 15px' }}>
            <MonkSpreadsheet parser={this} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
