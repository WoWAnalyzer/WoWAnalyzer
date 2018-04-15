import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import SpellUsable from './Modules/Features/SpellUsable';

import EnrageUptime from './Modules/BuffDebuff/EnrageUptime';
import FrothingBerserkerUptime from './Modules/BuffDebuff/FrothingBerserkerUptime';
import Juggernaut from './Modules/BuffDebuff/Juggernaut';

import RampageFrothingBerserker from './Modules/Features/RampageFrothingBerserker';
import RampageCancelled from './Modules/Features/RampageCancelled';

import PrePotion from './Modules/Items/PrePotion';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, {showStatistic: true}],

    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    enrageUptime: EnrageUptime,
    frothingBerserkerUptime: FrothingBerserkerUptime,
    juggernaut: Juggernaut,

    rampageFrothingBerserker: RampageFrothingBerserker,
    rampageCancelled: RampageCancelled,

    // Overrides default PrePotion
    prePotion: PrePotion,
  };
}

export default CombatLogParser;
