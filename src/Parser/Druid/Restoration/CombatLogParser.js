import React from 'react';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import WildGrowthNormalizer from './Normalizers/WildGrowth';
import ClearcastingNormalizer from './Normalizers/ClearcastingNormalizer';
import HotApplicationNormalizer from './Normalizers/HotApplicationNormalizer';
import TreeOfLifeNormalizer from './Normalizers/TreeOfLifeNormalizer';

import Checklist from './Modules/Features/Checklist';

import Mastery from './Modules/Core/Mastery';
import Rejuvenation from './Modules/Core/Rejuvenation';

import HotTracker from './Modules/Core/HotTracking/HotTracker';
import RejuvenationAttributor from './Modules/Core/HotTracking/RejuvenationAttributor';
import RegrowthAttributor from './Modules/Core/HotTracking/RegrowthAttributor';
import DreamerAttributor from './Modules/Core/HotTracking/DreamerAttributor';

import Ekowraith from './Modules/Items/Ekowraith';
import XonisCaress from './Modules/Items/XonisCaress';
import DarkTitanAdvice from './Modules/Items/DarkTitanAdvice';
import EdraithBondsOfAglaya from './Modules/Items/EdraithBondsOfAglaya';
import EssenceOfInfusion from './Modules/Items/EssenceOfInfusion';
import SoulOfTheArchdruid from '../Shared/Modules/Items/SoulOfTheArchdruid';
import Tearstone from './Modules/Items/Tearstone';
import AmanthulsWisdom from './Modules/Items/AmanthulsWisdom';
import DarkmoonDeckPromises from './Modules/Items/DarkmoonDeckPromises';
import GarothiFeedbackConduit from './Modules/Items/GarothiFeedbackConduit';
import CarafeOfSearingLight from './Modules/Items/CarafeOfSearingLight';

import T19_2Set from './Modules/Items/T19_2Set';
import T19_4Set from './Modules/Items/T19_4Set';
import T20_2Set from './Modules/Items/T20_2Set';
import T20_4Set from './Modules/Items/T20_4Set';
import T21_2Set from './Modules/Items/T21_2Set';
import T21_4Set from './Modules/Items/T21_4Set';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import AverageHots from './Modules/Features/AverageHots';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import WildGrowth from './Modules/Features/WildGrowth';
import Lifebloom from './Modules/Features/Lifebloom';
import Efflorescence from './Modules/Features/Efflorescence';
import Clearcasting from './Modules/Features/Clearcasting';
import Innervate from './Modules/Features/Innervate';
import NaturesEssence from './Modules/Features/NaturesEssence';
import Ironbark from './Modules/Features/Ironbark';

import CenarionWard from './Modules/Talents/CenarionWard';
import Cultivation from './Modules/Talents/Cultivation';
import Flourish from './Modules/Talents/Flourish';
import SpringBlossoms from './Modules/Talents/SpringBlossoms';
import SoulOfTheForest from './Modules/Talents/SoulOfTheForest';
import TreeOfLife from './Modules/Talents/TreeOfLife';
import Photosynthesis from './Modules/Talents/Photosynthesis';

import StatWeights from './Modules/Features/StatWeights';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';


class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    wildGrowthNormalizer: WildGrowthNormalizer,
    clearcastingNormalizer: ClearcastingNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer, // this needs to be loaded after potaNormalizer, as potaNormalizer can sometimes unfix the events if loaded before...
    treeOfLifeNormalizer: TreeOfLifeNormalizer,

    // Core
    healingDone: [HealingDone, { showStatistic: true }],
    rejuvenation: Rejuvenation,
    mastery: Mastery,

    // Checklist
    checklist: Checklist,

    // Hot Tracking
    hotTracker: HotTracker,
    rejuvenationAttributor: RejuvenationAttributor,
    regrowthAttributor: RegrowthAttributor,
    dreamerAttributor: DreamerAttributor,

    // Features
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    averageHots: AverageHots,
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    clearcasting: Clearcasting,
    treeOfLife: TreeOfLife,
    photosynthesis: Photosynthesis,
    flourish: Flourish,
    innervate: Innervate,
    soulOfTheForest: SoulOfTheForest,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    cenarionWard: CenarionWard,
    naturesEssence: NaturesEssence,
    ironbark: Ironbark,

    // Items:
    edraithBondsOfAglaya: EdraithBondsOfAglaya,
    ekowraith: Ekowraith,
    xonisCaress: XonisCaress,
    darkTitanAdvice: DarkTitanAdvice,
    essenceOfInfusion: EssenceOfInfusion,
    soulOfTheArchdruid: SoulOfTheArchdruid,
    tearstone: Tearstone,
    amanthulsWisdom: AmanthulsWisdom,
    t19_2set: T19_2Set,
    t19_4set: T19_4Set,
    t20_2set: T20_2Set,
    t20_4set: T20_4Set,
    t21_2set: T21_2Set,
    t21_4set: T21_4Set,

    // Shared:
    darkmoonDeckPromises: DarkmoonDeckPromises,
    garothiFeedbackConduit: GarothiFeedbackConduit,
    carafeOfSearingLight: CarafeOfSearingLight,

    statWeights: StatWeights,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      ...results.tabs,
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
