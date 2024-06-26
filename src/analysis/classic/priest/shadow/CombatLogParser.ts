// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Spells
import Shadowfiend from './modules/features/Shadowfiend';
import ShadowWordPain from './modules/features/ShadowWordPain';
import VampiricTouch from 'analysis/classic/priest/shadow/modules/features/VampiricTouch';
import DevouringPlague from 'analysis/classic/priest/shadow/modules/features/DevouringPlague';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Spells
    shadowfiend: Shadowfiend,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    devouringPlague: DevouringPlague,
  };
}

export default CombatLogParser;
