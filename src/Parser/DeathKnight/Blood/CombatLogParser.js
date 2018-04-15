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
import UnendingThirstTracker from './Modules/Features/UnendingThirstTracker';
import Checklist from './Modules/Features/Checklist';
import MarrowrendUsage from './Modules/Features/MarrowrendUsage';
import Souldrinker from './Modules/Features/Souldrinker';
import BoneShield from './Modules/Features/BoneShield';
import DancingRuneWeapon from './Modules/Features/DancingRuneWeapon';
import InitialMarrowrendCast from './Modules/Features/InitialMarrowrendCast';
import DeathStrikeTiming from './Modules/Features/DeathStrikeTiming';

// Resources
import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';
import RuneTracker from '../Shared/RuneTracker';
import RuneDetails from '../Shared/RuneDetails';

// Talents
import Ossuary from './Modules/Talents/Ossuary';
import RedThirst from './Modules/Talents/RedThirst';
import BoneStorm from './Modules/Talents/Bonestorm';

//Traits
import RelicTraits from './Modules/Traits/RelicTraits';
import Bonebreaker from './Modules/Traits/Bonebreaker';
import AllConsumingRot from './Modules/Traits/AllConsumingRot';
import Veinrender from './Modules/Traits/Veinrender';
import Coagulopathy from './Modules/Traits/Coagulopathy';


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
    crimsonScourge: CrimsonScourge,
    dancingRuneWeapon: DancingRuneWeapon,
    initialMarrowrendCast: InitialMarrowrendCast,
    blooddrinkerTicks: BlooddrinkerTicks,
    unendingThirstTracker:UnendingThirstTracker,
    checklist: Checklist,
    deathStrikeTiming: DeathStrikeTiming,
    marrowrendUsage: MarrowrendUsage,
    souldrinker: Souldrinker,
    boneShield: BoneShield,

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
    boneStorm: BoneStorm,

    // Traits
    RelicTraits: RelicTraits,
    bonebreaker: Bonebreaker,
    allConsumingRot: AllConsumingRot,
    veinrender: Veinrender,
    coagulopathy: Coagulopathy,
  };
}

export default CombatLogParser;
