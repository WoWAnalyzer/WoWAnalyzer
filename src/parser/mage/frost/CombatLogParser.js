import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/checklist/Module';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WintersChill from './modules/features/WintersChill';
import BrainFreeze from './modules/features/BrainFreeze';
import IceLance from './modules/features/IceLance';
import ThermalVoid from './modules/features/ThermalVoid';
import GlacialSpike from './modules/features/GlacialSpike';
import BoneChilling from './modules/talents/BoneChilling';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import SplittingIce from './modules/features/SplittingIce';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import WintersReach from './modules/traits/WintersReach';
import Whiteout from './modules/traits/Whiteout';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import ColdSnap from './modules/cooldowns/ColdSnap';
import WaterElemental from './modules/features/WaterElemental';
import LonelyWinter from './modules/talents/LonelyWinter';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    damageDone: [DamageDone, { showStatistic: true }],
    arcaneIntellect: ArcaneIntellect,
    waterElemental: WaterElemental,    

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
    wintersReach: WintersReach,
    whiteout: Whiteout,

	  // Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
