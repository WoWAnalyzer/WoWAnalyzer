import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';

import ShatteringStar from './modules/abilities/ShatteringStar';
import Buffs from './modules/Buffs';
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
import T30DevaTier4P from './modules/dragonflight/tier/T30DevaTier4P';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CancelledCasts from './modules/features/CancelledCasts';
import Catalyze from './modules/talents/Catalyze';
import Scintilation from './modules/talents/Scintilation';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,

    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,

    // features
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,
    apls: AplCheck,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    catalyze: Catalyze,
    scintilation: Scintilation,

    // abilities & talents
    disintegrate: Disintegrate,
    shatteringStar: ShatteringStar,
    essenceBurst: EssenceBurst,
    burnout: Burnout,
    dragonRage: DragonRage,
    snapfire: Snapfire,

    // tier
    T30devaTier4P: T30DevaTier4P,
  };

  static guide = Guide;
}

export default CombatLogParser;
