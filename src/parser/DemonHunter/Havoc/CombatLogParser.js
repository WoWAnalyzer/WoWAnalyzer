import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import EyeBeamNormalizer from './normalizers/EyeBeam';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

import Checklist from './modules/features/Checklist/Module';

import Momentum from './modules/spells/Momentum';
import Nemesis from './modules/spells/Nemesis';

//Resources
import FuryDetails from './modules/ResourceTracker/FuryDetails';
import FuryTracker from './modules/ResourceTracker/FuryTracker';

//Items
import DelusionsOfGrandeur from './modules/items/DelusionsOfGrandeur';
import RaddonsCascadingEyes from './modules/items/RaddonsCascadingEyes';
import MoargBionicStabilizers from './modules/items/MoargBionicStabilizers';
import SoulOfTheSlayer from '../shared/modules/Items/SoulOfTheSlayer';
import AngerOfTheHalfGiants from './modules/items/AngerOfTheHalfGiants';
import Tier21_2set from './modules/items/Tier21_2set';
import Tier21_4set from './modules/items/Tier21_4set';

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
    checklist: Checklist,

    // Spells
    momentum: Momentum,
    nemesis: Nemesis,

    //Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,

    //Items
    delusionsOfGrandeur: DelusionsOfGrandeur,
    raddonsCascadingEyes: RaddonsCascadingEyes,
    moargBionicStabilizers: MoargBionicStabilizers,
    soulOfTheSlayer: SoulOfTheSlayer,
    angerOfTheHalfGiants: AngerOfTheHalfGiants,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
