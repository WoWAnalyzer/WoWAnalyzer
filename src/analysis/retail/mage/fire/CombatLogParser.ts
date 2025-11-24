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
import FeelTheBurn from './talents/FeelTheBurn';
import FromTheAshes from './talents/FromTheAshes';
import Kindling from './talents/Kindling';
import MeteorCombustion from './talents/MeteorCombustion';
import SearingTouch from './talents/SearingTouch';
import Meteor from './talents/Meteor';

//Hero Talents
import FlameAndFrost from '../shared/analyzers/FlameAndFrost';
import GloriousIncandescence from '../shared/analyzers/GloriousIncandescense';

//Guide
import Guide from './Guide';
import HotStreakGuide from './guide/HotStreak';
import HeatingUpGuide from './guide/HeatingUp';
import CombustionGuide from './guide/Combustion';
import FeelTheBurnGuide from './guide/FeelTheBurn';

//Items

//Normalizers
import CombustionNormalizer from './normalizers/Combustion';
import FlamestrikeNormalizer from './normalizers/Flamestrike';
import ScorchNormalizer from './normalizers/Scorch';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    flameStrikeNormalizer: FlamestrikeNormalizer,
    scorchNormalizer: ScorchNormalizer,
    combustionNormalizer: CombustionNormalizer,

    //Guide
    hotStreakGuide: HotStreakGuide,
    heatingUpGuide: HeatingUpGuide,
    combustionGuide: CombustionGuide,
    feelTheBurnGuide: FeelTheBurnGuide,

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
    kindling: Kindling,
    meteorCombustion: MeteorCombustion,
    searingTouch: SearingTouch,
    fromTheAshes: FromTheAshes,
    feveredIncantation: FeveredIncantation,
    hyperthermia: Hyperthermia,
    feelTheBurn: FeelTheBurn,
    meteor: Meteor,

    //Hero Talents
    flameAndFrost: FlameAndFrost,
    gloriousIncandescence: GloriousIncandescence,

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
