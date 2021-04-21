import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import { ElysianDecree, SinfulBrand, TheHunt, FelDefender } from '@wowanalyzer/demonhunter';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FuryDetails from './modules/resourcetracker/FuryDetails';
import FuryTracker from './modules/resourcetracker/FuryTracker';
import GrowingInferno from './modules/shadowlands/conduits/GrowingInferno';
import ChaosTheory from './modules/shadowlands/legendaries/ChaosTheory';
import CollectiveAnguish from './modules/shadowlands/legendaries/CollectiveAnguish';
import BladeDance from './modules/spells/BladeDance';
import DemonBite from './modules/spells/DemonBite';
import MetaBuffUptime from './modules/spells/MetaBuffUptime';
import BlindFury from './modules/talents/BlindFury';
import CycleOfHatred from './modules/talents/CycleOfHatred';
import DemonBlades from './modules/talents/DemonBlades';
import Demonic from './modules/talents/Demonic';
import DemonicAppetite from './modules/talents/DemonicAppetite';
import EssenceBreak from './modules/talents/EssenceBreak';
import FelBarrage from './modules/talents/FelBarrage';
import Felblade from './modules/talents/Felblade';
import FelEruption from './modules/talents/FelEruption';
import GlaiveTempest from './modules/talents/GlaiveTempest';
import ImmolationAura from './modules/talents/ImmolationAura';
import MasterOfTheGlaives from './modules/talents/MasterOfTheGlaives';
import Momentum from './modules/talents/Momentum';
import Netherwalk from './modules/talents/Netherwalk';
import TrailofRuin from './modules/talents/TrailofRuin';
import EyeBeamNormalizer from 'analysis/demonhunterhavoc/src/normalizers/EyeBeam';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    globalCooldown: GlobalCooldown,

    //Normalizer
    eyeBeamNormalizer: EyeBeamNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Spells
    demonBite: DemonBite,
    metaBuffUptime: MetaBuffUptime,
    bladeDance: BladeDance,

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

    //Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    //Legendaries
    collectiveAnguish: CollectiveAnguish,
    chaosTheory: ChaosTheory,

    //Covenants
    sinfulBrand: SinfulBrand,
    theHunt: TheHunt,
    elysianDecree: ElysianDecree,

    //Conduits
    growingInferno: GrowingInferno,
    felDefender: FelDefender,
  };
}

export default CombatLogParser;
