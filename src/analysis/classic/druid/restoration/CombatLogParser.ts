// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste, CelestialFocus, GiftOfTheEarthmother } from '../shared';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Healer Features
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import Revitalize from '../shared/talents/Revitalize';
import Rejuvenation from './modules/spells/Rejuvenation';
import HotTrackerRestoDruid from './modules/core/HotTrackerRestoDruid';
import Guide from './Guide';
import Swiftmend from './modules/spells/Swiftmend';

import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import SwiftmendNormalizer from './modules/normalizers/SwiftmendNormalizer';
import WildGrowth from './modules/spells/WildGrowth';
import HotCountGraph from './modules/features/HotCountGraph';
import Innervate from './modules/spells/Innervate';
import Lifebloom from './modules/spells/Lifebloom';
import OmenOfClarity from '../shared/talents/OmenOfClarity';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    castLinkNormalizer: CastLinkNormalizer,
    swiftmendNormalizer: SwiftmendNormalizer,

    hotTracker: HotTrackerRestoDruid,
    // Shared
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    hotCountGraph: HotCountGraph,
    // Healer Features
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,
    // Spells
    rejuvenation: Rejuvenation,
    swiftmend: Swiftmend,
    wildGrowth: WildGrowth,
    innervate: Innervate,
    lifebloom: Lifebloom,
    // Talents
    celestialFocus: CelestialFocus,
    giftOfTheEarthmother: GiftOfTheEarthmother,
    revitalise: Revitalize,
    omenOfClarity: OmenOfClarity,
  };

  static guide = Guide;
}

export default CombatLogParser;
