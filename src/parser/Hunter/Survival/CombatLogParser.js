import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';
import Abilities from './modules/Abilities';

//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import TimeFocusCapped from '../shared/modules/Features/TimeFocusCapped';
import FocusUsage from '../shared/modules/Features/FocusUsage';

//Normalizer
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';

//Focus
import FocusTracker from '../shared/modules/Features/FocusChart/FocusTracker';
import FocusTab from '../shared/modules/Features/FocusChart/FocusTab';

//Spells
import KillCommand from './modules/spells/KillCommand';
import ButcheryCarve from './modules/spells/ButcheryCarve';
import SerpentSting from './modules/spells/SerpentSting';
import CoordinatedAssault from './modules/spells/CoordinatedAssault';
import WildfireBomb from './modules/spells/WildfireBomb';

//Talents
import Trailblazer from '../shared/modules/Talents/Trailblazer';
import NaturalMending from '../shared/modules/Talents/NaturalMending';
import AMurderOfCrows from '../shared/modules/Talents/AMurderOfCrows';
import VipersVenom from './modules/talents/VipersVenom';
import MongooseBite from './modules/talents/MongooseBite';
import SteelTrap from './modules/talents/SteelTrap';
import Chakrams from './modules/talents/Chakrams';

//Azerite Traits
import WildernessSurvival from './modules/spells/AzeriteTraits/WildernessSurvival';

//Traits and Talents
import TraitsAndTalents from './modules/features/TraitsAndTalents';

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
