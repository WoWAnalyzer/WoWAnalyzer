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
  Meteor,
  MeteorRune,
  MasterOfTime,
  TimeAnomaly,
  SharedCode,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

//Checklist
import Checklist from './Checklist/Module';

//Core
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import CombustionActiveTime from './core/CombustionActiveTime';
import CombustionCasts from './core/CombustionCasts';
import CombustionCharges from './core/CombustionCharges';
import CombustionPreCastDelay from './core/CombustionPreCastDelay';
import CombustionSpellUsage from './core/CombustionSpellUsage';
import HeatingUp from './core/HeatingUp';
import HotStreak from './core/HotStreak';

//Talents
import PhoenixFlames from './talents/PhoenixFlames';
import Pyroclasm from './talents/Pyroclasm';
import ShiftingPowerUsage from './talents/ShiftingPowerUsage';
import FeveredIncantation from './talents/FeveredIncantation';
import Hyperthermia from './talents/Hyperthermia';
import FeelTheBurn from './talents/FeelTheBurn';
import SunKingsBlessing from './talents/SunKingsBlessing';
import FromTheAshes from './talents/FromTheAshes';
import Kindling from './talents/Kindling';
import MeteorCombustion from './talents/MeteorCombustion';
import SearingTouch from './talents/SearingTouch';

//Normalizers
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

    //Core
    buffs: Buffs,
    sharedCode: SharedCode,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    arcaneIntellect: ArcaneIntellect,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    combustionCasts: CombustionCasts,
    combustionCharges: CombustionCharges,
    combustionSpellUsage: CombustionSpellUsage,
    combustionActiveTime: CombustionActiveTime,
    combustionPreCastDelay: CombustionPreCastDelay,

    //Talents - Fire
    phoenixFlames: PhoenixFlames,
    kindling: Kindling,
    meteorCombustion: MeteorCombustion,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    fromTheAshes: FromTheAshes,
    feveredIncantation: FeveredIncantation,
    hyperthermia: Hyperthermia,
    sunKingsBlessing: SunKingsBlessing,
    shiftingPowerUsage: ShiftingPowerUsage,
    feelTheBurn: FeelTheBurn,

    //Talents - Shared
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,
    runeOfPower: [RuneOfPower, { showStatistic: false, showSuggestion: false }] as const,
    shiftingPower: ShiftingPower,
    divertedEnergy: DivertedEnergy,
    groundingSurge: GroundingSurge,
    tempestBarrier: TempestBarrier,
    meteor: Meteor,
    meteorRune: MeteorRune,
    masterOfTime: MasterOfTime,
    timeAnomaly: TimeAnomaly,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
