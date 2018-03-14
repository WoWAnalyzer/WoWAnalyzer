import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import Channeling from './Modules/Core/Channeling';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

// Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import BloodPlagueUptime from './Modules/Features/BloodPlagueUptime';
import BoneShieldUptime from './Modules/Features/BoneShieldUptime';
import CrimsonScourge from './Modules/Features/CrimsonScourge';
import BlooddrinkerTicks from './Modules/Features/BlooddrinkerTicks';
import UnendingThirstTracker from './Modules/Features/UnendingThirstTracker';
import Checklist from './Modules/Features/Checklist';
import DeathStrikeTimingGraph from './Modules/Features/DeathStrikeTimingGraph';
import MarrowrendUsage from './Modules/Features/MarrowrendUsage';

// Resources
import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';
import RuneTracker from '../Shared/RuneTracker';
import RuneDetails from '../Shared/RuneDetails';

// Talents
import Ossuary from './Modules/Talents/Ossuary';
import RedThirst from './Modules/Talents/RedThirst';

// Items
import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';
import T21_2pc from './Modules/Items/T21_2pc';
import T21_4pc from './Modules/Items/T21_4pc';
import SkullflowersHaemostasis from './Modules/Items/SkullflowersHaemostasis';
import ShacklesofBryndaor from './Modules/Items/ShacklesofBryndaor';
import SoulflayersCorruption from './Modules/Items/SoulflayersCorruption';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // DeathKnight Core
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    boneShieldUptime: BoneShieldUptime,
    crimsonScourge: CrimsonScourge,
    blooddrinkerTicks: BlooddrinkerTicks,
    unendingThirstTracker:UnendingThirstTracker,
    checklist: Checklist,
    deathStrikeTimingGraph: DeathStrikeTimingGraph,
    marrowrendUsage: MarrowrendUsage,


    // DOT
    bloodplagueUptime: BloodPlagueUptime,

    // Resources
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    // Talents
    ossuary: Ossuary,
    redThirst: RedThirst,

    // Traits


    // Items:
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
    t21_2pc: T21_2pc,
    t21_4pc: T21_4pc,
    skullflowersHaemostasis: SkullflowersHaemostasis,
    shacklesofBryndaor:ShacklesofBryndaor,
    soulflayersCorruption:SoulflayersCorruption,    
  };
}

export default CombatLogParser;
