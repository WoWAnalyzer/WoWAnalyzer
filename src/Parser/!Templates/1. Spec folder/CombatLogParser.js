import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

// TODO: Pick the ones relevant to your spec:
// import DamageDone from 'Parser/Core/Modules/DamageDone';
// import HealingDone from 'Parser/Core/Modules/HealingDone';
// import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import Checklist from './Modules/Features/Checklist';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

// TODO: import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // TODO: Enable the ones relevant to your spec:
    // damageDone: [DamageDone, { showStatistic: true }],
    // healingDone: [HealingDone, { showStatistic: true }],
    // damageTaken: [DamageTaken, { showStatistic: true }],

    abilities: Abilities, // TODO: Go to Abilities class and fill it with all abilities available to your spec

    // Features
    checklist: Checklist, // TODO: Go into Checklist to define rules
    alwaysBeCasting: AlwaysBeCasting, // TODO: Define a list of all abilities on the GCD
    // TODO: cooldownThroughputTracker: CooldownThroughputTracker,
  };
}

export default CombatLogParser;
