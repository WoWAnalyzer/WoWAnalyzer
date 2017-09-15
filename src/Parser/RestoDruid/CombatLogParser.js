import React from 'react';

import SPELLS from 'common/SPELLS';
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
import T20_2Set from './Modules/Legendaries/T20_2Set';
import T20_4Set from './Modules/Legendaries/T20_4Set';
import T21_2Set from './Modules/Legendaries/T21_2Set';
import T21_4Set from './Modules/Legendaries/T21_4Set';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import Rejuvenation from './Modules/Features/Rejuvenation';
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
  return (`${Math.round(number || 0)}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
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
    rejuvenation: Rejuvenation,
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
    t20_2set: T20_2Set,
    t20_4set: T20_4Set,
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
    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);
    const rejuvenations = getAbility(SPELLS.REJUVENATION.id).casts || 0;
    const wildGrowths = getAbility(SPELLS.WILD_GROWTH.id).casts || 0;

    const rejuvenationManaCost = 22000;
    const oneRejuvenationThroughput = this.getPercentageOfTotalHealingDone(this.modules.treeOfLife.totalHealingFromRejuvenationEncounter) / this.modules.treeOfLife.totalRejuvenationsEncounter;

    const fightDuration = this.fightDuration;


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
        issue: <span>Your <a href="http://www.wowhead.com/spell=48438" target="_blank" rel="noopener noreferrer">Wild growth</a> to rejuv ratio can be improved, try to cast more wild growths if possible as it is usually more efficient.</span>,
        stat: `${wildGrowths}/${rejuvenations} WGs per rejuv. (>20% is recommended)`,
        icon: SPELLS.WILD_GROWTH.icon,
        importance: getIssueImportance(wgsPerRejuv, 0.15, 0.1),
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
      ...results.statistics,
    ];

    results.items = [
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
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.modules.combatants.selected} />
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
