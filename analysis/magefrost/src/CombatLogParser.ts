import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  FocusMagic,
  GroundingSurge,
  IreOfTheAscended,
  MirrorImage,
  RuneOfPower,
  ShiftingPower,
  SiphonedMalice,
  TempestBarrier,
} from '@wowanalyzer/mage';

import Checklist from './modules/checklist/Module';

//Normalizers

//Features
import ColdSnap from './modules/cooldowns/ColdSnap';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import BrainFreeze from './modules/features/BrainFreeze';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import IceLance from './modules/features/IceLance';
import IcyVeins from './modules/features/IcyVeins';

//Talents
import WaterElemental from './modules/features/WaterElemental';
import WintersChill from './modules/features/WintersChill';

//Legendaries
import ColdFront from './modules/items/ColdFront';
import GlacialFragments from './modules/items/GlacialFragments';

//Conduits
import IceBite from './modules/items/IceBite';
import IcyPropulsion from './modules/items/IcyPropulsion';
import ShiveringCore from './modules/items/ShiveringCore';
import UnrelentingCold from './modules/items/UnrelentingCold';
import BoneChilling from './modules/talents/BoneChilling';
import GlacialSpike from './modules/talents/GlacialSpike';
import LonelyWinter from './modules/talents/LonelyWinter';
import SplittingIce from './modules/talents/SplittingIce';
import ThermalVoid from './modules/talents/ThermalVoid';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    checklist: Checklist,
    buffs: Buffs,

    //Normalizers

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
    elementalBarrier: ElementalBarrier,
    waterElemental: WaterElemental,

    // Talents
    boneChilling: BoneChilling,
    lonelyWinter: LonelyWinter,
    focusMagic: FocusMagic,
    runeOfPower: RuneOfPower,
    splittingIce: SplittingIce,
    thermalVoid: ThermalVoid,
    glacialSpike: GlacialSpike,

    // Cooldowns
    frozenOrb: FrozenOrb,
    coldSnap: ColdSnap,

    //Legendaries
    coldFront: ColdFront,
    glacialFragments: GlacialFragments,

    //Covenants
    shiftingPower: ShiftingPower,

    //Conduits
    iceBite: IceBite,
    icyPropulsion: IcyPropulsion,
    shiveringCore: ShiveringCore,
    unrelentingCold: UnrelentingCold,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    ireOfTheAscended: IreOfTheAscended,
    tempestBarrier: TempestBarrier,
    siphonedMalice: SiphonedMalice,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
