import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Channeling from './Modules/Features/Channeling';

import ArcaneMissiles from './Modules/Features/ArcaneMissiles';
import Evocation from './Modules/Features/Evocation';

import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    channeling: Channeling,
    cancelledCasts: CancelledCasts,
    arcaneMissiles: ArcaneMissiles,
    evocation: Evocation,

    // Talents
    mirrorImage: MirrorImage,
    unstableMagic: UnstableMagic,
    runeOfPower: RuneOfPower,
  };
}

export default CombatLogParser;
