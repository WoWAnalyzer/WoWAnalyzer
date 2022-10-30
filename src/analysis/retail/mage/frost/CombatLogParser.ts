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

//Core
import Checklist from './checklist/Module';
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import AplCheck from './core/apl';
import BrainFreeze from './core/BrainFreeze';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import IceLance from './core/IceLance';
import IcyVeins from './core/IcyVeins';
import MunchedProcs from './core/MunchedProcs';
import WintersChill from './core/WintersChill';

//Talents
import ColdSnap from './talents/ColdSnap';
import FrozenOrb from './talents/FrozenOrb';
import WaterElemental from './talents/WaterElemental';
import ColdFront from './talents/ColdFront';
import IcyPropulsion from './talents/IcyPropulsion';
import BoneChilling from './talents/BoneChilling';
import CometStorm from './talents/CometStorm';
import GlacialSpike from './talents/GlacialSpike';
import LonelyWinter from './talents/LonelyWinter';
import SplittingIce from './talents/SplittingIce';
import ThermalVoid from './talents/ThermalVoid';

//Normalizers
import CometStormLinkNormalizer from './normalizers/CometStormLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,
    buffs: Buffs,

    //Normalizers
    cometStormLinkNormalizer: CometStormLinkNormalizer,

    //Core
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    icyVeins: IcyVeins,
    arcaneIntellect: ArcaneIntellect,
    munchedProcs: MunchedProcs,

    // Talents
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,
    runeOfPower: RuneOfPower,
    elementalBarrier: ElementalBarrier,
    waterElemental: WaterElemental,
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
    mirrorImage: MirrorImage,
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    apl: AplCheck,
  };
}

export default CombatLogParser;
