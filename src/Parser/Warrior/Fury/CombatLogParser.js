import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Checklist from './Modules/Features/Checklist/Module';
import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import SpellUsable from './Modules/Features/SpellUsable';

import EnrageUptime from './Modules/BuffDebuff/EnrageUptime';
import FrothingBerserkerUptime from './Modules/BuffDebuff/FrothingBerserkerUptime';
import Juggernaut from './Modules/BuffDebuff/Juggernaut';

import MissedRampage from './Modules/Spells/MissedRampage';
import RampageFrothingBerserker from './Modules/Features/RampageFrothingBerserker';
import RampageCancelled from './Modules/Features/RampageCancelled';
import AngerManagement from './Modules/Talents/AngerManagement';
import FuriousSlashTimesByStacks from './Modules/Talents/FuriousSlashTimesByStacks';
import FuriousSlashUptime from './Modules/Talents/FuriousSlashUptime';

import T21_2set from './Modules/Items/T21_2set';
import T21_4set from './Modules/Items/T21_4set';

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
    //prePotion: PrePotion, TODO: Update this to BFA and ensure it works properly with Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer.js
  };
}

export default CombatLogParser;
