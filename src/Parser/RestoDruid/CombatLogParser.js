import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

import Ekowraith from './Modules/Legendaries/Ekowraith';
import XonisCaress from './Modules/Legendaries/XonisCaress';
import Sephuz from './Modules/Legendaries/Sephuz';
import DarkTitanAdvice from './Modules/Legendaries/DarkTitanAdvice';
import EssenceOfInfusion from './Modules/Legendaries/EssenceOfInfusion';
import Tearstone from './Modules/Legendaries/Tearstone';
import DarkmoonDeckPromises from './Modules/Legendaries/DarkmoonDeckPromises';

import T19_2Set from './Modules/Legendaries/T19_2Set';
import T20 from './Modules/Legendaries/T20';
import T21_2Set from './Modules/Legendaries/T21_2Set';
import T21_4Set from './Modules/Legendaries/T21_4Set';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import WildGrowth from './Modules/Features/WildGrowth';
import Lifebloom from './Modules/Features/Lifebloom';
import Efflorescence from './Modules/Features/Efflorescence';
import Clearcasting from './Modules/Features/Clearcasting';
import TreeOfLife from './Modules/Features/TreeOfLife';
import Flourish from './Modules/Features/Flourish';
import Innervate from './Modules/Features/Innervate';
import PowerOfTheArchdruid from './Modules/Features/PowerOfTheArchdruid';
import Dreamwalker from './Modules/Features/Dreamwalker';
import SoulOfTheForest from './Modules/Features/SoulOfTheForest';
import EssenceOfGhanir from './Modules/Features/EssenceOfGhanir';
import Mastery from './Modules/Features/Mastery';
import Cultivation from './Modules/Features/Cultivation';
import SpringBlossoms from './Modules/Features/SpringBlossoms';
import CenarionWard from './Modules/Features/CenarionWard';
import NaturesEssence from './Modules/Features/NaturesEssence';

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

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Features
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    castEfficiency: CastEfficiency,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    clearcasting: Clearcasting,
    treeOfLife: TreeOfLife,
    flourish: Flourish,
    innervate: Innervate,
    powerOfTheArchdruid: PowerOfTheArchdruid,
    dreamwalker: Dreamwalker,
    soulOfTheForest: SoulOfTheForest,
    essenceOfGhanir: EssenceOfGhanir,
    mastery: Mastery,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    cenarionWard: CenarionWard,
    naturesEssence: NaturesEssence,

    // Legendaries:
    ekowraith: Ekowraith,
    xonisCaress: XonisCaress,
    sephuzsSecret: Sephuz,
    darkTitanAdvice: DarkTitanAdvice,
    essenceOfInfusion: EssenceOfInfusion,
    tearstone: Tearstone,
    t19_2set: T19_2Set,
    t20: T20,
    t21_2set: T21_2Set,
    t21_4set: T21_4Set,
    // TODO:
    // Edraith
    // Aman'Thul's Wisdom

    // Shared:
    darkmoonDeckPromises: DarkmoonDeckPromises,
  };

  generateResults() {
    const results = super.generateResults();
    const formatThroughput = healingDone => `${formatPercentage(this.getPercentageOfTotalHealingDone(healingDone))} %`;
    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);
    const rejuvenations = getAbility(SPELLS.REJUVENATION.id).casts || 0;
    const wildGrowths = getAbility(SPELLS.WILD_GROWTH.id).casts || 0;

    // Tree of Life
    const hasFlourish = this.selectedCombatant.lv100Talent === SPELLS.FLOURISH_TALENT.id;
    const hasTreeOfLife = this.selectedCombatant.lv75Talent === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id;
    const wildGrowthTargets = 6;
    const rejuvenationManaCost = 22000;
    const oneRejuvenationThroughput = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationEncounter) / this.modules.treeOfLife.totalRejuvenationsEncounter;
    const rejuvenationIncreasedEffect = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / (1.15 * 1.5));
    const tolIncreasedHealingDone = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingDuringToL - this.modules.treeOfLife.totalHealingDuringToL / 1.15);
    const rejuvenationMana = (((this.modules.treeOfLife.totalRejuvenationsDuringToL * 10) * 0.3) / 10) * oneRejuvenationThroughput;
    const wildGrowthIncreasedEffect = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / (1.15 * (8 / 6)));
    const treeOfLifeThroughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;
    let treeOfLifeUptime = this.selectedCombatant.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) / this.fightDuration;

    // Chameleon Song
    const rejuvenationIncreasedEffectHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationDuringToLHelmet / 1.15 - this.modules.treeOfLife.totalHealingFromRejuvenationDuringToLHelmet / (1.15 * 1.5));
    const tolIncreasedHealingDoneHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingDuringToLHelmet - this.modules.treeOfLife.totalHealingDuringToLHelmet / 1.15);
    const rejuvenationManaHelmet = (((this.modules.treeOfLife.totalRejuvenationsDuringToLHelmet * 10) * 0.3) / 10) * oneRejuvenationThroughput;
    const wildGrowthIncreasedEffectHelmet = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToLHelmet / 1.15 - this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToLHelmet / (1.15 * (8 / 6)));
    const treeOfLifeThroughputHelmet = rejuvenationIncreasedEffectHelmet + tolIncreasedHealingDoneHelmet + rejuvenationManaHelmet + wildGrowthIncreasedEffectHelmet;
    const treeOfLifeUptimeHelmet = (this.selectedCombatant.getBuffUptime(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) - (this.modules.treeOfLife.tolCasts * 30000) + this.modules.treeOfLife.adjustHelmetUptime) / this.fightDuration;
    if (this.selectedCombatant.hasHead(ITEMS.CHAMELEON_SONG.id)) {
      treeOfLifeUptime -= treeOfLifeUptimeHelmet;
    }
    const treeOfLifeProccHelmet = formatPercentage(this.modules.treeOfLife.proccs / wildGrowths);

    const hasSoulOfTheForest = this.selectedCombatant.lv75Talent === SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id;
    const soulOfTheForestHealing = this.modules.soulOfTheForest.wildGrowthHealing + this.modules.soulOfTheForest.rejuvenationHealing + this.modules.soulOfTheForest.regrowthHealing;

    const has4PT20 = this.selectedCombatant.hasBuff(SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id);
    const has2PT20 = this.selectedCombatant.hasBuff(SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id);

    const fightDuration = this.fightDuration;
    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    const potaHealing = (this.modules.powerOfTheArchdruid.rejuvenations * oneRejuvenationThroughput) + this.getPercentageOfTotalHealingDone(this.modules.powerOfTheArchdruid.healing);
    const hasMoC = this.selectedCombatant.lv100Talent === SPELLS.MOMENT_OF_CLARITY_TALENT_RESTORATION.id;
    const darkTitanAdviceHealing = this.getPercentageOfTotalHealingDone(this.modules.darkTitanAdvice.healing);
    const darkTitanAdviceHealingFromProcc = this.getPercentageOfTotalHealingDone(this.modules.darkTitanAdvice.healingFromProccs);
    const essenceOfInfusionHealing = this.getPercentageOfTotalHealingDone(this.modules.essenceOfInfusion.healing);
    const tearstoneHealing = this.modules.tearstone.rejuvs * oneRejuvenationThroughput;
    const xonisCaressHealingPercentage = this.getPercentageOfTotalHealingDone(this.modules.xonisCaress.healing);
    const ekowraithHealingPercentage = this.getPercentageOfTotalHealingDone(this.modules.ekowraith.healing);
    const ekowraithDamageReductionHealingPercentage = (this.modules.ekowraith.damageReductionHealing / (this.modules.healingDone.total.effective + this.modules.ekowraith.damageReductionHealing));
    let lifebloomUptime = this.modules.lifebloom.uptime / this.fightDuration;
    if (lifebloomUptime > 1) {
      lifebloomUptime -= 1;
    }
    const efflorescenceUptime = this.modules.efflorescence.totalUptime / this.fightDuration;
    const unusedClearcastings = 1 - (this.modules.clearcasting.used / this.modules.clearcasting.total);

    if (nonHealingTimePercentage > 0.3) {
      results.addIssue({
        issue: `Your non healing time can be improved. Try to cast heals more regularly.`,
        stat: `${Math.round(nonHealingTimePercentage * 100)}% non healing time. (<30% is recommended)`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonHealingTimePercentage, 0.4, 1, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage.`,
        stat: `${Math.round(deadTimePercentage * 100)}% dead GCD time. (<20% is recommended)`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 1, true),
      });
    }
    if (efflorescenceUptime < 0.85) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=81269" target="_blank" rel="noopener noreferrer">Efflorescence</a> uptime can be improved.</span>,
        stat: `${formatPercentage(efflorescenceUptime)} % uptime. (>85% is recommended)`,
        icon: SPELLS.EFFLORESCENCE_CAST.icon,
        importance: getIssueImportance(efflorescenceUptime, 0.7, 0.5),
      });
    }
    if (!hasMoC && unusedClearcastings > 0.10) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=16870" target="_blank" rel="noopener noreferrer">Clearcasting</a> proccs should be used as soon as you get them so they are not overwritten.</span>,
        stat: `You missed ${(this.modules.clearcasting.total - this.modules.clearcasting.used)}/${(this.modules.clearcasting.total)} proccs. (<10% is recommended)`,
        icon: SPELLS.CLEARCASTING_BUFF.icon,
        importance: getIssueImportance(unusedClearcastings, 0.5, 0.75, true),
      });
    }
    const wgsExtended = (this.modules.flourish.wildGrowth / wildGrowthTargets) / this.modules.flourish.flourishCounter;
    if (hasFlourish && wgsExtended < 1) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=197721" target="_blank" rel="noopener noreferrer">Flourish</a> should always aim to refresh <a href="http://www.wowhead.com/spell=48438" target="_blank" rel="noopener noreferrer">Wild Growth.</a></span>,
        stat: `${(((this.modules.flourish.wildGrowth / 6) / this.modules.flourish.flourishCounter) * 100).toFixed(0)}% WGs extended. (100% is recommended)`,
        icon: SPELLS.FLOURISH_TALENT.icon,
        importance: getIssueImportance(wgsExtended, 0.8, 0.6),
      });
    }
    const cwExtended = this.modules.flourish.cenarionWard / this.modules.flourish.flourishCounter;
    if (hasFlourish && cwExtended < 1) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=197721" target="_blank" rel="noopener noreferrer">Flourish</a> should always aim to refresh <a href="http://www.wowhead.com/spell=102352" target="_blank" rel="noopener noreferrer">Cenarion Ward.</a></span>,
        stat: `${this.modules.flourish.cenarionWard}/${this.modules.flourish.flourishCounter} CWs extended. (100% is recommended)`,
        icon: SPELLS.FLOURISH_TALENT.icon,
        importance: getIssueImportance(cwExtended, 0, 0),
      });
    }
    if (lifebloomUptime < 0.85) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=33763" target="_blank" rel="noopener noreferrer">Lifebloom</a> uptime can be improved.</span>,
        stat: `${formatPercentage(lifebloomUptime)} % uptime. (>85% is recommended)`,
        icon: SPELLS.LIFEBLOOM_HOT_HEAL.icon,
        importance: getIssueImportance(lifebloomUptime, 0.7, 0.5),
      });
    }
    // Innervate mana spent
    if ((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) < 220000) {
      results.addIssue({
        issue: <span>Your mana spent during an <a href="http://www.wowhead.com/spell=29166" target="_blank" rel="noopener noreferrer">Innervate</a> can be improved. Always aim to cast at least 1 wild growth, 1 efflorescence and fill the rest with rejuvations for optimal usage.</span>,
        stat: `${((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) / 1000).toFixed(0)}k avg mana spent. (> 220000 mana is recommended)`,
        icon: SPELLS.INNERVATE.icon,
        importance: getIssueImportance((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount), 180000, 130000),
      });
    }
    // Innervata mana capped
    if (this.modules.innervate.secondsManaCapped > 0) {
      results.addIssue({
        issue: <span>You were capped on mana during <a href="http://www.wowhead.com/spell=29166" target="_blank" rel="noopener noreferrer">Innervate</a>. Try to not use innervate if you are above 90% mana.</span>,
        stat: `~${this.modules.innervate.secondsManaCapped} seconds capped. (<0% is recommended)`,
        icon: SPELLS.INNERVATE.icon,
        importance: getIssueImportance(this.modules.innervate.secondsManaCapped, 0, 0, true),
      });
    }
    if (hasTreeOfLife && treeOfLifeThroughput < 0.11) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=33891" target="_blank" rel="noopener noreferrer">Tree of Life</a> has quite low throughput, you might want to plan your CDs better or select another talent.</span>,
        stat: `${formatPercentage(treeOfLifeThroughput)} % throughput. (>11% is recommended)`,
        icon: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.icon,
        importance: getIssueImportance(treeOfLifeThroughput, 0.07, 0.04),
      });
    }
    const healingTouches = getAbility(SPELLS.HEALING_TOUCH.id).casts || 0;
    const healingTouchesPerMinute = healingTouches / (fightDuration / 1000) * 60;
    if (healingTouchesPerMinute > 0) {
      results.addIssue({
        issue: <span><a href="http://www.wowhead.com/spell=5185" target="_blank" rel="noopener noreferrer">Healing Touch</a> is an inefficient spell to cast. You should trust your co-healer to top people off, if you got nothing to do you can always dps.</span>,
        stat: `${healingTouchesPerMinute.toFixed(2)} CPM. (0 CPM is recommended)`,
        icon: SPELLS.HEALING_TOUCH.icon,
        importance: getIssueImportance(healingTouchesPerMinute, 0.5, 1, true),
      });
    }
    const wgsPerRejuv = wildGrowths / rejuvenations;
    if (wgsPerRejuv < 0.20) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=48438" target="_blank" rel="noopener noreferrer">Wild growth</a> to rejuv ratio can be improved, try to cast more wild growths if possible as it's usually more efficient.</span>,
        stat: `${wildGrowths}/${rejuvenations} WGs per rejuv. (>20% is recommended)`,
        icon: SPELLS.WILD_GROWTH.icon,
        importance: getIssueImportance(wgsPerRejuv, 0.15, 0.1),
      });
    }
    const regrowths = this.modules.clearcasting.used + this.modules.clearcasting.nonCCRegrowths;
    const nonCCRegrowths = this.modules.clearcasting.nonCCRegrowths;
    if (nonCCRegrowths / regrowths > 0) {
      results.addIssue({
        issue: <span><a href="http://www.wowhead.com/spell=8936" target="_blank" rel="noopener noreferrer">Regrowth</a> is an inefficient spell to cast without a <a href="http://www.wowhead.com/spell=16870" target="_blank" rel="noopener noreferrer">Clearcasting</a> procc.</span>,
        stat: `${nonCCRegrowths} of your regrowths were casted without a clearcasting procc. (0 is recommended)`,
        icon: SPELLS.REGROWTH.icon,
        importance: getIssueImportance(nonCCRegrowths / regrowths, 0.5, 0.25, true),
      });
    }
    const promisesThroughput = (this.modules.darkmoonDeckPromises.savings / rejuvenationManaCost) * oneRejuvenationThroughput;
    if (this.modules.darkmoonDeckPromises.active && promisesThroughput < 0.035) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/item=128710" target="_blank" rel="noopener noreferrer">Darkmoon Deck: Promises</a> effect was not fully utilizied because you did not need the extra mana gained. You may want to consider using another trinket in these scenarios.</span>,
        stat: `${this.modules.darkmoonDeckPromises.savings + this.modules.darkmoonDeckPromises.manaGained} mana gained potentially, ${this.modules.darkmoonDeckPromises.savings} mana gained, ${formatPercentage(promisesThroughput)}% healing contributed. (>3.5% is recommended)`,
        icon: ITEMS.DARKMOON_DECK_PROMISES.icon,
        importance: getIssueImportance(promisesThroughput, 0.01, 0.025),
      });
    }

    results.statistics = [
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />)}
        value={`${formatNumber(this.modules.healingDone.total.effective / this.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.modules.healingDone.total.effective)}.`}>
            Healing done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label={(
          <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}>
            Non healing time
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />}
        value={`${formatPercentage(lifebloomUptime)} %`}
        label='Lifebloom uptime'
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EFFLORESCENCE_CAST.id} />}
        value={`${formatPercentage(efflorescenceUptime)} %`}
        label='Efflorescence uptime'
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ESSENCE_OF_GHANIR.id} />}
        value={`${formatThroughput(this.modules.essenceOfGhanir.healingIncreaseHealing)}`}
        label={(
          <dfn data-tip={
            `<ul>
              ${this.modules.essenceOfGhanir.wildGrowth > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.wildGrowth)} from <a href="http://www.wowhead.com/spell=182874" target="_blank" rel="noopener noreferrer">wild growth</a></li>`
              : ""
              }
              ${this.modules.essenceOfGhanir.rejuvenation > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.rejuvenation)} from <a href="http://www.wowhead.com/spell=774" target="_blank" rel="noopener noreferrer">rejuvenation</a></li>`
              : ""
              }
              ${this.modules.essenceOfGhanir.cenarionWard > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.cenarionWard)} from <a href="http://www.wowhead.com/spell=102351" target="_blank" rel="noopener noreferrer">cenarion ward</a></li>`
              : ""
              }
              ${this.modules.essenceOfGhanir.regrowth > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.regrowth)} from <a href="http://www.wowhead.com/spell=8936" target="_blank" rel="noopener noreferrer">regrowth</a></li>`
              : ""
              }
              ${this.modules.essenceOfGhanir.lifebloom > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.lifebloom)} from <a href="http://www.wowhead.com/spell=33763" target="_blank" rel="noopener noreferrer">lifebloom</a></li>`
              : ""
              }
              ${this.modules.essenceOfGhanir.cultivation > 0 ?
              `<li>${formatThroughput(this.modules.essenceOfGhanir.cultivation)} from <a href="http://www.wowhead.com/spell=200389" target="_blank" rel="noopener noreferrer">cultivation</a></li>`
              : ""
              }
              </ul>`
          }>
            Essence of G'hanir
          </dfn>
        )}
      />,
      this.modules.dreamwalker.hasTrait && (
        <StatisticBox icon={<SpellIcon id={SPELLS.DREAMWALKER.id} />}
          value={`${formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.dreamwalker.healing))}%`}
          label={(
            <dfn data-tip={`The total healing done by Dreamwalker recorded was ${formatThousands(this.modules.dreamwalker.healing)} / ${formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.dreamwalker.healing))} % / ${formatNumber(this.modules.dreamwalker.healing / fightDuration * 1000)} HPS. `}>
              Dreamwalker
            </dfn>
          )}
        />),
      this.modules.powerOfTheArchdruid.hasTrait && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.POWER_OF_THE_ARCHDRUID.id} />}
          value={`${formatPercentage(potaHealing)} %`}
          label={(
            <dfn data-tip={`Power of the archdruid gave you ${this.modules.powerOfTheArchdruid.rejuvenations} bonus rejuvenations, ${this.modules.powerOfTheArchdruid.regrowths} bonus regrowths`}>
              Power of the archdruid
            </dfn>
          )}
        />
      ),
      hasFlourish && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.FLOURISH_TALENT.id} />}
          value={`${((((this.modules.flourish.wildGrowth + this.modules.flourish.cenarionWard + this.modules.flourish.rejuvenation + this.modules.flourish.regrowth + this.modules.flourish.lifebloom + this.modules.flourish.springBlossoms + this.modules.flourish.cultivation) * 6) / this.modules.flourish.flourishCounter).toFixed(0) | 0)}s`}
          label={(
            <dfn data-tip={
              `<ul>
                  Your ${this.modules.flourish.flourishCounter} <a href="http://www.wowhead.com/spell=197721" target="_blank" rel="noopener noreferrer">Flourishes</a> extended:
                  <li>${this.modules.flourish.wildGrowth}/${this.modules.flourish.flourishCounter * wildGrowthTargets} <a href="http://www.wowhead.com/spell=48438" target="_blank" rel="noopener noreferrer">Wild Growths</a></li>
                  <li>${this.modules.flourish.cenarionWard}/${this.modules.flourish.flourishCounter} <a href="http://www.wowhead.com/spell=102351" target="_blank" rel="noopener noreferrer">Cenarion wards</a></li>
                  ${this.modules.flourish.rejuvenation > 0 ?
                `<li>${this.modules.flourish.rejuvenation} <a href="http://www.wowhead.com/spell=774" target="_blank" rel="noopener noreferrer">rejuvenations</a></li>`
                : ""
                }
                          ${this.modules.flourish.regrowth > 0 ?
                `<li>${this.modules.flourish.regrowth} <a href="http://www.wowhead.com/spell=8936" target="_blank" rel="noopener noreferrer">regrowths</a></li>`
                : ""
                }
                          ${this.modules.flourish.lifebloom > 0 ?
                `<li>${this.modules.flourish.lifebloom} <a href="http://www.wowhead.com/spell=33763" target="_blank" rel="noopener noreferrer">lifebloom</a></li>`
                : ""
                }
                          ${this.modules.flourish.springBlossoms > 0 ?
                `<li>${this.modules.flourish.springBlossoms} <a href="http://www.wowhead.com/spell=207386" target="_blank" rel="noopener noreferrer">spring blossoms</a></li>`
                : ""
                }
                          ${this.modules.flourish.cultivation > 0 ?
                `<li>${this.modules.flourish.cultivation} <a href="http://www.wowhead.com/spell=200389" target="_blank" rel="noopener noreferrer">cultivations</a></li>`
                : ""
                }
              </ul>`
            }>
              Average seconds extended by flourish
            </dfn>
          )}
        />
      ),
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INNERVATE.id} />}
        value={`${(((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) / 1000).toFixed(0) | 0)}k mana`}
        label={(
          <dfn data-tip={
            `<ul>
                During your ${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=29166" target="_blank" rel="noopener noreferrer">Innervates</a> you cast:
                <li>${this.modules.innervate.wildGrowths}/${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=48438" target="_blank" rel="noopener noreferrer">Wild Growths</a></li>
                <li>${this.modules.innervate.efflorescences}/${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=81269" target="_blank" rel="noopener noreferrer">Efflorescences</a></li>
                ${this.modules.innervate.cenarionWards > 0 ?
              `<li>${this.modules.innervate.cenarionWards} <a href="http://www.wowhead.com/spell=102351" target="_blank" rel="noopener noreferrer">Cenarion wards</a></li>`
              : ""
              }
                        ${this.modules.innervate.rejuvenations > 0 ?
              `<li>${this.modules.innervate.rejuvenations} <a href="http://www.wowhead.com/spell=774" target="_blank" rel="noopener noreferrer">Rejuvenations</a></li>`
              : ""
              }
                        ${this.modules.innervate.regrowths > 0 ?
              `<li>${this.modules.innervate.regrowths} <a href="http://www.wowhead.com/spell=8936" target="_blank" rel="noopener noreferrer">Regrowths</a></li>`
              : ""
              }
                        ${this.modules.innervate.lifeblooms > 0 ?
              `<li>${this.modules.innervate.lifeblooms} <a href="http://www.wowhead.com/spell=33763" target="_blank" rel="noopener noreferrer">Lifeblooms</a></li>`
              : ""
              }
                        ${this.modules.innervate.healingTouches > 0 ?
              `<li>${this.modules.innervate.healingTouches} <a href="http://www.wowhead.com/spell=5185" target="_blank" rel="noopener noreferrer">Healing touches</a></li>`
              : ""
              }
                        ${this.modules.innervate.swiftmends > 0 ?
              `<li>${this.modules.innervate.swiftmends} <a href="http://www.wowhead.com/spell=18562" target="_blank" rel="noopener noreferrer">Swiftmends</a></li>`
              : ""
              }
                        ${this.modules.innervate.tranquilities > 0 ?
              `<li>${this.modules.innervate.tranquilities} <a href="http://www.wowhead.com/spell=157982" target="_blank" rel="noopener noreferrer">tranquilities</a></li>`
              : ""
              }
                        </ul>
                        `
          }>
            Average mana saved per innervate
          </dfn>
        )}
      />,
      hasTreeOfLife && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} />}
          value={`${formatPercentage(treeOfLifeThroughput)} %`}
          label={(
            <dfn data-tip={`
              <ul>
                <li>${(rejuvenationIncreasedEffect * 100).toFixed(2)}% from increased rejuvenation effect</li>
                <li>${(rejuvenationMana * 100).toFixed(2)}% from reduced rejuvenation cost</li>
                <li>${(wildGrowthIncreasedEffect * 100).toFixed(2)}% from increased wildgrowth effect</li>
                <li>${(tolIncreasedHealingDone * 100).toFixed(2)}% from overall increased healing effect</li>
                <li>${(treeOfLifeUptime * 100).toFixed(2)}% uptime</li>
              </ul>
            `}>
              Tree of Life throughput
            </dfn>
          )}
        />
      ),
      hasSoulOfTheForest && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id} />}
          value={`${(this.getPercentageOfTotalHealingDone(soulOfTheForestHealing) * 100).toFixed(2)} %`}
          label={(
            <dfn data-tip={`
              <ul>
                <li>You had total ${this.modules.soulOfTheForest.proccs} Soul of the Forest proccs.</li>
                <li>Wild Growth consumed ${this.modules.soulOfTheForest.wildGrowths} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.wildGrowthHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.wildGrowthHealing)} healing</li>
                <li>Rejuvenation consumed ${this.modules.soulOfTheForest.rejuvenations} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.rejuvenationHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.rejuvenationHealing)} healing</li>
                <li>Regrowth consumed ${this.modules.soulOfTheForest.regrowths} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.regrowthHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.regrowthHealing)} healing</li>
              </ul>
            `}>
              Soul of the Forest analyzer
            </dfn>
          )}
        />
      ),
      !hasMoC && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />}
          value={`${formatPercentage(unusedClearcastings)} %`}
          label={(
            <dfn data-tip={`You got total <b>${this.modules.clearcasting.total} clearcasting proccs</b> and <b>used ${this.modules.clearcasting.used}</b> of them. <b>${this.modules.clearcasting.nonCCRegrowths} of your regrowths was used without a clearcasting procc</b>. Using a clearcasting procc as soon as you get it should be one of your top priorities. Even if it overheals you still get that extra mastery stack on a target and the minor HoT. Spending your GCD on a free spell also helps you with mana management in the long run.`}>
              Unused Clearcastings
            </dfn>
          )}
        />
      ),
      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      this.selectedCombatant.hasChest(ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id) && {
        item: ITEMS.EKOWRAITH_CREATOR_OF_WORLDS,
        result: (
          <span>
            <dfn data-tip="The increased healing on ysera's gift, and damage reduction from guardian affinity if specced.">
            {(((ekowraithHealingPercentage + ekowraithDamageReductionHealingPercentage) * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.ekowraith.healing + this.modules.ekowraith.damageReductionHealing) / fightDuration * 1000)} HPS
            </dfn>
            <br />(healing: {(ekowraithHealingPercentage * 100).toFixed(2)}%)
            <br />(dmg reduction: {(ekowraithDamageReductionHealingPercentage * 100).toFixed(2)}%)
          </span>
        ),
      },
      this.selectedCombatant.hasChest(ITEMS.XONIS_CARESS.id) && {
        item: ITEMS.XONIS_CARESS,
        result: (
          <dfn data-tip="The healing part from Ironbark. This doesn't include the reduced iron bark cooldown.">
            {((xonisCaressHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.xonisCaress.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id) && {
        item: ITEMS.THE_DARK_TITANS_ADVICE,
        result: (
          <dfn data-tip={`Random bloom stood for ${((darkTitanAdviceHealingFromProcc * 100) || 0).toFixed(2)} % of the total throughput.`}>
            {((darkTitanAdviceHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.darkTitanAdvice.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasFeet(ITEMS.ESSENCE_OF_INFUSION.id) && {
        item: ITEMS.ESSENCE_OF_INFUSION,
        result: `${((essenceOfInfusionHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.essenceOfInfusion.healing / fightDuration * 1000)} HPS`,
      },
      this.selectedCombatant.hasFinger(ITEMS.TEARSTONE_OF_ELUNE.id) && {
        item: ITEMS.TEARSTONE_OF_ELUNE,
        result: (
          <dfn data-tip={`Your Tearstone gave ${this.modules.tearstone.rejuvs} bonus rejuvenations. Proccrate of ring was ${(this.modules.tearstone.rejuvs / this.modules.tearstone.wildGrowths * 100).toFixed(2)}%`}>
            {((tearstoneHealing * 100) || 0).toFixed(2)} %
          </dfn>
        ),
      },
      this.selectedCombatant.hasHead(ITEMS.CHAMELEON_SONG.id) && {
        item: ITEMS.CHAMELEON_SONG,
        result: (
          <dfn
            data-tip={`
              <ul>
                <li>${(rejuvenationIncreasedEffectHelmet * 100).toFixed(2)}% from increased rejuvenation effect</li>
                <li>${(rejuvenationManaHelmet * 100).toFixed(2)}% from reduced rejuvenation cost</li>
                <li>${(wildGrowthIncreasedEffectHelmet * 100).toFixed(2)}% from increased wildgrowth effect</li>
                <li>${(tolIncreasedHealingDoneHelmet * 100).toFixed(2)}% from overall increased healing effect</li>
                <li>${(treeOfLifeUptimeHelmet * 100).toFixed(2)}% uptime</li>
                <li>${treeOfLifeProccHelmet}% procc rate </li>
              </ul>
            `}
          >
            {formatPercentage(treeOfLifeThroughputHelmet)} % / {formatNumber((this.modules.healingDone.total.effective * treeOfLifeThroughputHelmet) / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      has2PT20 && {
        id: `spell-${SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.RESTO_DRUID_T20_2SET_BONUS_BUFF.id} />,
        result: (
          <dfn data-tip={`The throughput is an estimate on the average throughput from one swiftmend would yield, in terms of 4P and healing itself <br /> ${this.modules.t20.freeSwiftmends.toFixed(2)} swiftmends gained <br /> ${this.modules.t20.swiftmendReduced.toFixed(1)}s reduced on swiftmend <br />(${(this.modules.t20.swiftmendReduced / this.modules.t20.swiftmends).toFixed(1)}s per swiftmend on average)`}>
            {formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.t20.swiftmendThroughput))}% / {formatNumber(this.modules.t20.swiftmendThroughput / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      has4PT20 && {
        id: `spell-${SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.RESTO_DRUID_T20_4SET_BONUS_BUFF.id} />,
        result: (
          <dfn data-tip={`The actual healing contributed from 4P T20. <br/>${((this.selectedCombatant.getBuffUptime(SPELLS.BLOSSOMING_EFFLORESCENCE.id) / this.fightDuration) * 100).toFixed(2)}% uptime.`}>
            {formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.t20.healing))}% / {formatNumber(this.modules.t20.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },

      this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id) && {
        item: ITEMS.SOUL_OF_THE_ARCHDRUID,
        result: (
          <dfn data-tip={`
              <ul>
                <li>You had total ${this.modules.soulOfTheForest.proccs} Soul of the Forest proccs.</li>
                <li>Wild Growth consumed ${this.modules.soulOfTheForest.wildGrowths} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.wildGrowthHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.wildGrowthHealing)} healing</li>
                <li>Rejuvenation consumed ${this.modules.soulOfTheForest.rejuvenations} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.rejuvenationHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.rejuvenationHealing)} healing</li>
                <li>Regrowth consumed ${this.modules.soulOfTheForest.regrowths} procc(s) and contributed to ${(this.getPercentageOfTotalHealingDone(this.modules.soulOfTheForest.regrowthHealing) * 100).toFixed(2)} % / ${formatNumber(this.modules.soulOfTheForest.regrowthHealing)} healing</li>
              </ul>
            `}>
            {(this.getPercentageOfTotalHealingDone(soulOfTheForestHealing) * 100).toFixed(2)} % / {formatNumber(soulOfTheForestHealing / fightDuration * 1000)} HPS
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
            <Mana parser={this} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
