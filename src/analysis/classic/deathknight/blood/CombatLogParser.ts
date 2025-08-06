// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Features
import { Abilities } from './gen';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
// Spells
import ArmyOfTheDead from '../shared/ArmyOfTheDead';
import { GlobalCooldown } from '../shared';
import WillOfTheNecropolis from './modules/spells/WillOfTheNecropolis';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    globalCooldown: GlobalCooldown,
    // Spells
    ArmyOfTheDead,
    WillOfTheNecropolis,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
