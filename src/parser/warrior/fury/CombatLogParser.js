import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
// Core
import Enrage from './modules/core/Enrage';
import Rampage from './modules/core/Rampage';
// Features
import Checklist from './modules/features/checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
// Talents
import FrothingBerserker from './modules/talents/FrothingBerserker';
import AngerManagement from './modules/talents/AngerManagement';
import FuriousSlash from './modules/talents/FuriousSlash';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],

    // Core
    enrage: Enrage,
    rampage: Rampage,

    // Features
    checklist: Checklist,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    // Talents
    frothingBerserker: FrothingBerserker,
    angerManagement: AngerManagement,
    furiousSlash: FuriousSlash,

    // Overrides default PrePotion
    //prePotion: PrePotion, TODO: Update this to BFA and ensure it works properly with parser/core/Modules/Features/Checklist2/PreparationRuleAnalyzer.js
  };
}

export default CombatLogParser;
