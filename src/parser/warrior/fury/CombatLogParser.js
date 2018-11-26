import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';

import Checklist from './modules/features/checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';

<<<<<<< HEAD
import EnrageUptime from './modules/buffdebuff/EnrageUptime';
<<<<<<< HEAD
<<<<<<< HEAD
import FrothingBerserkerUptime from './modules/buffdebuff/FrothingBerserkerUptime';
<<<<<<< HEAD
import Juggernaut from './modules/buffdebuff/Juggernaut';
=======
=======
import Enrage from './modules/buffdebuff/Enrage';
>>>>>>> 26badb935... Rewrite Enrage, add stats

import FrothingBerserker from './modules/talents/FrothingBerserker';
>>>>>>> d191d036c... Capitalization
=======
>>>>>>> 4a1ce2837... Juggernaut no longer exists
=======

import frothingBerserker from './modules/talents/FrothingBerserker';
>>>>>>> 544362a5e... complete Frothing rework

import MissedRampage from './modules/spells/MissedRampage';
import RampageCancelled from './modules/features/RampageCancelled';
import AngerManagement from './modules/talents/AngerManagement';
import FuriousSlashTimesByStacks from './modules/talents/FuriousSlashTimesByStacks';
import FuriousSlashUptime from './modules/talents/FuriousSlashUptime';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, {showStatistic: true}],

    checklist: Checklist,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

<<<<<<< HEAD
    enrageUptime: EnrageUptime,
<<<<<<< HEAD
<<<<<<< HEAD
    frothingBerserkerUptime: FrothingBerserkerUptime,
<<<<<<< HEAD
    juggernaut: Juggernaut,
=======
=======
    enrageUptime: Enrage,
>>>>>>> 26badb935... Rewrite Enrage, add stats
    //frothingBerserkerUptime: FrothingBerserkerUptime,

    frothingBerserker: FrothingBerserker,
>>>>>>> d191d036c... Capitalization
=======
>>>>>>> 4a1ce2837... Juggernaut no longer exists
=======
    //frothingBerserkerUptime: FrothingBerserkerUptime,

    frothingBerserker: frothingBerserker,
>>>>>>> 544362a5e... complete Frothing rework

    missedRampage: MissedRampage,
    rampageCancelled: RampageCancelled,
    angerManagement: AngerManagement,
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
    furiousSlashUptime: FuriousSlashUptime,

    // Overrides default PrePotion
    //prePotion: PrePotion, TODO: Update this to BFA and ensure it works properly with parser/core/Modules/Features/Checklist2/PreparationRuleAnalyzer.js
  };
}

export default CombatLogParser;
