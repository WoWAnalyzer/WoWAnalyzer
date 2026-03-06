import {
  ArcaneIntellect,
  CancelledCasts,
  ElementalBarrier,
  QuickWitted,
  MasterOfTime,
  SharedCode,
  IceBlock,
  IceCold,
} from 'analysis/retail/mage/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

//Core
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import Combustion from './core/Combustion';
import HeatingUp from './core/HeatingUp';
import HotStreak from './core/HotStreak';

//Talents
import FeveredIncantation from './talents/FeveredIncantation';
import Hyperthermia from './talents/Hyperthermia';
import FromTheAshes from './talents/FromTheAshes';
import SearingTouch from './talents/SearingTouch';
import Meteor from './talents/Meteor';
import SpontaneousCombustion from './talents/SpontaneousCombustion';

//Hero & Apex Talents
import FlameAndFrost from '../shared/analyzers/FlameAndFrost';
import GloriousIncandescence from '../shared/analyzers/GloriousIncandescense';
import FiredUp from './talents/FiredUp';

//Guide
import Guide from './Guide';
import HotStreakGuide from './guide/HotStreak';
import HeatingUpGuide from './guide/HeatingUp';
import CombustionGuide from './guide/Combustion';
import MeteorGuide from './guide/Meteor';

//Items

//Normalizers
import CombustionNormalizer from './normalizers/Combustion';
import FlamestrikeNormalizer from './normalizers/Flamestrike';
import ScorchNormalizer from './normalizers/Scorch';
import HeatingUpNormalizer from './normalizers/HeatingUp';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    flameStrikeNormalizer: FlamestrikeNormalizer,
    scorchNormalizer: ScorchNormalizer,
    combustionNormalizer: CombustionNormalizer,
    heatingUpNormalizer: HeatingUpNormalizer,

    //Guide
    hotStreakGuide: HotStreakGuide,
    heatingUpGuide: HeatingUpGuide,
    combustionGuide: CombustionGuide,
    meteorGuide: MeteorGuide,

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

    //Talents - Fire
    searingTouch: SearingTouch,
    fromTheAshes: FromTheAshes,
    feveredIncantation: FeveredIncantation,
    hyperthermia: Hyperthermia,
    meteor: Meteor,
    spontaneousCombustion: SpontaneousCombustion,

    //Hero & Apex Talents
    flameAndFrost: FlameAndFrost,
    gloriousIncandescence: GloriousIncandescence,
    firedUp: FiredUp,

    //Items - Fire

    //Talents - Shared
    elementalBarrier: ElementalBarrier,
    quickWitted: QuickWitted,
    masterOfTime: MasterOfTime,

    // Defensives - Shared
    IceBlock: IceBlock,
    iceCold: IceCold,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
