import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ParseResults from 'Parser/Core/ParseResults';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import DarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';
import AmalgamsSeventhSpine from 'Parser/Core/Modules/Items/AmalgamsSeventhSpine';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';

import DrapeOfShame from './Modules/Legendaries/DrapeOfShame';
import Velens from './Modules/Legendaries/Velens';
import Prydaz from './Modules/Legendaries/Prydaz';
import Ekowraith from './Modules/Legendaries/Ekowraith';
import XonisCaress from './Modules/Legendaries/XonisCaress';
import Sephuz from './Modules/Legendaries/Sephuz';
import DarkTitanAdvice from './Modules/Legendaries/DarkTitanAdvice';
import EssenceOfInfusion from './Modules/Legendaries/EssenceOfInfusion';
import Tearstone from './Modules/Legendaries/Tearstone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import Lifebloom from './Modules/Features/Lifebloom';
import Efflorescence from './Modules/Features/Efflorescence';
import Clearcasting from './Modules/Features/Clearcasting';
import TreeOfLife from './Modules/Features/TreeOfLife';
import Flourish from './Modules/Features/Flourish';
import Innervate from './Modules/Features/Innervate';
import PowerOfTheArchdruid from './Modules/Features/PowerOfTheArchdruid';

import {
  HEALING_TOUCH_HEAL_SPELL_ID,
  TREE_OF_LIFE_CAST_ID,
  REJUVENATION_HEAL_SPELL_ID,
  WILD_GROWTH_HEAL_SPELL_ID,
  FLOURISH_TALENT_SPELL_ID
} from './Constants';
import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';

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
  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: AbilityTracker,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    clearcasting: Clearcasting,
    treeOfLife: TreeOfLife,
    flourish: Flourish,
    innervate: Innervate,
    powerOfTheArchdruid: PowerOfTheArchdruid,

    // Legendaries:
    drapeOfShame: DrapeOfShame,
    velens: Velens,
    prydaz: Prydaz,
    ekowraith: Ekowraith,
    xonisCaress: XonisCaress,
    sephuz: Sephuz,
    darkTitanAdvice: DarkTitanAdvice,
    essenceOfInfusion: EssenceOfInfusion,
    tearstone: Tearstone,
    // TODO:
    // Edraith
    // Aman'Thul's Wisdom
    // SoulOfTheArchDruid
    // Chameleon Song

    // Shared:
    amalgamsSeventhSpine: AmalgamsSeventhSpine,
    darkmoonDeckPromises: DarkmoonDeckPromises,
  };

  generateResults() {
    const results = new ParseResults();

    // Tree of Life
    const hasFlourish = this.selectedCombatant.lv100Talent === FLOURISH_TALENT_SPELL_ID;
    const hasTreeOfLife = this.selectedCombatant.lv75Talent === TREE_OF_LIFE_CAST_ID;
    const wildGrowthTargets = 6; //TODO: We need to dynamically see if the player was affeced by ToL when flourish was cast hasTreeOfLife ? 8 : 6;
    const oneRejuvenationThroughput = (((this.modules.treeOfLife.totalHealingFromRejuvenationEncounter / this.totalHealing)) / this.modules.treeOfLife.totalRejuvenationsEncounter);
    const rejuvenationIncreasedEffect = (this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromRejuvenationDuringToL / (1.15 * 1.5)) / this.totalHealing;
    const tolIncreasedHealingDone = (this.modules.treeOfLife.totalHealingDuringToL - this.modules.treeOfLife.totalHealingDuringToL / 1.15) / this.totalHealing;
    const rejuvenationMana = (((this.modules.treeOfLife.totalRejuvenationsDuringToL * 10) * 0.3) / 10) * oneRejuvenationThroughput;
    const wildGrowthIncreasedEffect = (this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / 1.15 - this.modules.treeOfLife.totalHealingFromWildgrowthsDuringToL / (1.15 * (8 / 6))) / this.totalHealing;
    const treeOfLifeThroughput = rejuvenationIncreasedEffect + tolIncreasedHealingDone + rejuvenationMana + wildGrowthIncreasedEffect;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);
    const fightDuration = this.fightDuration;
    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    const potaHealing = (this.modules.powerOfTheArchdruid.rejuvenations * oneRejuvenationThroughput) + this.modules.powerOfTheArchdruid.healing / this.totalHealing;
    const hasMoC = this.selectedCombatant.lv100Talent === 155577; // TODO: refactor this
    const hasVelens = this.selectedCombatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT_BUFF.id);
    const velensHealingPercentage = this.modules.velens.healing / this.totalHealing;
    const prydazHealingPercentage = this.modules.prydaz.healing / this.totalHealing;
    const sepuhzHasteRating = ((this.modules.sephuz.uptime / this.fightDuration) * this.modules.sephuz.sephuzProccInHasteRating) + this.modules.sephuz.sephuzStaticHasteInRating;
    const sephuzThroughput = sepuhzHasteRating / this.selectedCombatant.intellect;
    const darkTitanAdviceHealing = this.modules.darkTitanAdvice.healing / this.totalHealing;
    const darkTitanAdviceHealingFromProcc = this.modules.darkTitanAdvice.healingFromProccs / this.totalHealing;
    const essenceOfInfusionHealing = this.modules.essenceOfInfusion.healing / this.totalHealing;
    const tearstoneHealing = this.modules.tearstone.rejuvs * oneRejuvenationThroughput;
    const xonisCaressHealingPercentage = this.modules.xonisCaress.healing / this.totalHealing;
    const ekowraithHealingPercentage = this.modules.ekowraith.healing / this.totalHealing;
    const ekowraithDamageReductionHealingPercentage = (this.modules.ekowraith.damageReductionHealing / (this.totalHealing + this.modules.ekowraith.damageReductionHealing));
    const drapeOfShameHealingPercentage = this.modules.drapeOfShame.healing / this.totalHealing;
    let lifebloomUptime = this.modules.lifebloom.uptime / this.fightDuration;
    if (lifebloomUptime > 1) {
      lifebloomUptime -= 1;
    }
    const efflorescenceUptime = this.modules.efflorescence.totalUptime / this.fightDuration;
    const unusedClearcastings = 1 - (this.modules.clearcasting.used / this.modules.clearcasting.total);

    // if (nonHealingTimePercentage > 0.3) {
    //   results.addIssue({
    //     issue: `Your non healing time can be improved. Try to cast heals more regularly (${Math.round(nonHealingTimePercentage * 100)}% non healing time).`,
    //     icon: 'petbattle_health-down',
    //     importance: getIssueImportance(nonHealingTimePercentage, 0.4, 0.45, true),
    //   });
    // }
    // if (deadTimePercentage > 0.2) {
    //   results.addIssue({
    //     issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when you're not healing try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
    //     icon: 'spell_mage_altertime',
    //     importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
    //   });
    // }
    if (efflorescenceUptime < 0.85) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=81269" target="_blank">Efflorescence</a> uptime can be improved. ({formatPercentage(efflorescenceUptime)} % uptime)</span>,
        icon: 'spell_druid_efflorescence',
        importance: getIssueImportance(efflorescenceUptime, 0.7, 0.5),
      });
    }
    if (!hasMoC && unusedClearcastings > 0.10) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=16870" target="_blank">Clearcasting</a> proccs should be used as soon as you get them so they are not overwritten. You missed {(this.modules.clearcasting.total - this.modules.clearcasting.used)}/{(this.modules.clearcasting.total)} proccs.</span>,
        icon: 'spell_druid_clearcasting',
        importance: getIssueImportance(unusedClearcastings, 0.5, 0.75, true),
      });
    }
    const wgsExtended = (this.modules.flourish.wildGrowth / wildGrowthTargets) / this.modules.flourish.flourishCounter;
    if (hasFlourish && wgsExtended < 1) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=197721" target="_blank">Flourish</a> should always aim to refresh <a href="http://www.wowhead.com/spell=48438" target="_blank">Wild Growth.</a> ({(this.modules.flourish.wildGrowth / 6).toFixed(0)}/{this.modules.flourish.flourishCounter} WGs extended)</span>,
        icon: 'spell_druid_flourish',
        importance: getIssueImportance(wgsExtended, 0.8, 0.6),
      });
    }
    const cwExtended = this.modules.flourish.cenarionWard / this.modules.flourish.flourishCounter;
    if (hasFlourish && cwExtended < 1) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=197721" target="_blank">Flourish</a> should always aim to refresh <a href="http://www.wowhead.com/spell=102352" target="_blank">Cenarion Ward.</a> ({this.modules.flourish.cenarionWard}/{this.modules.flourish.flourishCounter} CWs extended)</span>,
        icon: 'spell_druid_flourish',
        importance: getIssueImportance(cwExtended, 0, 0),
      });
    }
    if (lifebloomUptime < 0.85) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=33763" target="_blank">Lifebloom</a> uptime can be improved. ({formatPercentage(lifebloomUptime)} % uptime)</span>,
        icon: 'spell_druid_lifebloom',
        importance: getIssueImportance(lifebloomUptime, 0.7, 0.5),
      });
    }
    // Innervate mana spent
    if ((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) < 220000) {
      results.addIssue({
        issue: <span>Your mana spent during an <a href="http://www.wowhead.com/spell=29166" target="_blank">Innervate</a> can be improved. Always aim to cast at least 1 wild growth, 1 efflorescence and fill the rest with rejuvations for optimal usage. ({((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) / 1000).toFixed(0)}k avg mana spent)</span>,
        icon: 'spell_druid_innervate',
        importance: getIssueImportance((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount), 180000, 130000),
      });
    }
    // Innervata mana cappedc
    if (this.modules.innervate.secondsManaCapped > 0) {
      results.addIssue({
        issue: <span>You were capped on mana during <a href="http://www.wowhead.com/spell=29166" target="_blank">Innervate</a>. Why would you do that? (approx {this.modules.innervate.secondsManaCapped}s)</span>,
        icon: 'spell_druid_innervate',
        importance: getIssueImportance(this.modules.innervate.secondsManaCapped, 0, 0, true),
      });
    }
    if (hasTreeOfLife && treeOfLifeThroughput < 0.11) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=33891" target="_blank">Tree of Life</a> has quite low throughput, you might want to plan your CDs better or select another talent. ({formatPercentage(treeOfLifeThroughput)} % throughput)</span>,
        icon: 'spell_druid_tol',
        importance: getIssueImportance(treeOfLifeThroughput, 0.07, 0.04),
      });
    }
    if (hasVelens && velensHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>Your usage of <a href="http://www.wowhead.com/item=144258" target="_blank" class="legendary">Velen's Future Sight</a> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: 'spell_holy_healingfocus',
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    const healingTouches = getAbility(HEALING_TOUCH_HEAL_SPELL_ID).casts || 0;
    const healingTouchesPerMinute = healingTouches / (fightDuration / 1000) * 60;
    if (healingTouchesPerMinute > 0) {
      results.addIssue({
        issue: <span><a href="http://www.wowhead.com/spell=5185" target="_blank">Healing Touch</a> is an inefficient spell to cast. You should trust your co-healer to top people off, if you got nothing to do you can always dps. ({healingTouchesPerMinute.toFixed(2)} CPM).</span>,
        icon: 'spell_druid_healingtouch',
        importance: getIssueImportance(healingTouchesPerMinute, 0.5, 1, true),
      });
    }
    const rejuvenations = getAbility(REJUVENATION_HEAL_SPELL_ID).casts || 0;
    const wildGrowths = getAbility(WILD_GROWTH_HEAL_SPELL_ID).casts || 0;
    const wgsPerRejuv = wildGrowths / rejuvenations;
    if (wgsPerRejuv < 0.20) {
      results.addIssue({
        issue: <span>Your <a href="http://www.wowhead.com/spell=48438" target="_blank">Wild growth</a> to rejuv ratio can be improved, try to cast more wild growths if possible as it's usually more efficient. ({wildGrowths}/{rejuvenations} WGs per rejuv).</span>,
        icon: 'spell_druid_wildgrowth',
        importance: getIssueImportance(wgsPerRejuv, 0.15, 0.1),
      });
    }
    const regrowths = this.modules.clearcasting.used + this.modules.clearcasting.nonCCRegrowths;
    const nonCCRegrowths = this.modules.clearcasting.nonCCRegrowths;
    if (nonCCRegrowths / regrowths > 0) {
      results.addIssue({
        issue: <span><a href="http://www.wowhead.com/spell=8936" target="_blank">Regrowth</a> is an inefficient spell to cast without a <a href="http://www.wowhead.com/spell=16870" target="_blank">Clearcasting</a> procc. {nonCCRegrowths} of your regrowths were casted without a clearcasting procc.</span>,
        icon: 'spell_druid_regrowth',
        importance: getIssueImportance(nonCCRegrowths / regrowths, 0.5, 0.25, true),
      });
    }

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
            src="./img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />)}
        value={`${formatNumber(this.totalHealing / this.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}>
            Healing done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={(
          <img
            src="./img/icons/spell_druid_lifebloom.jpg"
            alt="Lifebloom uptime"
          />
        )}
        value={`${formatPercentage(lifebloomUptime)} %`}
        label='Lifebloom uptime'
      />,
      <StatisticBox
        icon={(
          <img
            src="./img/icons/spell_druid_efflorescence.jpg"
            alt="Efflorescence uptime"
          />
        )}
        value={`${formatPercentage(efflorescenceUptime)} %`}
        label='Efflorescence uptime'
      />,
      this.modules.powerOfTheArchdruid.hasTrait && (
        <StatisticBox
          icon={(
            <img
              src="./img/icons/spell_druid_pota.jpg"
              alt="Power of the archdruid"
            />
          )}
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
          icon={(
            <img
              src="./img/icons/spell_druid_flourish.jpg"
              alt="Average seconds extended by flourish"
            />
          )}
          value={`${(((this.modules.flourish.wildGrowth + this.modules.flourish.cenarionWard + this.modules.flourish.rejuvenation + this.modules.flourish.regrowth + this.modules.flourish.lifebloom + this.modules.flourish.springBlossoms + this.modules.flourish.cultivation) * 6) / this.modules.flourish.flourishCounter).toFixed(0)}s`}
          label={(
            <dfn data-tip={
              `<ul>
                  Your ${this.modules.flourish.flourishCounter} <a href="http://www.wowhead.com/spell=197721" target="_blank">Flourishes</a> extended:
                  <li>${this.modules.flourish.wildGrowth}/${this.modules.flourish.flourishCounter * wildGrowthTargets} <a href="http://www.wowhead.com/spell=48438" target="_blank">Wild Growths</a></li>
                  <li>${this.modules.flourish.cenarionWard}/${this.modules.flourish.flourishCounter} <a href="http://www.wowhead.com/spell=102351" target="_blank">Cenarion wards</a></li>
                  ${this.modules.flourish.rejuvenation > 0 ?
                `<li>${this.modules.flourish.rejuvenation} <a href="http://www.wowhead.com/spell=774" target="_blank">rejuvenations</a></li>`
                : ""
                }
                          ${this.modules.flourish.regrowth > 0 ?
                `<li>${this.modules.flourish.regrowth} <a href="http://www.wowhead.com/spell=8936" target="_blank">regrowths</a></li>`
                : ""
                }
                          ${this.modules.flourish.lifebloom > 0 ?
                `<li>${this.modules.flourish.lifebloom} <a href="http://www.wowhead.com/spell=33763" target="_blank">lifebloom</a></li>`
                : ""
                }
                          ${this.modules.flourish.springBlossoms > 0 ?
                `<li>${this.modules.flourish.springBlossoms} <a href="http://www.wowhead.com/spell=207386" target="_blank">spring blossoms</a></li>`
                : ""
                }
                          ${this.modules.flourish.cultivation > 0 ?
                `<li>${this.modules.flourish.cultivation} <a href="http://www.wowhead.com/spell=200389" target="_blank">cultivations</a></li>`
                : ""
                }
                          </ul>
                          `
            }>
              Average seconds extended by flourish
            </dfn>
          )}
        />
      ),
      <StatisticBox
        icon={(
          <img
            src="./img/icons/spell_druid_innervate.jpg"
            alt="Innervate saved per mana"
          />
        )}
        value={`${((this.modules.innervate.manaSaved / this.modules.innervate.innervateCount) / 1000).toFixed(0)}k mana`}
        label={(
          <dfn data-tip={
            `<ul>
                During your ${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=29166" target="_blank">Innervates</a> you cast:
                <li>${this.modules.innervate.wildGrowths}/${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=48438" target="_blank">Wild Growths</a></li>
                <li>${this.modules.innervate.efflorescences}/${this.modules.innervate.innervateCount} <a href="http://www.wowhead.com/spell=81269" target="_blank">Efflorescences</a></li>
                ${this.modules.innervate.cenarionWards > 0 ?
              `<li>${this.modules.innervate.cenarionWards} <a href="http://www.wowhead.com/spell=102351" target="_blank">Cenarion wards</a></li>`
              : ""
              }
                        ${this.modules.innervate.rejuvenations > 0 ?
              `<li>${this.modules.innervate.rejuvenations} <a href="http://www.wowhead.com/spell=774" target="_blank">Rejuvenations</a></li>`
              : ""
              }
                        ${this.modules.innervate.regrowths > 0 ?
              `<li>${this.modules.innervate.regrowths} <a href="http://www.wowhead.com/spell=8936" target="_blank">Regrowths</a></li>`
              : ""
              }
                        ${this.modules.innervate.lifeblooms > 0 ?
              `<li>${this.modules.innervate.lifeblooms} <a href="http://www.wowhead.com/spell=33763" target="_blank">Lifeblooms</a></li>`
              : ""
              }
                        ${this.modules.innervate.healingTouches > 0 ?
              `<li>${this.modules.innervate.healingTouches} <a href="http://www.wowhead.com/spell=5185" target="_blank">Healing touches</a></li>`
              : ""
              }
                        ${this.modules.innervate.swiftmends > 0 ?
              `<li>${this.modules.innervate.swiftmends} <a href="http://www.wowhead.com/spell=18562" target="_blank">Swiftmends</a></li>`
              : ""
              }
                        ${this.modules.innervate.tranquilities > 0 ?
              `<li>${this.modules.innervate.tranquilities} <a href="http://www.wowhead.com/spell=157982" target="_blank">tranquilities</a></li>`
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
          icon={(
            <a href="http://www.wowhead.com/spell=33891" target="_blank">
              <img
                src="./img/icons/spell_druid_tol.jpg"
                alt="Tree of Life"
              />
            </a>
          )}
          value={`${formatPercentage(treeOfLifeThroughput)} %`}
          label="Tree of Life throughput"
        />
      ),
      !hasMoC && (
        <StatisticBox
          icon={(
            <img
              src="./img/icons/spell_druid_clearcasting.jpg"
              alt="Unused Clearcastings"
            />
          )}
          value={`${formatPercentage(unusedClearcastings)} %`}
          label={(
            <dfn data-tip={`You got total <b>${this.modules.clearcasting.total} clearcasting proccs</b> and <b>used ${this.modules.clearcasting.used}</b> of them. <b>${this.modules.clearcasting.nonCCRegrowths} of your regrowths was used without a clearcasting procc</b>. Using a clearcasting procc as soon as you get it should be one of your top priorities. Even if it overheals you still get that extra mastery stack on a target and the minor HoT. Spending your GCD on a free spell also helps you with mana management in the long run.`}>
              Unused Clearcastings
            </dfn>
          )}
        />
      ),
      false && (
        <StatisticBox
          icon={(
            <img
              src="./img/icons/petbattle_health-down.jpg"
              alt="Non healing time"
            />
          )}
          value={`${formatPercentage(nonHealingTimePercentage)} %`}
          label={(
            <dfn data-tip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}>
              Non healing time (experimental, under dev)
            </dfn>
          )}
        />
      ),
    ];

    results.items = [
      this.modules.prydaz.active && {
        id: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id,
        icon: <ItemIcon id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        title: <ItemLink id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
            {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.prydaz.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasChest(ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id) && {
        id: ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id,
        icon: <ItemIcon id={ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id} />,
        title: <ItemLink id={ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id} />,
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
        id: ITEMS.XONIS_CARESS.id,
        icon: <ItemIcon id={ITEMS.XONIS_CARESS.id} />,
        title: <ItemLink id={ITEMS.XONIS_CARESS.id} />,
        result: (
          <dfn data-tip="The healing part from Ironbark. This doesn't include the reduced iron bark cooldown.">
            {((xonisCaressHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.xonisCaress.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id) && {
        id: ITEMS.THE_DARK_TITANS_ADVICE.id,
        icon: <ItemIcon id={ITEMS.THE_DARK_TITANS_ADVICE.id} />,
        title: <ItemLink id={ITEMS.THE_DARK_TITANS_ADVICE.id} />,
        result: (
          <dfn data-tip={`Random bloom stood for ${((darkTitanAdviceHealingFromProcc * 100) || 0).toFixed(2)} % of the total throughput.`}>
            {((darkTitanAdviceHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.darkTitanAdvice.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasFeet(ITEMS.ESSENCE_OF_INFUSION.id) && {
        id: ITEMS.ESSENCE_OF_INFUSION.id,
        icon: <ItemIcon id={ITEMS.ESSENCE_OF_INFUSION.id} />,
        title: <ItemLink id={ITEMS.ESSENCE_OF_INFUSION.id} />,
        result: `${((essenceOfInfusionHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.essenceOfInfusion.healing / fightDuration * 1000)} HPS`,
      },
      this.selectedCombatant.hasRing(ITEMS.TEARSTONE_OF_ELUNE.id) && {
        id: ITEMS.TEARSTONE_OF_ELUNE.id,
        icon: <ItemIcon id={ITEMS.TEARSTONE_OF_ELUNE.id} />,
        title: <ItemLink id={ITEMS.TEARSTONE_OF_ELUNE.id} />,
        result: (
          <dfn data-tip={`Your Tearstone gave ${this.modules.tearstone.rejuvs} bonus rejuvenations. Proccrate of ring was ${(this.modules.tearstone.rejuvs / this.modules.tearstone.wildGrowths * 100).toFixed(2)}%`}>
            {((tearstoneHealing * 100) || 0).toFixed(2)} %
          </dfn>
        ),
      },
      this.modules.velens.active && {
        id: ITEMS.VELENS_FUTURE_SIGHT_BUFF.id,
        icon: <ItemIcon id={ITEMS.VELENS_FUTURE_SIGHT_BUFF.id} />,
        title: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT_BUFF.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
            {((velensHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.velens.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.selectedCombatant.hasRing(ITEMS.SEPHUZS_SECRET.id) && {
        id: ITEMS.SEPHUZS_SECRET.id,
        icon: <ItemIcon id={ITEMS.SEPHUZS_SECRET.id} />,
        title: <ItemLink id={ITEMS.SEPHUZS_SECRET.id} />,
        result: (
          <dfn data-tip="Estimated throughput gained by using Sephuz by calculating haste gained in throughput, given 1 haste = 1 INT.">
            {((sephuzThroughput * 100) || 0).toFixed(2)} %
          </dfn>
        ),
      },

      this.selectedCombatant.hasBack(ITEMS.DRAPE_OF_SHAME.id) && {
        id: ITEMS.DRAPE_OF_SHAME.id,
        icon: <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} />,
        title: <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
            {((drapeOfShameHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.drapeOfShame.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.amalgamsSeventhSpine.active && {
        id: ITEMS.AMALGAMS_SEVENTH_SPINE.id,
        icon: <ItemIcon id={ITEMS.AMALGAMS_SEVENTH_SPINE.id} />,
        title: <ItemLink id={ITEMS.AMALGAMS_SEVENTH_SPINE.id} />,
        result: (
          <dfn data-tip={`The exact amunt of mana gained from the Amalgam's Seventh Spine equip effect. You let the buff expire successfully ${this.modules.amalgamsSeventhSpine.procs} times. You refreshed the buff ${this.modules.amalgamsSeventhSpine.refreshes} times (refreshing delays the buff expiration and is inefficient use of this trinket).`}>
            {formatThousands(this.modules.amalgamsSeventhSpine.manaGained)} mana gained ({formatThousands(this.modules.amalgamsSeventhSpine.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        )
      },
      this.modules.darkmoonDeckPromises.active && {
        id: ITEMS.DARKMOON_DECK_PROMISES.id,
        icon: <ItemIcon id={ITEMS.DARKMOON_DECK_PROMISES.id} />,
        title: <ItemLink id={ITEMS.DARKMOON_DECK_PROMISES.id} />,
        result: (
          <dfn data-tip={`The exact amunt of mana saved by the Darkmoon Deck: Promises equip effect. This takes the different values per card into account at the time of the cast. Mana values assume you have a 875 item level version.`}>
            {formatThousands(this.modules.darkmoonDeckPromises.manaGained)} mana saved ({formatThousands(this.modules.darkmoonDeckPromises.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        )
      },

      //TODO
      //has4PT19 && (
      // (
      //   <li className="item clearfix" key={T19_4SET_BONUS_BUFF_ID}>
      //     <article>
      //       <figure>
      //         <img
      //           src="./img/icons/spell_druid_rejuvenation.jpg"
      //           alt="Rejuvenation"
      //         />
      //       </figure>
      //       <div>
      //         <header>
      //           <a href="http://www.wowhead.com/spell=211170/item-druid-t19-restoration-4p-bonus" target="_blank">
      //             T19 4 set bonus
      //           </a>
      //         </header>
      //         <main>
      //           50 bonus rejuvenation gained.
      //         </main>
      //       </div>
      //     </article>
      //   </li>
      // ),
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
            cooldowns={this.modules.cooldownTracker.cooldowns}
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
    ];

    return results;
  }
}

export default CombatLogParser;
