import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';

//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import FocusUsage from '../Shared/Modules/Features/FocusUsage';

//Normalizer
import TipOfTheSpearNormalizer from './Modules/Normalizers/TipOfTheSpear';

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

//Spells
import KillCommand from './Modules/Spells/KillCommand';
import ButcheryCarve from './Modules/Spells/ButcheryCarve';
import SerpentSting from './Modules/Spells/SerpentSting';
import CoordinatedAssault from './Modules/Spells/CoordinatedAssault';
import WildfireBomb from './Modules/Spells/WildfireBomb';

//Talents
import Trailblazer from '../Shared/Modules/Talents/Trailblazer';
import NaturalMending from '../Shared/Modules/Talents/NaturalMending';
import AMurderOfCrows from '../Shared/Modules/Talents/AMurderOfCrows';
import VipersVenom from './Modules/Talents/VipersVenom';
import MongooseBite from './Modules/Talents/MongooseBite';
import SteelTrap from './Modules/Talents/SteelTrap';
import Chakrams from './Modules/Talents/Chakrams';

//Azerite Traits
import WildernessSurvival from './Modules/Spells/AzeriteTraits/WildernessSurvival';

//Traits and Talents
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    focusUsage: FocusUsage,

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    killCommand: KillCommand,
    butcheryCarve: ButcheryCarve,
    serpentSting: SerpentSting,
    coordinatedAssault: CoordinatedAssault,
    wildfireBomb: WildfireBomb,

    //Talents
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    aMurderOfCrows: AMurderOfCrows,
    vipersVenom: VipersVenom,
    mongooseBite: MongooseBite,
    steelTrap: SteelTrap,
    chakrams: Chakrams,

    //Azerite Traits
    wildernessSurvival: WildernessSurvival,

    //Traits and talents
    traitsAndTalents: TraitsAndTalents,
  };
}

export default CombatLogParser;
