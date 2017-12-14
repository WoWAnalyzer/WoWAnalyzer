import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import EnrageUptime from './Modules/BuffDebuff/EnrageUptime';
import FrothingBerserkerUptime from './Modules/BuffDebuff/FrothingBerserkerUptime';
import JuggernautReset from './Modules/BuffDebuff/JuggernautReset';

import PrePotion from './Modules/Items/PrePotion';

class CombatLogParser extends CoreCombatLogParser {

  static specModules = {

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,

    damageDone: [DamageDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],

    enrageUptime: EnrageUptime,
    frothingBerserkerUptime: FrothingBerserkerUptime,
    juggernautReset: JuggernautReset,

    // Overrides default PrePotion
    prePotion: PrePotion,
  };
}

export default CombatLogParser;