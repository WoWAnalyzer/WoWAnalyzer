import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

import HealingDone from './Modules/Core/HealingDone';

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

import HealingTouch from './Modules/Features/HealingTouch';
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

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {

    // Core
    healingDone: HealingDone,

    // Features
    healingTouch : HealingTouch,
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
