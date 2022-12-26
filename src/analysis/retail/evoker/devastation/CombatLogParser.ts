import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';

import ShatteringStar from './modules/talents/ShatteringStar';
import Guide from './Guide';
import AplCheck from './modules/AplCheck';
import EssenceTracker from '../preservation/modules/features/EssenceTracker';
import EssenceGraph from './modules/guide/EssenceGraph';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,

    //features
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,

    // talents
    shatteringStar: ShatteringStar,

    apls: AplCheck,
  };

  static guide = Guide;
}

export default CombatLogParser;
