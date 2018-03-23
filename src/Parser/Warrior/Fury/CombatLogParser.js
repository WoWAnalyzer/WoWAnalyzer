import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import EnrageUptime from './Modules/BuffDebuff/EnrageUptime';
import FrothingBerserkerUptime from './Modules/BuffDebuff/FrothingBerserkerUptime';
import Juggernaut from './Modules/BuffDebuff/Juggernaut';

import RampageFrothingBerserker from './Modules/Features/RampageFrothingBerserker';
import RampageCancelled from './Modules/Features/RampageCancelled';

import T21_2set from './Modules/Items/T21_2set';
import T21_4set from './Modules/Items/T21_4set';

import PrePotion from './Modules/Items/PrePotion';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, {showStatistic: true}],

    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,

    enrageUptime: EnrageUptime,
    frothingBerserkerUptime: FrothingBerserkerUptime,
    juggernaut: Juggernaut,

    rampageFrothingBerserker: RampageFrothingBerserker,
    rampageCancelled: RampageCancelled,

    t21_2set: T21_2set,
    t21_4set: T21_4set,

    // Overrides default PrePotion
    prePotion: PrePotion,
  };
}

export default CombatLogParser;
