import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';
import VerifySpec from './Modules/PaladinCore/VerifySpec';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SacredDawn from './Modules/Features/SacredDawn';
import TyrsDeliverance from './Modules/Features/TyrsDeliverance';

import DrapeOfShame from './Modules/Legendaries/DrapeOfShame';
import Ilterendi from './Modules/Legendaries/Ilterendi';
import Velens from './Modules/Legendaries/Velens';
import ChainOfThrayn from './Modules/Legendaries/ChainOfThrayn';
import Prydaz from './Modules/Legendaries/Prydaz';
import ObsidianStoneSpaulders from './Modules/Legendaries/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Legendaries/MaraadsDyingBreath';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: PaladinAbilityTracker,

    // PaladinCore
    beaconHealing: BeaconHealing,
    beaconTargets: BeaconTargets,
    verifySpec: VerifySpec,

    // Features
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    sacredDawn: SacredDawn,
    tyrsDeliverance: TyrsDeliverance,

    // Legendaries:
    drapeOfShame: DrapeOfShame,
    ilterendi: Ilterendi,
    velens: Velens,
    chainOfThrayn: ChainOfThrayn,
    prydaz: Prydaz,
    obsidianStoneSpaulders: ObsidianStoneSpaulders,
    maraadsDyingBreath: MaraadsDyingBreath,
  };
}

export default CombatLogParser;
