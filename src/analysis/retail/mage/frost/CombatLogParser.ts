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
import Guide from './Guide';

//Core
import Abilities from './core/Abilities';
import AlwaysBeCasting from './core/AlwaysBeCasting';
import BrainFreeze from './core/BrainFreeze';
import Buffs from './core/Buffs';
import CooldownThroughputTracker from './core/CooldownThroughputTracker';
import IceLance from './core/IceLance';
import FingersOfFrost from './core/FingersOfFrost';

//Talents
import ColdSnap from './talents/ColdSnap';
import Flurry from './talents/Flurry';
import WaterElemental from './talents/WaterElemental';
import CometStorm from './talents/CometStorm';
import RayOfFrost from './talents/RayOfFrost';
import SplittingIce from './talents/SplittingIce';
import SpellfrostTeachings from 'analysis/retail/mage/frost/talents/SpellfrostTeachings';

//Normalizers
import CometStormLinkNormalizer from './normalizers/CometStormLinkNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
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
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    arcaneIntellect: ArcaneIntellect,
    fingersOfFrost: FingersOfFrost,

    // Talents - Frost
    waterElemental: WaterElemental,
    splittingIce: SplittingIce,
    cometStorm: CometStorm,
    rayOfFrost: RayOfFrost,
    flurry: Flurry,
    coldSnap: ColdSnap,
    spellfrostTeachings: SpellfrostTeachings,

    //Talents - Shared
    elementalBarrier: ElementalBarrier,
    quickWitted: QuickWitted,
    masterOfTime: MasterOfTime,

    // Defensives - Shared
    iceBlock: IceBlock,
    iceCold: IceCold,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
