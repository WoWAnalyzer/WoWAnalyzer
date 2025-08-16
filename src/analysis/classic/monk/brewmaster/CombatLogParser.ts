// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import { Abilities } from './gen';
// Spells
import Jab from '../shared/Jab';
import XuenNormalizer from './modules/normalizers/XuenCastNormalizer';
import AplCheck from './modules/features/AplCheck';
import Guide from './Guide';
import RushingJadeWindLinkNormalizer from '../shared/RushingJadeWindLinkNormalizer';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    aplCheck: AplCheck,
    // Spells
    jab: Jab,

    // Normalizers
    XuenNormalizer,
    RushingJadeWindLinkNormalizer,
  };

  static guide = Guide;
}

export default CombatLogParser;
