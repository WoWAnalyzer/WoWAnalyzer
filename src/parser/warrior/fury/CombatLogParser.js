import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import Checklist from './modules/features/checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';

import EnrageUptime from './modules/buffdebuff/EnrageUptime';
import FrothingBerserkerUptime from './modules/buffdebuff/FrothingBerserkerUptime';
import Juggernaut from './modules/buffdebuff/Juggernaut';

import MissedRampage from './modules/spells/MissedRampage';
import RampageFrothingBerserker from './modules/features/RampageFrothingBerserker';
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

    enrageUptime: EnrageUptime,
    frothingBerserkerUptime: FrothingBerserkerUptime,
    juggernaut: Juggernaut,

    missedRampage: MissedRampage,
    rampageFrothingBerserker: RampageFrothingBerserker,
    rampageCancelled: RampageCancelled,
    angerManagement: AngerManagement,
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
    furiousSlashUptime: FuriousSlashUptime,

    // Overrides default PrePotion
    //prePotion: PrePotion, TODO: Update this to BFA and ensure it works properly with parser/core/Modules/Features/Checklist2/PreparationRuleAnalyzer.js
  };
}

export default CombatLogParser;
