import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  GroundingSurge,
  IreOfTheAscended,
  MirrorImage,
  MirrorsOfTorment,
  RuneOfPower,
  RuneOfPowerNormalizer,
  ShiftingPower,
  SiphonedMalice,
  TempestBarrier,
  StandardChecks,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './modules/Checklist/Module';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CombustionActiveTime from './modules/features/CombustionActiveTime';
import CombustionCasts from './modules/features/CombustionCasts';
import CombustionCharges from './modules/features/CombustionCharges';
import CombustionPreCastDelay from './modules/features/CombustionPreCastDelay';
import CombustionSpellUsage from './modules/features/CombustionSpellUsage';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import HeatingUp from './modules/features/HeatingUp';
import HotStreak from './modules/features/HotStreak';
import MirrorsOfTormentUsage from './modules/features/MirrorsOfTormentUsage';
import PhoenixFlames from './modules/features/PhoenixFlames';
import Pyroclasm from './modules/features/Pyroclasm';
import ShiftingPowerUsage from './modules/features/ShiftingPowerUsage';
import DisciplinaryCommand from './modules/items/DisciplinaryCommand';
import FeveredIncantation from './modules/items/FeveredIncantation';
import Firestorm from './modules/items/Firestorm';
import InfernalCascade from './modules/items/InfernalCascade';
import SunKingsBlessing from './modules/items/SunKingsBlessing';
import FromTheAshes from './modules/talents/FromTheAshes';
import Kindling from './modules/talents/Kindling';
import Meteor from './modules/talents/Meteor';
import MeteorCombustion from './modules/talents/MeteorCombustion';
import MeteorRune from './modules/talents/MeteorRune';
import SearingTouch from './modules/talents/SearingTouch';
import CombustionNormalizer from './normalizers/Combustion';
import FlamestrikeNormalizer from './normalizers/Flamestrike';
import PyroclasmBuffNormalizer from './normalizers/PyroclasmBuff';
import ScorchNormalizer from './normalizers/Scorch';
import SunKingsBlessingNormalizer from './normalizers/SunKingsBlessingBuffs';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    flameStrikeNormalizer: FlamestrikeNormalizer,
    scorchNormalizer: ScorchNormalizer,
    pyroclasmBuffNormalizer: PyroclasmBuffNormalizer,
    combustionNormalizer: CombustionNormalizer,
    runeOfPowerNormalizer: RuneOfPowerNormalizer,
    sunKingsBlessingNormalizer: SunKingsBlessingNormalizer,

    //Checklist
    checklist: Checklist,
    buffs: Buffs,
    standardChecks: StandardChecks,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    hotStreak: HotStreak,
    combustionCasts: CombustionCasts,
    combustionCharges: CombustionCharges,
    combustionSpellUsage: CombustionSpellUsage,
    combustionActiveTime: CombustionActiveTime,
    combustionPreCastDelay: CombustionPreCastDelay,
    phoenixFlames: PhoenixFlames,
    heatingUp: HeatingUp,
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,

    // Talents
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: [RuneOfPower, { showStatistic: false, showSuggestion: false }] as const,
    kindling: Kindling,
    meteor: Meteor,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    fromTheAshes: FromTheAshes,

    //Legendaries
    feveredIncantation: FeveredIncantation,
    firestorm: Firestorm,
    disciplinaryCommand: DisciplinaryCommand,
    sunKingsBlessing: SunKingsBlessing,

    //Covenants
    shiftingPower: ShiftingPower,
    shiftingPowerUsage: ShiftingPowerUsage,
    mirrorsOfTorment: MirrorsOfTorment,
    mirrorsOfTormentUsage: MirrorsOfTormentUsage,

    //Conduits
    infernalCascade: InfernalCascade,
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
