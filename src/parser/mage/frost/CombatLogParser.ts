import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/checklist/Module';
import Buffs from './modules/features/Buffs';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WintersChill from './modules/features/WintersChill';
import BrainFreeze from './modules/features/BrainFreeze';
import IceLance from './modules/features/IceLance';
import ThermalVoid from './modules/talents/ThermalVoid';
import GlacialSpike from './modules/talents/GlacialSpike';
import BoneChilling from './modules/talents/BoneChilling';
import RuneOfPower from '../shared/modules/features/RuneOfPower';
import MirrorImage from '../shared/modules/features/MirrorImage';
import ArcaneIntellect from '../shared/modules/features/ArcaneIntellect';
import SplittingIce from './modules/talents/SplittingIce';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import ColdSnap from './modules/cooldowns/ColdSnap';
import WaterElemental from './modules/features/WaterElemental';
import LonelyWinter from './modules/talents/LonelyWinter';
import FreezingWinds from './modules/items/FreezingWinds';
import ColdFront from './modules/items/ColdFront';

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

    // Talents
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,
    splittingIce: SplittingIce,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,

	  // Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    //Legendaries
    freezingWinds: FreezingWinds,
    coldFront: ColdFront,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
