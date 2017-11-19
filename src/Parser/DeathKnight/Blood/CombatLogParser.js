import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';


import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import BloodPlagueUptime from './Modules/Features/BloodPlagueUptime';
import BoneShieldUptime from './Modules/Features/BoneShieldUptime';
import OssuaryUptime from './Modules/Features/OssuaryUptime';
import WastedDeathAndDecay from './Modules/Features/WastedDeathAndDecay';
import BlooddrinkerTicks from './Modules/Features/BlooddrinkerTicks';

import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';

import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // DeathKnight Core

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    boneShieldUptime: BoneShieldUptime,
    ossuaryUptime: OssuaryUptime,
    wastedDeathAndDecay: WastedDeathAndDecay,
    blooddrinkerTicks: BlooddrinkerTicks,



    // DOT
    bloodplagueUptime: BloodPlagueUptime,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    // Talents


    // Traits


    // Items:
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
  };
}

export default CombatLogParser;
