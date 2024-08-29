import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  QuickWitted,
  MirrorImage,
  ShiftingPower,
  TempestBarrier,
  MasterOfTime,
  TimeAnomaly,
  SharedCode,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Guide from './Guide';

//Core
import Checklist from './checklist/Module';
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import BrainFreeze from './core/BrainFreeze';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import IceLance from './core/IceLance';
import IcyVeins from './core/IcyVeins';
import FingersOfFrost from './core/FingersOfFrost';
import WintersChill from './core/WintersChill';

//Talents
import ColdSnap from './talents/ColdSnap';
import FrozenOrb from './talents/FrozenOrb';
import Flurry from './talents/Flurry';
import WaterElemental from './talents/WaterElemental';
import ColdFront from './talents/ColdFront';
import IcyPropulsion from './talents/IcyPropulsion';
import BoneChilling from './talents/BoneChilling';
import CometStorm from './talents/CometStorm';
import RayOfFrost from './talents/RayOfFrost';
import GlacialSpike from './talents/GlacialSpike';
import LonelyWinter from './talents/LonelyWinter';
import SplittingIce from './talents/SplittingIce';
import ThermalVoid from './talents/ThermalVoid';
import ChainReaction from 'analysis/retail/mage/frost/talents/ChainReaction';
import Cryopathy from 'analysis/retail/mage/frost/talents/Cryopathy';
import SpellfrostTeachings from 'analysis/retail/mage/frost/talents/SpellfrostTeachings';

//Normalizers
import CometStormLinkNormalizer from './normalizers/CometStormLinkNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import ShiftingPowerFrost from 'analysis/retail/mage/frost/talents/ShiftingPowerFrost';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,
    buffs: Buffs,

    //Normalizers
    cometStormLinkNormalizer: CometStormLinkNormalizer,
    castLinkNormalizer: CastLinkNormalizer,

    //Core
    abilities: Abilities,
    sharedCode: SharedCode,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    wintersChill: WintersChill,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    icyVeins: IcyVeins,
    arcaneIntellect: ArcaneIntellect,
    fingersOfFrost: FingersOfFrost,

    // Talents - Frost
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,
    waterElemental: WaterElemental,
    splittingIce: SplittingIce,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,
    cometStorm: CometStorm,
    rayOfFrost: RayOfFrost,
    icyPropulsion: IcyPropulsion,
    coldFront: ColdFront,
    mirrorImage: MirrorImage,
    flurry: Flurry,
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,
    shiftingPowerFrost: ShiftingPowerFrost,
    chainReaction: ChainReaction,
    cryopathy: Cryopathy,
    spellfrostTeachings: SpellfrostTeachings,

    //Talents - Shared
    elementalBarrier: ElementalBarrier,
    divertedEnergy: DivertedEnergy,
    quickWitted: QuickWitted,
    tempestBarrier: TempestBarrier,
    shiftingPower: ShiftingPower,
    masterOfTime: MasterOfTime,
    timeAnomaly: TimeAnomaly,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
