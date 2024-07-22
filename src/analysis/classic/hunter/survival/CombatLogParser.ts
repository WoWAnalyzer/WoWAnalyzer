// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';

import Haste from './modules/features/Haste';

// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/features/DotUptimes';

// Spells
import SerpentSting from './modules/spells/SerpentSting';
import KillShot from '../shared/KillShot';
import GoForTheThroat from '../shared/statistics/GoForTheThroat';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
import KillShotNormalizer from '../shared/KillShotNormalizer';
import LockAndLoad from './modules/spells/LockAndLoad';
import ExplosiveShot from './modules/spells/ExplosiveShot';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    haste: Haste,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    dotUptimes: DotUptimes,
    // Spells
    LockAndLoad,
    ExplosiveShot,
    serpentSting: SerpentSting,
    killShot: KillShot,
    killShotNormalizer: KillShotNormalizer,
    goForTheThroat: GoForTheThroat,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
