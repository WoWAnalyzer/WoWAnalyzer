import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';

import Checklist from './modules/features/checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';

import Enrage from './modules/buffdebuff/Enrage';

import FrothingBerserker from './modules/talents/FrothingBerserker';

import MissedRampage from './modules/spells/MissedRampage';
import RampageCancelled from './modules/features/RampageCancelled';
import AngerManagement from './modules/talents/AngerManagement';
import FuriousSlashTimesByStacks from './modules/talents/FuriousSlashTimesByStacks';
import FuriousSlashUptime from './modules/talents/FuriousSlashUptime';
import SimmeringRage from './modules/azerite/SimmeringRage';
import EndlessRage from './modules/talents/EndlessRage';
import Recklessness from './modules/spells/Recklessness';
import Siegebreaker from './modules/talents/Siegebreaker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, {showStatistic: true}],

    checklist: Checklist,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    enrageUptime: Enrage,

    frothingBerserker: FrothingBerserker,
    
    missedRampage: MissedRampage,
    rampageCancelled: RampageCancelled,
    angerManagement: AngerManagement,
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
    furiousSlashUptime: FuriousSlashUptime,

    simmeringRage: SimmeringRage,
    endlessRage: EndlessRage,
    recklessness: Recklessness,
    siegebreaker: Siegebreaker,

  };
}

export default CombatLogParser;
