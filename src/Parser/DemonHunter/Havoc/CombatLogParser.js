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

//Items
import DelusionsOfGrandeur from './Modules/Items/DelusionsOfGrandeur';
import RaddonsCascadingEyes from './Modules/Items/RaddonsCascadingEyes';
import MoargBionicStabilizers from './Modules/Items/MoargBionicStabilizers';
import SoulOfTheSlayer from '../Shared/Modules/Items/SoulOfTheSlayer';
import AngerOfTheHalfGiants from './Modules/Items/AngerOfTheHalfGiants';
import ChaosTheory from './Modules/Items/ChaosTheory';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

//Talents
import DemonReborn from './Modules/Talents/DemonReborn';

//Traits
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

    //Items
    delusionsOfGrandeur: DelusionsOfGrandeur,
    raddonsCascadingEyes: RaddonsCascadingEyes,
    moargBionicStabilizers: MoargBionicStabilizers,
    soulOfTheSlayer: SoulOfTheSlayer,
    angerOfTheHalfGiants: AngerOfTheHalfGiants,
    chaosTheory: ChaosTheory,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,

    //Talents
    demonReborn: DemonReborn,

    //Traits
    unleashedDemons: UnleashedDemons,
    feastOnTheSouls: FeastOnTheSouls,
  };
}

export default CombatLogParser;
