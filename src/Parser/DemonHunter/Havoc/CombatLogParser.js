import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import EyeBeamNormalizer from './Normalizers/EyeBeam';
import Channeling from './Modules/Core/Channeling';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import Momentum from './Modules/Spells/Momentum';
import Nemesis from './Modules/Spells/Nemesis';

//Resources
import FuryDetails from './Modules/ResourceTracker/FuryDetails';
import FuryTracker from './Modules/ResourceTracker/FuryTracker';

//Talents
import DemonReborn from './Modules/Talents/DemonReborn';

//Traits
import RelicTraits from './Modules/Traits/RelicTraits';
import CriticalChaos from './Modules/Traits/CriticalChaos';
import ChaosVision from './Modules/Traits/ChaosVision';
import SharpenedGlaives from './Modules/Traits/SharpenedGlaives';
import DemonRage from './Modules/Traits/DemonRage';
import UnleashedDemons from './Modules/Traits/UnleashedDemons';
import FeastOnTheSouls from './Modules/Traits/FeastOnTheSouls';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    //Normalizer
    eyeBeamNormalizer: EyeBeamNormalizer,

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

    //Talents
    demonReborn: DemonReborn,

    //Traits
    relicTraits: RelicTraits,
    criticalChaos: CriticalChaos,
    chaosVision: ChaosVision,
    sharpenedGlaives: SharpenedGlaives,
    demonRage: DemonRage,
    unleashedDemons: UnleashedDemons,
    feastOnTheSouls: FeastOnTheSouls,
  };
}

export default CombatLogParser;
