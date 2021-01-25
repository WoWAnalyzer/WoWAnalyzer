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

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/checklist/Module';
import Buffs from './modules/features/Buffs';

//Normalizers

//Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WintersChill from './modules/features/WintersChill';
import BrainFreeze from './modules/features/BrainFreeze';
import IceLance from './modules/features/IceLance';
import IcyVeins from './modules/features/IcyVeins';
import FrozenOrb from './modules/cooldowns/FrozenOrb';
import ColdSnap from './modules/cooldowns/ColdSnap';

//Talents
import WaterElemental from './modules/features/WaterElemental';
import LonelyWinter from './modules/talents/LonelyWinter';
import SplittingIce from './modules/talents/SplittingIce';
import ThermalVoid from './modules/talents/ThermalVoid';
import GlacialSpike from './modules/talents/GlacialSpike';
import BoneChilling from './modules/talents/BoneChilling';

//Legendaries
import ColdFront from './modules/items/ColdFront';
import GlacialFragments from './modules/items/GlacialFragments';

//Conduits
import IceBite from './modules/items/IceBite';
import IcyPropulsion from './modules/items/IcyPropulsion';
import ShiveringCore from './modules/items/ShiveringCore';
import UnrelentingCold from './modules/items/UnrelentingCold';

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
