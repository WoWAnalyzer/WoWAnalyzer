import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';
import DeathRecapTracker from 'Main/DeathRecapTracker';

import PainTracker from './Modules/Pain/PainTracker';
import PainDetails from './Modules/Pain/PainDetails';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import SoulFragments from './Modules/Statistics/SoulFragments/SoulFragments';
import SpiritBomb from './Modules/Statistics/SpiritBomb/SpiritBomb';

import ImmolationAura from './Modules/Statistics/Spells/ImmolationAura';
import DemonSpikes from './Modules/Spells/DemonSpikes';
import EmpowerWards from './Modules/Statistics/Spells/EmpowerWards';
import SigilOfFlame from './Modules/Spells/SigilOfFlame';

import Painbringer from './Modules/Spells/Painbringer/Painbringer';
import PainbringerTimesByStacks from './Modules/Spells/Painbringer/PainbringerTimesByStacks';
import PainbringerStacksBySeconds from './Modules/Spells/Painbringer/PainbringerTimesByStacks';

import SoulBarrier from './Modules/Spells/SoulBarrier';

import Tier202PBonus from './Modules/Tier/Tier20/Tier20-2P.js';
import Tier204PBonus from './Modules/Tier/Tier20/Tier20-4P.js';
import SoulOfTheSlayer from '../Shared/Modules/Items/SoulOfTheSlayer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    deathRecapTracker: DeathRecapTracker,

    //Resource Tracker
    painTracker :PainTracker,
    painDetails: PainDetails,

    // Spirit Bomb Tracker Module (Frailty uptime tracker)
    spiritBomb: SpiritBomb,

    // Soul Fragments Tracker module (includes Generated and Wasted)
    soulFragments: SoulFragments,

    // Spell Statistics
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    empowerWards: EmpowerWards,
    sigilOfFlame: SigilOfFlame,
    painbringer: Painbringer,
    painbringerTimesByStacks: PainbringerTimesByStacks,
    painbringerStacksBySeconds: PainbringerStacksBySeconds,
    soulBarrier: SoulBarrier,

    // Tier 20
    tier202PBonus: Tier202PBonus,
    tier204PBonus: Tier204PBonus,
    soulOfTheSlayer: SoulOfTheSlayer,
  };

}

export default CombatLogParser;
