// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import { lowRankSpells, TotemTracker } from '../shared';
import {
  AirTotems,
  EarthTotems,
  FireTotems,
  GroundingTotem,
  ManaTideTotem,
  WaterTotems,
} from '../shared/totems';
// Core
import GlobalCooldown from './modules/core/GlobalCooldown';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    totemTracker: TotemTracker,
    airTotems: AirTotems,
    earthTotems: EarthTotems,
    fireTotems: FireTotems,
    groundingTotem: GroundingTotem,
    manaTideTotem: ManaTideTotem,
    waterTotems: WaterTotems,
    // Core
    globalCooldown: GlobalCooldown,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
  };
}

export default CombatLogParser;
