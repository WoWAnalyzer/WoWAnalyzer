import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import Checklist from './modules/Features/Checklist/Module';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/Features/CooldownThroughputTracker';
import SpellUsable from './modules/Features/SpellUsable';

import EnrageUptime from './modules/BuffDebuff/EnrageUptime';
import FrothingBerserkerUptime from './modules/BuffDebuff/FrothingBerserkerUptime';
import Juggernaut from './modules/BuffDebuff/Juggernaut';

import MissedRampage from './modules/Spells/MissedRampage';
import RampageFrothingBerserker from './modules/Features/RampageFrothingBerserker';
import RampageCancelled from './modules/Features/RampageCancelled';
import AngerManagement from './modules/Talents/AngerManagement';
import FuriousSlashTimesByStacks from './modules/Talents/FuriousSlashTimesByStacks';
import FuriousSlashUptime from './modules/Talents/FuriousSlashUptime';

import T21_2set from './modules/Items/T21_2set';
import T21_4set from './modules/Items/T21_4set';

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

    t21_2set: T21_2set,
    t21_4set: T21_4set,

    // Overrides default PrePotion
    //prePotion: PrePotion, TODO: Update this to BFA and ensure it works properly with parser/core/Modules/Features/Checklist2/PreparationRuleAnalyzer.js
  };
}

export default CombatLogParser;
