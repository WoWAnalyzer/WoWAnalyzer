import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  GroundingSurge,
  MirrorImage,
  RuneOfPower,
  ShiftingPower,
  TempestBarrier,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/checklist/Module';
import ColdSnap from './modules/cooldowns/ColdSnap';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AplCheck from './modules/features/apl';
import BrainFreeze from './modules/features/BrainFreeze';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import IceLance from './modules/features/IceLance';
import IcyVeins from './modules/features/IcyVeins';
import MunchedProcs from './modules/features/MunchedProcs';
import WaterElemental from './modules/features/WaterElemental';
import WintersChill from './modules/features/WintersChill';
import ColdFront from './modules/talents/ColdFront';
import IcyPropulsion from './modules/talents/IcyPropulsion';
import BoneChilling from './modules/talents/BoneChilling';
import CometStorm from './modules/talents/CometStorm';
import GlacialSpike from './modules/talents/GlacialSpike';
import LonelyWinter from './modules/talents/LonelyWinter';
import SplittingIce from './modules/talents/SplittingIce';
import ThermalVoid from './modules/talents/ThermalVoid';
import CometStormLinkNormalizer from './normalizers/CometStormLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,
    buffs: Buffs,

    //Normalizers
    cometStormLinkNormalizer: CometStormLinkNormalizer,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    icyVeins: IcyVeins,
    arcaneIntellect: ArcaneIntellect,
    mirrorImage: MirrorImage,
    munchedProcs: MunchedProcs,
    elementalBarrier: ElementalBarrier,
    waterElemental: WaterElemental,

    // Talents
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,
    runeOfPower: RuneOfPower,
    splittingIce: SplittingIce,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,
    cometStorm: CometStorm,
    icyPropulsion: IcyPropulsion,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    tempestBarrier: TempestBarrier,
    shiftingPower: ShiftingPower,
    coldFront: ColdFront,

    // Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    apl: AplCheck,
  };
}

export default CombatLogParser;
