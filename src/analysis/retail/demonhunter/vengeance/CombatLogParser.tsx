import {
  CharredWarblades,
  CollectiveAnguish,
  DemonSoulBuff,
  DisruptingFury,
  Felblade,
  ImmolationAura,
  MasterOfTheGlaive,
  ShatteredRestoration,
  SigilOfFlame,
  SwallowedAnger,
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
import InfernalStrike from './modules/spells/InfernalStrike';
import SoulFragmentsConsume from './modules/statistics/SoulFragmentsConsume';
import SoulsOvercap from './modules/statistics/SoulsOvercap';
import AgonizingFlames from './modules/talents/AgonizingFlames';
import BurningAlive from './modules/talents/BurningAlive';
import SigilOfSpite from './modules/talents/SigilOfSpite';
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
import FractureNormalizer from './normalizers/FractureNormalizer';
import SoulFragmentsGraph from './modules/resourcetracker/SoulFragmentsGraph';
import SoulFragmentBuffStackTracker from './modules/resourcetracker/SoulFragmentBuffStackTracker';
import Fracture from './modules/spells/Fracture';
import SoulCarver from './modules/talents/SoulCarver';
import FelDevastation from './modules/talents/FelDevastation';
import ImmolationAuraLinker from './normalizers/ImmolationAuraLinker';
import SoulCleaveEventLinkNormalizer from './normalizers/SoulCleaveEventLinkNormalizer';
import SpiritBombEventLinkNormalizer from './normalizers/SpiritBombEventLinkNormalizer';
import SoulCleave from './modules/spells/SoulCleave';
import DefensiveBuffs from './modules/core/MajorDefensives/DefensiveBuffs';
import DefensiveBuffLinkNormalizer from './modules/core/MajorDefensives/DefensiveBuffLinkNormalizer';
import FieryBrand2 from './modules/core/MajorDefensives/FieryBrand';
import DemonSpikes from './modules/core/MajorDefensives/DemonSpikes';
import Metamorphosis from './modules/core/MajorDefensives/Metamorphosis';
import Guide from './Guide';
import FelDevastationLinkNormalizer from './normalizers/FelDevastationLinkNormalizer';
import FelDevastationNormalizer from './normalizers/FelDevastationNormalizer';
import Demonsurge from '../shared/modules/hero/felscarred/Demonsurge/analyzer';
import DemonsurgeEventLinkNormalizer from '../shared/modules/hero/felscarred/Demonsurge/eventLinkNormalizer';
import SigilOfFlameNormalizer from './normalizers/SigilOfFlameNormalizer';
import MID1Vengeance2P from './modules/items/MID1Vengeance2P';
import MID1Vengeance4P from './modules/items/MID1Vengeance4P';

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
    fractureNormalizer: FractureNormalizer,
    immolationAuraLinker: ImmolationAuraLinker,
    soulCleaveEventLinkNormalizer: SoulCleaveEventLinkNormalizer,
    spiritBombEventLinkNormalizer: SpiritBombEventLinkNormalizer,
    defensiveBuffLinkNormalizer: DefensiveBuffLinkNormalizer,
    felDevastationNormalizer: FelDevastationNormalizer,
    felDevastationLinkNormalizer: FelDevastationLinkNormalizer,
    sigilOfFlamesNormalizer: SigilOfFlameNormalizer,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    infernalStrike: InfernalStrike,
    metamorphosis: Metamorphosis,
    soulCleave: SoulCleave,
    defensiveBuffs: DefensiveBuffs,
    demonSoulBuff: DemonSoulBuff,

    // Talents
    painbringer: PainbringerBuff,
    frailtyDebuff: FrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBomb: SpiritBomb,
    feedTheDemon: FeedTheDemon,
    burningAlive: BurningAlive,
    feastOfSouls: FeastOfSouls,
    agonizingFlames: AgonizingFlames,
    shatteredRestoration: ShatteredRestoration,
    sigilOfSpite: SigilOfSpite,
    felblade: Felblade,
    charredWarblades: CharredWarblades,
    masterOfTheGlaive: MasterOfTheGlaive,
    darkglareBoon: DarkglareBoon,
    collectiveAnguish: CollectiveAnguish,
    stokeTheFlames: StokeTheFlames,
    swallowedAnger: SwallowedAnger,
    disruptingFury: DisruptingFury,
    fieryBrand: FieryBrand,
    voidReaver: VoidReaver,
    fracture: Fracture,
    soulCarver: SoulCarver,
    felDevastation: FelDevastation,
    fieryBrand2: FieryBrand2,
    sigilOfFlame: SigilOfFlame,

    // Hero
    demonsurge: Demonsurge,
    demonsurgeEventLinkNormalizer: DemonsurgeEventLinkNormalizer,

    // Tier sets
    mid1Vengeance2P: MID1Vengeance2P,
    mid1Vengeance4P: MID1Vengeance4P,
    // Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,
  };

  static guide = Guide;
}

export default CombatLogParser;
