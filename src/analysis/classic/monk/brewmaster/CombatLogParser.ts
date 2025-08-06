// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import { Abilities } from './gen';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
// Spells
import Jab from '../shared/Jab';
import XuenNormalizer from './modules/normalizers/XuenCastNormalizer';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    jab: Jab,

    // Normalizers
    XuenNormalizer,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
