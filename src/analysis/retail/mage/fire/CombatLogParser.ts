import {
  ArcaneIntellect,
  CancelledCasts,
  DivertedEnergy,
  ElementalBarrier,
  GroundingSurge,
  MirrorImage,
  RuneOfPower,
  RuneOfPowerNormalizer,
  ShiftingPower,
  TempestBarrier,
  SharedCode,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Checklist from './Checklist/Module';
import Abilities from './Abilities';
import AlwaysBeCasting from './AlwaysBeCasting';
import Buffs from './Buffs';
import CooldownThroughputTracker from './CooldownThroughputTracker';
import CombustionActiveTime from './core/CombustionActiveTime';
import CombustionCasts from './core/CombustionCasts';
import CombustionCharges from './core/CombustionCharges';
import CombustionPreCastDelay from './core/CombustionPreCastDelay';
import CombustionSpellUsage from './core/CombustionSpellUsage';
import HeatingUp from './core/HeatingUp';
import HotStreak from './core/HotStreak';
import PhoenixFlames from './talents/PhoenixFlames';
import Pyroclasm from './talents/Pyroclasm';
import ShiftingPowerUsage from './talents/ShiftingPowerUsage';
import FeveredIncantation from './talents/FeveredIncantation';
import Firestorm from './talents/Firestorm';
import InfernalCascade from './talents/InfernalCascade';
import SunKingsBlessing from './talents/SunKingsBlessing';
import FromTheAshes from './talents/FromTheAshes';
import Kindling from './talents/Kindling';
import Meteor from './talents/Meteor';
import MeteorCombustion from './talents/MeteorCombustion';
import MeteorRune from './talents/MeteorRune';
import SearingTouch from './talents/SearingTouch';
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
    sharedCode: SharedCode,

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
    sunKingsBlessing: SunKingsBlessing,

    //Covenants
    shiftingPower: ShiftingPower,
    shiftingPowerUsage: ShiftingPowerUsage,

    //Conduits
    infernalCascade: InfernalCascade,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    tempestBarrier: TempestBarrier,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
