import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Haste from './Modules/PaladinCore/Haste';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Judgment from './Modules/Features/Judgment';

import DivinePurpose from './Modules/Talents/DivinePurpose';
import BoWProcTracker from './Modules/PaladinCore/BoWProcTracker';
import Retribution from './Modules/PaladinCore/Retribution';
import BlessingOfTheAshbringer from './Modules/PaladinCore/BlessingOfTheAshbringer';

import HolyPowerTracker from './Modules/HolyPower/HolyPowerTracker';
import HolyPowerDetails from './Modules/HolyPower/HolyPowerDetails';

import RelicTraits from './Modules/Traits/RelicTraits';
import MightOfTheTemplar from './Modules/Traits/MightOfTheTemplar';
import HighlordsJudgment from './Modules/Traits/HighlordsJudgment';
import DeliverTheJustice from './Modules/Traits/DeliverTheJustice';
import RighteousVerdict from './Modules/Traits/RighteousVerdict';
import WrathOfTheAshbringer from './Modules/Traits/WrathOfTheAshbringer';

import WhisperOfTheNathrezim from './Modules/Items/WhisperOfTheNathrezim';
import LiadrinsFuryUnleashed from './Modules/Items/LiadrinsFuryUnleashed';
import SoulOfTheHighlord from './Modules/Items/SoulOfTheHighlord';
import AshesToDust from './Modules/Items/AshesToDust';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    judgment: Judgment,
    retribution: Retribution,
    blessingOfTheAshbringer: BlessingOfTheAshbringer,
    
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

    // Items:
    whisperOfTheNathrezim: WhisperOfTheNathrezim,
    liadrinsFuryUnleahed: LiadrinsFuryUnleashed,
    soulOfTheHighlord: SoulOfTheHighlord,
    ashesToDust: AshesToDust,
    chainOfThrayn: ChainOfThrayn,
    tier20_2set: Tier20_2set,
    tier20_4set: Tier20_4set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
