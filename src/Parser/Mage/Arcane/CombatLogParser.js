import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import WarningDisplay from 'Parser/Core/Modules/Features/WarningDisplay';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Channeling from './Modules/Features/Channeling';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';

import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';



class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Warning
    warningDisplay: [WarningDisplay, { needsWorkWarning: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    channeling: Channeling,
    cancelledCasts: CancelledCasts,

    // Talents
    mirrorImage: MirrorImage,
    unstableMagic: UnstableMagic,
    runeOfPower: RuneOfPower,

  };
}

export default CombatLogParser;
