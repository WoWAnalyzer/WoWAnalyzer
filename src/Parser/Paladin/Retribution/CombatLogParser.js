import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Haste from './Modules/PaladinCore/Haste';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist';
import Judgment from './Modules/PaladinCore/Judgment';

import DivinePurpose from './Modules/Talents/DivinePurpose';
import BoWProcTracker from './Modules/PaladinCore/BoWProcTracker';
import Retribution from './Modules/PaladinCore/Retribution';
import BlessingOfTheAshbringer from './Modules/PaladinCore/BlessingOfTheAshbringer';
import Crusade from './Modules/PaladinCore/Crusade';

import HolyPowerTracker from './Modules/HolyPower/HolyPowerTracker';
import HolyPowerDetails from './Modules/HolyPower/HolyPowerDetails';

import RelicTraits from './Modules/Traits/RelicTraits';
import MightOfTheTemplar from './Modules/Traits/MightOfTheTemplar';
import HighlordsJudgment from './Modules/Traits/HighlordsJudgment';
import DeliverTheJustice from './Modules/Traits/DeliverTheJustice';
import RighteousVerdict from './Modules/Traits/RighteousVerdict';
import WrathOfTheAshbringer from './Modules/Traits/WrathOfTheAshbringer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    judgment: Judgment,
    retribution: Retribution,
    blessingOfTheAshbringer: BlessingOfTheAshbringer,
    crusade: Crusade,
    
    // Talents
    divinePurpose: DivinePurpose,
    boWProcTracker: BoWProcTracker,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,

    // Traits
    relicTraits: RelicTraits,
    mightOfTheTemplar: MightOfTheTemplar,
    highlordsJudgment: HighlordsJudgment,
    deliverTheJustice: DeliverTheJustice,
    righteousVerdict: RighteousVerdict,
    wrathOfTheAshbringer: WrathOfTheAshbringer,
  };
}

export default CombatLogParser;
