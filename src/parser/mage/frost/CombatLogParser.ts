import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/checklist/Module';
import Buffs from './modules/features/Buffs';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WintersChill from './modules/features/WintersChill';
import WintersChillNoIL from './modules/features/WintersChillNoIL';
import BrainFreeze from './modules/features/BrainFreeze';
import BrainFreezeNoIL from './modules/features/BrainFreezeNoIL';
import IceLance from './modules/features/IceLance';
import IceLanceNoIL from './modules/features/IceLanceNoIL';
import ThermalVoid from './modules/features/ThermalVoid';
import GlacialSpike from './modules/features/GlacialSpike';
import GlacialSpikeNoIL from './modules/features/GlacialSpikeNoIL';
import BoneChilling from './modules/talents/BoneChilling';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import SplittingIce from './modules/features/SplittingIce';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import GlacialAssault from './modules/traits/GlacialAssault';
import Whiteout from './modules/traits/Whiteout';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import ColdSnap from './modules/cooldowns/ColdSnap';
import WaterElemental from './modules/features/WaterElemental';
import LonelyWinter from './modules/talents/LonelyWinter';

class CombatLogParser extends CoreCombatLogParser {
   static specModules = {
    checklist: Checklist,
    buffs: Buffs,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    arcaneIntellect: ArcaneIntellect,
    waterElemental: WaterElemental,

    //No Ice Lance Build
    iceLanceNoIL: IceLanceNoIL,
    glacialSpikeNoIL: GlacialSpikeNoIL,
    brainFreezeNoIL: BrainFreezeNoIL,
    wintersChillNoIL: WintersChillNoIL,

    // region Talents (T30 and T75 don't need analyzers)
    // T15 TODO - Ice Nova, Lonely Winter
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,

    // T45 TODO - Incanters Flow
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,

    // T60 TODO - Frozen Touch, Chain Reaction, Ebonbolt

    // T90 TODO - Freezing Rain, Comet Storm
    splittingIce: SplittingIce,

    // T100 TODO - Ray of Frost
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,
    // endregion

    // Traits
    glacialAssault: GlacialAssault,
    whiteout: Whiteout,

	  // Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
