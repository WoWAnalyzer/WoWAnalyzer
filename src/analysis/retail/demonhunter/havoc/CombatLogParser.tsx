import { TheHunt } from 'analysis/retail/demonhunter/shared';
import Felblade from 'analysis/retail/demonhunter/shared/modules/talents/Felblade';
import ShatteredRestoration from 'analysis/retail/demonhunter/shared/modules/talents/ShatteredRestoration';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FuryDetails from './modules/resourcetracker/FuryDetails';
import FuryTracker from './modules/resourcetracker/FuryTracker';
import BladeDance from './modules/spells/BladeDance';
import DemonBite from './modules/spells/DemonBite';
import FuriousGazeBuffUptime from './modules/spells/FuriousGazeBuffUptime';
import MetaBuffUptime from './modules/spells/MetaBuffUptime';
import BlindFury from './modules/talents/BlindFury';
import ChaosTheory from './modules/talents/ChaosTheory';
import CycleOfHatred from './modules/talents/CycleOfHatred';
import DemonBlades from './modules/talents/DemonBlades';
import Demonic from './modules/talents/Demonic';
import DemonicAppetite from './modules/talents/DemonicAppetite';
import ElysianDecree from './modules/talents/ElysianDecree';
import EssenceBreak from './modules/talents/EssenceBreak';
import FelBarrage from './modules/talents/FelBarrage';
import FelEruption from './modules/talents/FelEruption';
import GlaiveTempest from './modules/talents/GlaiveTempest';
import ImmolationAura from './modules/talents/ImmolationAura';
import MasterOfTheGlaives from './modules/talents/MasterOfTheGlaives';
import Momentum from './modules/talents/Momentum';
import Netherwalk from './modules/talents/Netherwalk';
import TrailofRuin from './modules/talents/TrailofRuin';
import TacticalRetreat from './modules/talents/TacticalRetreat';
import Initiative from './modules/talents/Initiative';
import EyeBeam from './normalizers/EyeBeam';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    globalCooldown: GlobalCooldown,

    //Normalizer
    eyeBeamNormalizer: EyeBeam,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Spells
    demonBite: DemonBite,
    metaBuffUptime: MetaBuffUptime,
    bladeDance: BladeDance,
    furiousGazeBuffUptime: FuriousGazeBuffUptime,

    //Talents
    felblade: Felblade,
    demonicAppetite: DemonicAppetite,
    blindFury: BlindFury,
    demonBlades: DemonBlades,
    immolationAura: ImmolationAura,
    trailofRuin: TrailofRuin,
    felBarrage: FelBarrage,
    momentum: Momentum,
    netherwalk: Netherwalk,
    felEruption: FelEruption,
    masterOfTheGlaives: MasterOfTheGlaives,
    essenceBreak: EssenceBreak,
    cycleOfHatred: CycleOfHatred,
    demonic: Demonic,
    glaiveTempest: GlaiveTempest,
    theHunt: TheHunt,
    chaosTheory: ChaosTheory,
    shatteredRestoration: ShatteredRestoration,
    elysianDecree: ElysianDecree,
    tacticalRetreat: TacticalRetreat,
    initiative: Initiative,

    // Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
