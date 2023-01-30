import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';

import ShatteringStar from './modules/abilities/ShatteringStar';
import Guide from './Guide';
import AplCheck from './modules/AplCheck';
import EssenceTracker from '../preservation/modules/features/EssenceTracker';
import EssenceGraph from './modules/guide/EssenceGraph/EssenceGraph';
import Disintegrate from './modules/abilities/Disintegrate';
import EssenceBurst from './modules/abilities/EssenceBurst';
import Burnout from './modules/abilities/Burnout';
import DragonRage from './modules/abilities/DragonRage';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import Snapfire from './modules/abilities/Snapfire';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,

    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,

    //features
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,

    // abilities & talents
    disintegrate: Disintegrate,
    shatteringStar: ShatteringStar,
    essenceBurst: EssenceBurst,
    burnout: Burnout,
    dragonRage: DragonRage,
    snapfire: Snapfire,

    apls: AplCheck,
  };

  static guide = Guide;
}

export default CombatLogParser;
