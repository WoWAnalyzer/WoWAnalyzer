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
import CrimsonScourge from './Modules/Features/CrimsonScourge';
import BlooddrinkerTicks from './Modules/Features/BlooddrinkerTicks';
import Checklist from './Modules/Features/Checklist';
import MarrowrendUsage from './Modules/Features/MarrowrendUsage';
import BoneShield from './Modules/Features/BoneShield';
import DancingRuneWeapon from './Modules/Features/DancingRuneWeapon';
import InitialMarrowrendCast from './Modules/Features/InitialMarrowrendCast';
import DeathStrikeTiming from './Modules/Features/DeathStrikeTiming';
import BoneShieldTimesByStacks from './Modules/Features/BoneShieldTimesByStacks';
import DeathsCaress from './Modules/Core/DeathsCaress';
import MitigationCheck from './Modules/Features/MitigationCheck';

// Resources
import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';
import RuneTracker from '../Shared/RuneTracker';
import RuneDetails from '../Shared/RuneDetails';

// Talents
import RedThirst from './Modules/Talents/RedThirst';
import BoneStorm from './Modules/Talents/Bonestorm';
import MarkOfBlood from './Modules/Talents/MarkOfBlood';
import Hemostasis from './Modules/Talents/Hemostasis';
import FoulBulwark from './Modules/Talents/FoulBulwark';
import Heartbreaker from './Modules/Talents/Heartbreaker';
import Bloodworms from './Modules/Talents/Bloodworms';
import Tombstone from './Modules/Talents/Tombstone';
import Voracious from './Modules/Talents/Voracious';
import RapidDecomposition from './Modules/Talents/RapidDecomposition';
import WillOfTheNecropolis from './Modules/Talents/WillOfTheNecropolis';
import Ossuary from './Modules/Talents/Ossuary';
import RuneStrike from './Modules/Talents/RuneStrike';
import Consumption from './Modules/Talents/Consumption';

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
    mitigationCheck: MitigationCheck,

    // DeathKnight Core
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    crimsonScourge: CrimsonScourge,
    dancingRuneWeapon: DancingRuneWeapon,
    initialMarrowrendCast: InitialMarrowrendCast,
    blooddrinkerTicks: BlooddrinkerTicks,
    checklist: Checklist,
    deathStrikeTiming: DeathStrikeTiming,
    marrowrendUsage: MarrowrendUsage,
    boneShield: BoneShield,
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
    deathsCaress: DeathsCaress,

    // DOT
    bloodplagueUptime: BloodPlagueUptime,

    // Resources
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
    runeDetails: RuneDetails,

    // Talents
    redThirst: RedThirst,
    boneStorm: BoneStorm,
    markOfBlood: MarkOfBlood,
    hemostasis: Hemostasis,
    foulBulwark: FoulBulwark,
    heartbreaker: Heartbreaker,
    bloodworms: Bloodworms,
    tombstone: Tombstone,
    voracious: Voracious,
    rapidDecomposition: RapidDecomposition,
    willOfTheNecropolis: WillOfTheNecropolis,
    ossuary: Ossuary,
    runeStrike: RuneStrike,
    consumption: Consumption,

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
