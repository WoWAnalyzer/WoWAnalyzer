import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import DeathRecapTracker from 'Main/DeathRecapTracker';
import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import Shield_Block from './Modules/Spells/ShieldBlock';

import AngerManagement from './Modules/Talents/AngerManagement';

import T21_2pc from './Modules/Items/T21_2pc';
import ThundergodsVigor from './Modules/Items/ThundergodsVigor';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    shield_block: Shield_Block,
    deathRecapTracker: DeathRecapTracker,
    //Talents
    angerManagement: AngerManagement,
    //Items
    t21: T21_2pc,
    thunderlordsVigor: ThundergodsVigor,
  };
}

export default CombatLogParser;
