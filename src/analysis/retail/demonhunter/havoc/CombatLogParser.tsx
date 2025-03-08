import {
  CharredWarblades,
  CollectiveAnguish,
  Demonic,
  DemonSoulBuff,
  DisruptingFury,
  Felblade,
  FlamesOfFury,
  ImmolationAura,
  MasterOfTheGlaive,
  ShatteredRestoration,
  SwallowedAnger,
  TheHunt,
  TheHuntNormalizer,
} from 'analysis/retail/demonhunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FuryDetails from './modules/resourcetracker/FuryDetails';
import FuryTracker from './modules/resourcetracker/FuryTracker';
import BladeDance from './modules/spells/BladeDance';
import DemonBite from './modules/spells/DemonBite';
import Blur from './modules/spells/Blur';
import MetaBuffUptime from './modules/spells/MetaBuffUptime';
import BlindFury from './modules/talents/BlindFury';
import FuriousGaze from './modules/talents/FuriousGaze';
import ChaosTheory from './modules/talents/ChaosTheory';
import CycleOfHatred from './modules/talents/CycleOfHatred';
import DemonBlades from './modules/talents/DemonBlades';
import DemonicDeathSweep from './modules/talents/DemonicDeathSweep';
import DemonicAppetite from './modules/talents/DemonicAppetite';
import SigilOfSpite from './modules/talents/SigilOfSpite';
import EssenceBreak from './modules/talents/EssenceBreak';
import FelBarrage from './modules/talents/FelBarrage';
import FelEruption from './modules/talents/FelEruption';
import GlaiveTempest from './modules/talents/GlaiveTempest';
import Momentum from './modules/talents/Momentum';
import Netherwalk from './modules/talents/Netherwalk';
import TrailofRuin from './modules/talents/TrailofRuin';
import TacticalRetreat from './modules/talents/TacticalRetreat';
import Initiative from './modules/talents/Initiative';
import EyeBeamNormalizer from './normalizers/EyeBeamNormalizer';
import Ragefire from './modules/talents/Ragefire';
import InnerDemon from './modules/talents/InnerDemon';
import Soulscar from './modules/talents/Soulscar';
import GrowingInferno from './modules/talents/GrowingInferno';
import BurningHatred from './modules/talents/BurningHatred';
import EssenceBreakNormalizer from './normalizers/EssenceBreakNormalizer';
import FuryGraph from './modules/resourcetracker/FuryGraph';
import Guide from './Guide';
import TheHuntVengefulRetreatNormalizer from './normalizers/TheHuntVengefulRetreatNormalizer';
import FuriousGazeNormalizer from './normalizers/FuriousGazeNormalizer';
import { EyeBeam } from './modules/talents/EyeBeam';
import { ThrowGlaive } from './modules/spells/ThrowGlaive';
import UnboundChaosNormalizer from './normalizers/UnboundChaosNormalizer';
import UnboundChaos from './modules/talents/UnboundChaos';
import ConsumingFireNormalizer from '../shared/normalizers/ConsumingFireNormalizer';
import Demonsurge from '../shared/modules/hero/felscarred/Demonsurge/analyzer';
import DemonsurgeEventLinkNormalizer from '../shared/modules/hero/felscarred/Demonsurge/eventLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    globalCooldown: GlobalCooldown,

    //Normalizer
    eyeBeamNormalizer: EyeBeamNormalizer,
    essenceBreakNormalizer: EssenceBreakNormalizer,
    theHuntNormalizer: TheHuntNormalizer,
    theHuntVengefulRetreatNormalizer: TheHuntVengefulRetreatNormalizer,
    furiousGazeEventLinkNormalizer: FuriousGazeNormalizer,
    unboundChaosNormalizer: UnboundChaosNormalizer,
    consumingFireNormalizer: ConsumingFireNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Spells
    demonBite: DemonBite,
    metaBuffUptime: MetaBuffUptime,
    bladeDance: BladeDance,
    blur: Blur,
    immolationAura: ImmolationAura,
    demonSoulBuff: DemonSoulBuff,
    throwGlaive: ThrowGlaive,

    //Talents
    felblade: Felblade,
    demonicAppetite: DemonicAppetite,
    blindFury: BlindFury,
    demonBlades: DemonBlades,
    trailofRuin: TrailofRuin,
    felBarrage: FelBarrage,
    momentum: Momentum,
    netherwalk: Netherwalk,
    felEruption: FelEruption,
    masterOfTheGlaive: MasterOfTheGlaive,
    essenceBreak: EssenceBreak,
    cycleOfHatred: CycleOfHatred,
    demonicDeathSweep: DemonicDeathSweep,
    glaiveTempest: GlaiveTempest,
    theHunt: TheHunt,
    chaosTheory: ChaosTheory,
    shatteredRestoration: ShatteredRestoration,
    sigilOfSpite: SigilOfSpite,
    tacticalRetreat: TacticalRetreat,
    initiative: Initiative,
    ragefire: Ragefire,
    innerDemon: InnerDemon,
    soulscar: Soulscar,
    furiousGaze: FuriousGaze,
    charredWarblades: CharredWarblades,
    collectiveAnguish: CollectiveAnguish,
    growingInferno: GrowingInferno,
    burningHatred: BurningHatred,
    demonic: Demonic,
    swallowedAnger: SwallowedAnger,
    flamesOfFury: FlamesOfFury,
    disruptingFury: DisruptingFury,
    eyeBeam: EyeBeam,
    unboundChaos: UnboundChaos,

    // Hero
    demonsurge: Demonsurge,
    demonsurgeEventLinkNormalizer: DemonsurgeEventLinkNormalizer,

    // Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
