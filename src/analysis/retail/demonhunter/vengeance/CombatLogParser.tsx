import {
  CharredWarblades,
  CollectiveAnguish,
  Demonic,
  DisruptingFury,
  Felblade,
  FlamesOfFury,
  ImmolationAura,
  MasterOfTheGlaive,
  ShatteredRestoration,
  SigilOfFlame,
  SwallowedAnger,
  TheHunt,
  UnnaturalMalice,
} from 'analysis/retail/demonhunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MitigationCheck from './modules/features/MitigationCheck';
import SoulFragmentsTracker from './modules/features/SoulFragmentsTracker';
import FuryDetails from './modules/resourcetracker/FuryDetails';
import FuryGraph from './modules/resourcetracker/FuryGraph';
import FuryTracker from './modules/resourcetracker/FuryTracker';
import DemonSpikes from './modules/spells/DemonSpikes';
import InfernalStrike from './modules/spells/InfernalStrike';
import ShearFracture from './modules/spells/ShearFracture';
import SoulCleaveSoulsConsumed from './modules/spells/SoulCleaveSoulsConsumed';
import SoulFragmentsConsume from './modules/statistics/SoulFragmentsConsume';
import SoulsOvercap from './modules/statistics/SoulsOvercap';
import AgonizingFlames from './modules/talents/AgonizingFlames';
import BurningAlive from './modules/talents/BurningAlive';
import ElysianDecree from './modules/talents/ElysianDecree';
import FeastOfSouls from './modules/talents/FeastOfSouls';
import FeedTheDemon from './modules/talents/FeedTheDemon';
import SoulBarrier from './modules/talents/SoulBarrier';
import FrailtyDebuff from './modules/talents/FrailtyDebuff';
import SpiritBombSoulsConsume from './modules/talents/SpiritBombSoulsConsume';
import PainbringerBuff from './modules/talents/PainbringerBuff';
import DarkglareBoon from './modules/talents/DarkglareBoon';
import StokeTheFlames from './modules/talents/StokeTheFlames';
import FieryBrand from './modules/talents/FieryBrand';
import ShearFractureNormalizer from './normalizers/ShearFractureNormalizer';
import SoulFragmentsGraph from './modules/resourcetracker/SoulFragmentsGraph';
import SoulFragmentBuffStackTracker from './modules/resourcetracker/SoulFragmentBuffStackTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    mitigationCheck: MitigationCheck,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
    checklist: Checklist,

    // Resource Tracker
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,
    soulFragmentBuffStackTracker: SoulFragmentBuffStackTracker,
    soulFragmentsGraph: SoulFragmentsGraph,

    // normalizers
    shearFractureNormalizer: ShearFractureNormalizer,

    // Talents
    painbringer: PainbringerBuff,
    frailtyDebuff: FrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBombSoulsConsume: SpiritBombSoulsConsume,
    feedTheDemon: FeedTheDemon,
    burningAlive: BurningAlive,
    feastOfSouls: FeastOfSouls,
    agonizingFlames: AgonizingFlames,
    shearFracture: ShearFracture,
    shatteredRestoration: ShatteredRestoration,
    theHunt: TheHunt,
    elysianDecree: ElysianDecree,
    felblade: Felblade,
    charredWarblades: CharredWarblades,
    masterOfTheGlaive: MasterOfTheGlaive,
    darkglareBoon: DarkglareBoon,
    collectiveAnguish: CollectiveAnguish,
    demonic: Demonic,
    stokeTheFlames: StokeTheFlames,
    unnaturalMalice: UnnaturalMalice,
    swallowedAnger: SwallowedAnger,
    flamesOfFury: FlamesOfFury,
    disruptingFury: DisruptingFury,
    fieryBrand: FieryBrand,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    sigilOfFlame: SigilOfFlame,
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,
    infernalStrike: InfernalStrike,

    // Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,
  };
}

export default CombatLogParser;
