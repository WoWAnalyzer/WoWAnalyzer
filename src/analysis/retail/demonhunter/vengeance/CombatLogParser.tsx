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
  SwallowedAnger,
  TheHunt,
  UnnaturalMalice,
} from 'analysis/retail/demonhunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
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
import SoulFragmentsConsume from './modules/statistics/SoulFragmentsConsume';
import SoulsOvercap from './modules/statistics/SoulsOvercap';
import AgonizingFlames from './modules/talents/AgonizingFlames';
import BurningAlive from './modules/talents/BurningAlive';
import ElysianDecree from './modules/talents/ElysianDecree';
import FeastOfSouls from './modules/talents/FeastOfSouls';
import FeedTheDemon from './modules/talents/FeedTheDemon';
import SoulBarrier from './modules/talents/SoulBarrier';
import FrailtyDebuff from './modules/talents/FrailtyDebuff';
import SpiritBomb from './modules/talents/SpiritBomb';
import PainbringerBuff from './modules/talents/PainbringerBuff';
import DarkglareBoon from './modules/talents/DarkglareBoon';
import StokeTheFlames from './modules/talents/StokeTheFlames';
import FieryBrand from './modules/talents/FieryBrand';
import VoidReaver from './modules/talents/VoidReaver';
import Metamorphosis from './modules/spells/Metamorphosis';
import ShearFractureNormalizer from './normalizers/ShearFractureNormalizer';
import SoulFragmentsGraph from './modules/resourcetracker/SoulFragmentsGraph';
import SoulFragmentBuffStackTracker from './modules/resourcetracker/SoulFragmentBuffStackTracker';
import Fracture from './modules/talents/Fracture';
import SoulCarver from './modules/talents/SoulCarver';
import FelDevastation from './modules/talents/FelDevastation';
import ImmolationAuraLinker from './normalizers/ImmolationAuraLinker';
import SoulCleaveEventLinkNormalizer from './normalizers/SoulCleaveEventLinkNormalizer';
import SpiritBombEventLinkNormalizer from './normalizers/SpiritBombEventLinkNormalizer';
import SoulCleave from './modules/spells/SoulCleave';
import DefensiveBuffs from './modules/core/MajorDefensives/DefensiveBuffs';
import DefensiveBuffLinkNormalizer from './modules/core/MajorDefensives/DefensiveBuffLinkNormalizer';
import FieryBrand2 from './modules/core/MajorDefensives/FieryBrand';
import DemonSpikes2 from './modules/core/MajorDefensives/DemonSpikes';
import Metamorphosis2 from './modules/core/MajorDefensives/Metamorphosis';
import Guide from './Guide';

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

    // Resource Tracker
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,
    soulFragmentBuffStackTracker: SoulFragmentBuffStackTracker,
    soulFragmentsGraph: SoulFragmentsGraph,

    // normalizers
    shearFractureNormalizer: ShearFractureNormalizer,
    immolationAuraLinker: ImmolationAuraLinker,
    soulCleaveEventLinkNormalizer: SoulCleaveEventLinkNormalizer,
    spiritBombEventLinkNormalizer: SpiritBombEventLinkNormalizer,
    defensiveBuffLinkNormalizer: DefensiveBuffLinkNormalizer,

    // Talents
    painbringer: PainbringerBuff,
    frailtyDebuff: FrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBomb: SpiritBomb,
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
    voidReaver: VoidReaver,
    fracture: Fracture,
    soulCarver: SoulCarver,
    felDevastation: FelDevastation,
    fieryBrand2: FieryBrand2,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    infernalStrike: InfernalStrike,
    metamorphosis: Metamorphosis,
    metamorphosis2: Metamorphosis2,
    soulCleave: SoulCleave,
    defensiveBuffs: DefensiveBuffs,
    demonSpikes2: DemonSpikes2,

    // Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,
  };

  static guide = Guide;
}

export default CombatLogParser;
