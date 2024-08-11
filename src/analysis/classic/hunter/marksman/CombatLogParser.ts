// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';

// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/features/DotUptimes';

// Spells
import SerpentSting from './modules/spells/SerpentSting';
import Readingess from './modules/spells/Readiness';
import KillShot from '../shared/KillShot';
import GoForTheThroat from '../shared/statistics/GoForTheThroat';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    manaLevelChart: ManaLevelChart,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    dotUptimes: DotUptimes,
    // Spells
    serpentSting: SerpentSting,
    readiness: Readingess,
    killShot: KillShot,
    goForTheThroat: GoForTheThroat,
  };
}

export default CombatLogParser;
