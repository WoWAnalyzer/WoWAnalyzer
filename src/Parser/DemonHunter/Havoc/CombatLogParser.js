import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import Momentum from './Modules/Spells/Momentum';
import Nemesis from './Modules/Spells/Nemesis';

//Resources
import FuryDetails from './Modules/ResourceTracker/FuryDetails';
import FuryTracker from './Modules/ResourceTracker/FuryTracker';

//Items
import DelusionsOfGrandeur from './Modules/Items/DelusionsOfGrandeur';
import RaddonsCascadingEyes from './Modules/Items/RaddonsCascadingEyes';

//Traits
import UnleashedDemons from './Modules/Traits/UnleashedDemons';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Spells
    momentum: Momentum,
    nemesis: Nemesis,

    //Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    //Items
    delusionsOfGrandeur: DelusionsOfGrandeur,
    raddonsCascadingEyes: RaddonsCascadingEyes,

    //Traits
    unleashedDemons: UnleashedDemons,
  };
}

export default CombatLogParser;
