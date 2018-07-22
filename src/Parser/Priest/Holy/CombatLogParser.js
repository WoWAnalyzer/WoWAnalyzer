import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Abilities from './Modules/Abilities';

import SpellManaCost from './Modules/Core/SpellManaCost';

// Spell data
import DivineHymn from './Modules/Spells/DivineHymn';
import Sanctify from './Modules/Spells/Sanctify';
import SpiritOfRedemption from './Modules/Spells/SpiritOfRedemption';

// Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import SpellUsable from './Modules/Features/SpellUsable';

// Priest Core
import EnduringRenewal from './Modules/PriestCore/EnduringRenewal';
import MasteryBreakdown from './Modules/PriestCore/MasteryBreakdown';
import Serendipity from './Modules/PriestCore/Serendipity';
import SanctifyReduction from './Modules/PriestCore/SerendipityReduction/SanctifyReduction';
import SerenityReduction from './Modules/PriestCore/SerendipityReduction/SerenityReduction';
import HymnBuffBenefit from './Modules/PriestCore/HymnBuffBenefit';
import HolyWords from './Modules/PriestCore/HolyWords';

// Items
import TrousersOfAnjuna from './Modules/Items/TrousersOfAnjuna';
import XanshiCloak from './Modules/Items/XanshiCloak';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    spellManaCost: SpellManaCost,
    healingDone: [HealingDone, { showStatistic: true }],
    abilities: Abilities,
    lowHealthHealing: LowHealthHealing,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    // Core
    enduringRenewal: EnduringRenewal,
    masteryBreakdown: MasteryBreakdown,
    serendipity: Serendipity,
    sancReduction: SanctifyReduction,
    sereReduction: SerenityReduction,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWords: HolyWords,

    // Spells
    divineHymn: DivineHymn,
    sanctify: Sanctify,
    spiritOfRedemption: SpiritOfRedemption,

    // Items
    trousersOfAnjuna: TrousersOfAnjuna,
    xanshiCloak: XanshiCloak,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
