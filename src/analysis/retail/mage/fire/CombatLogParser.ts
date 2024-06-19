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

//Checklist
import Checklist from './Checklist/Module';

//Core
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import Combustion from './core/Combustion';
import CombustionActiveTime from './core/CombustionActiveTime';
import HeatingUp from './core/HeatingUp';
import HotStreak from './core/HotStreak';

//Talents
import PhoenixFlames from './talents/PhoenixFlames';
import ShiftingPowerUsage from './talents/ShiftingPowerUsage';
import FeveredIncantation from './talents/FeveredIncantation';
import Hyperthermia from './talents/Hyperthermia';
import FeelTheBurn from './talents/FeelTheBurn';
import SunKingsBlessing from './talents/SunKingsBlessing';
import FromTheAshes from './talents/FromTheAshes';
import Kindling from './talents/Kindling';
import MeteorCombustion from './talents/MeteorCombustion';
import SearingTouch from './talents/SearingTouch';
import Meteor from './talents/Meteor';
import ImprovedScorch from './talents/ImprovedScorch';

//Hero Talents
import ExcessFire from '../shared/ExcessFire';
import ExcessFrost from '../shared/ExcessFrost';
import FlameAndFrost from '../shared/FlameAndFrost';
import GloriousIncandescence from '../shared/GloriousIncandescense';

//Items

//Normalizers
import CombustionNormalizer from './normalizers/Combustion';
import FlamestrikeNormalizer from './normalizers/Flamestrike';
import ScorchNormalizer from './normalizers/Scorch';
import SunKingsBlessingNormalizer from './normalizers/SunKingsBlessingBuffs';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import Guide from './Guide';
import HotStreakGuide from './guide/HotStreak';
import HeatingUpGuide from './guide/HeatingUp';
import CombustionGuide from './guide/Combustion';
import SunKingsBlessingGuide from './guide/SunKingsBlessing';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    flameStrikeNormalizer: FlamestrikeNormalizer,
    scorchNormalizer: ScorchNormalizer,
    combustionNormalizer: CombustionNormalizer,
    sunKingsBlessingNormalizer: SunKingsBlessingNormalizer,

    //Checklist
    checklist: Checklist,

    //Guide
    hotStreakGuide: HotStreakGuide,
    heatingUpGuide: HeatingUpGuide,
    combustionGuide: CombustionGuide,
    sunKingsBlessingGuide: SunKingsBlessingGuide,

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
    combustion: Combustion,
    combustionActiveTime: CombustionActiveTime,

    //Talents - Fire
    phoenixFlames: PhoenixFlames,
    kindling: Kindling,
    meteorCombustion: MeteorCombustion,
    searingTouch: SearingTouch,
    fromTheAshes: FromTheAshes,
    feveredIncantation: FeveredIncantation,
    hyperthermia: Hyperthermia,
    sunKingsBlessing: SunKingsBlessing,
    shiftingPowerUsage: ShiftingPowerUsage,
    feelTheBurn: FeelTheBurn,
    meteor: Meteor,
    improvedScorch: ImprovedScorch,

    //Hero Talents
    excessFire: ExcessFire,
    excessFrost: ExcessFrost,
    flameAndFrost: FlameAndFrost,
    gloriousIncandescence: GloriousIncandescence,

    //Items - Fire

    //Talents - Shared
    mirrorImage: MirrorImage,
    elementalBarrier: ElementalBarrier,
    shiftingPower: ShiftingPower,
    divertedEnergy: DivertedEnergy,
    quickWitted: QuickWitted,
    tempestBarrier: TempestBarrier,
    masterOfTime: MasterOfTime,
    timeAnomaly: TimeAnomaly,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
