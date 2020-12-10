import CoreCombatLogParser from 'parser/core/CombatLogParser';

import PainTracker from './modules/pain/PainTracker';
import PainDetails from './modules/pain/PainDetails';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MitigationCheck from './modules/features/MitigationCheck';

import Checklist from './modules/features/Checklist/Module';

import SoulFragmentsConsume from './modules/statistics/SoulFragmentsConsume';
import SoulFragmentsTracker from './modules/features/SoulFragmentsTracker';
import SoulsOvercap from './modules/statistics/SoulsOvercap';

import SpiritBombFrailtyDebuff from './modules/talents/SpiritBombFrailtyDebuff';
import SoulBarrier from './modules/talents/SoulBarrier';
import SpiritBombSoulsConsume from './modules/talents/SpiritBombSoulsConsume';
import VoidReaverDebuff from './modules/talents/VoidReaverDebuff';
import FeedTheDemon from './modules/talents/FeedTheDemon';
import Gluttony from './modules/talents/Gluttony';
import BurningAlive from './modules/talents/BurningAlive';
import FeastOfSouls from './modules/talents/FeastOfSouls';
import AgonizingFlames from './modules/talents/AgonizingFlames';
import RazorSpikes from './modules/talents/RazorSpikes';

import ImmolationAura from './modules/spells/ImmolationAura';
import DemonSpikes from './modules/spells/DemonSpikes';
import SigilOfFlame from './modules/spells/SigilOfFlame';
import SoulCleaveSoulsConsumed from './modules/spells/SoulCleaveSoulsConsumed';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    mitigationCheck: MitigationCheck,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
    checklist: Checklist,

    // Resource Tracker
    painTracker: PainTracker,
    painDetails: PainDetails,

    // Talents
    SpiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBombSoulsConsume: SpiritBombSoulsConsume,
    feedTheDemon: FeedTheDemon,
    gluttony: Gluttony,
    burningAlive: BurningAlive,
    feastOfSouls: FeastOfSouls,
    agonizingFlames: AgonizingFlames,
    razorSpikes: RazorSpikes,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    sigilOfFlame: SigilOfFlame,
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,
    voidReaverDebuff: VoidReaverDebuff,

    // Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,
  };
}

export default CombatLogParser;
