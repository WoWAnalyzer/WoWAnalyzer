import React from 'react';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import WildGrowthNormalizer from './Normalizers/WildGrowth';

import Mastery from './Modules/Core/Mastery';
import Rejuvenation from './Modules/Core/Rejuvenation';

import Ekowraith from './Modules/Items/Ekowraith';
import XonisCaress from './Modules/Items/XonisCaress';
import DarkTitanAdvice from './Modules/Items/DarkTitanAdvice';
import EssenceOfInfusion from './Modules/Items/EssenceOfInfusion';
import SoulOfTheArchdruid from './Modules/Items/SoulOfTheArchdruid';
import Tearstone from './Modules/Items/Tearstone';
import DarkmoonDeckPromises from './Modules/Items/DarkmoonDeckPromises';
import GarothiFeedbackConduit from './Modules/Items/GarothiFeedbackConduit';
import CarafeOfSearingLight from './Modules/Items/CarafeOfSearingLight';

import T19_2Set from './Modules/Items/T19_2Set';
import T20_2Set from './Modules/Items/T20_2Set';
import T20_4Set from './Modules/Items/T20_4Set';
import T21_2Set from './Modules/Items/T21_2Set';
import T21_4Set from './Modules/Items/T21_4Set';

import HealingTouch from './Modules/Features/HealingTouch';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import AverageHots from './Modules/Features/AverageHots';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import WildGrowth from './Modules/Features/WildGrowth';
import Lifebloom from './Modules/Features/Lifebloom';
import Efflorescence from './Modules/Features/Efflorescence';
import Clearcasting from './Modules/Features/Clearcasting';
import Innervate from './Modules/Features/Innervate';
import PowerOfTheArchdruid from './Modules/Features/PowerOfTheArchdruid';
import Dreamwalker from './Modules/Features/Dreamwalker';
import EssenceOfGhanir from './Modules/Features/EssenceOfGhanir';
import NaturesEssence from './Modules/Features/NaturesEssence';
import Ironbark from './Modules/Features/Ironbark';

import CenarionWard from './Modules/Talents/CenarionWard';
import Cultivation from './Modules/Talents/Cultivation';
import Flourish from './Modules/Talents/Flourish';
import SpringBlossoms from './Modules/Talents/SpringBlossoms';
import SoulOfTheForest from './Modules/Talents/SoulOfTheForest';
import TreeOfLife from './Modules/Talents/TreeOfLife';

import RelicTraits from './Modules/Traits/RelicTraits';
import ArmorOfTheAncients from './Modules/Traits/ArmorOfTheAncients';
import BlessingOfTheWorldTree from './Modules/Traits/BlessingOfTheWorldTree';
import EssenceOfNordrassil from './Modules/Traits/EssenceOfNordrassil';
import Grovewalker from './Modules/Traits/Grovewalker';
import InfusionOfNature from './Modules/Traits/InfusionOfNature';
import KnowledgeOfTheAncients from './Modules/Traits/KnowledgeOfTheAncients';
import NaturalMending from './Modules/Traits/NaturalMending';
import Persistence from './Modules/Traits/Persistence';
import SeedsOfTheWorldTree from './Modules/Traits/SeedsOfTheWorldTree';
import EternalRestoration from './Modules/Traits/EternalRestoration';

import StatWeights from './Modules/Features/StatWeights';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    wildGrowthNormalizer: WildGrowthNormalizer,

    // Core
    healingDone: [HealingDone, { showStatistic: true }],

    // Features
    healingTouch : HealingTouch,
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    averageHots: AverageHots,
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
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
    ironbark: Ironbark,

    // Items:
    ekowraith: Ekowraith,
    xonisCaress: XonisCaress,
    darkTitanAdvice: DarkTitanAdvice,
    essenceOfInfusion: EssenceOfInfusion,
    soulOfTheArchdruid: SoulOfTheArchdruid,
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
    garothiFeedbackConduit: GarothiFeedbackConduit,
    carafeOfSearingLight: CarafeOfSearingLight,

    // Traits
    RelicTraits: RelicTraits,
    ArmorOfTheAncients: ArmorOfTheAncients,
    BlessingOfTheWorldTree: BlessingOfTheWorldTree,
    EssenceOfNordrassil: EssenceOfNordrassil,
    Grovewalker: Grovewalker,
    InfusionOfNature: InfusionOfNature,
    KnowledgeOfTheAncients: KnowledgeOfTheAncients,
    NaturalMending: NaturalMending,
    Persistence: Persistence,
    SeedsOfTheWorldTree: SeedsOfTheWorldTree,
    EternalRestoration: EternalRestoration,

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
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
