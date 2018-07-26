import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Channeling from './Modules/Features/Channeling';

import ArcaneMissiles from './Modules/Features/ArcaneMissiles';

import ArcaneFamiliar from './Modules/Features/ArcaneFamiliar';
import ArcaneChargeTracker from './Modules/Features/ArcaneChargeTracker';

import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import ArcaneIntellect from '../Shared/Modules/Features/ArcaneIntellect';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import ArcaneOrb from './Modules/Features/ArcaneOrb';


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
    arcaneChargeTracker: ArcaneChargeTracker,

    // Talents
    arcaneFamiliar: ArcaneFamiliar,
    mirrorImage: MirrorImage,
    arcaneIntellect: ArcaneIntellect,
    runeOfPower: RuneOfPower,
    arcaneOrb: ArcaneOrb,
  };
}

export default CombatLogParser;
