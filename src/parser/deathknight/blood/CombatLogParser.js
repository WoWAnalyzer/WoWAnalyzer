import CoreCombatLogParser from 'parser/core/CombatLogParser';
import HealingDone from 'parser/core/modules/HealingDone';
import DamageDone from 'parser/core/modules/DamageDone';
import DamageTaken from 'parser/core/modules/DamageTaken';

import Abilities from './modules/Abilities';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import BloodPlagueUptime from './modules/features/BloodPlagueUptime';
import CrimsonScourge from './modules/features/CrimsonScourge';
import BlooddrinkerTicks from './modules/features/BlooddrinkerTicks';
import Checklist from './modules/features/Checklist';
import MarrowrendUsage from './modules/features/MarrowrendUsage';
import BoneShield from './modules/features/BoneShield';
import DancingRuneWeapon from './modules/features/DancingRuneWeapon';
import InitialMarrowrendCast from './modules/features/InitialMarrowrendCast';
import DeathStrikeTiming from './modules/features/DeathStrikeTiming';
import BoneShieldTimesByStacks from './modules/features/BoneShieldTimesByStacks';
import DeathsCaress from './modules/core/DeathsCaress';
import MitigationCheck from './modules/features/MitigationCheck';

// Resources
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import RuneTracker from '../shared/RuneTracker';
import RuneDetails from '../shared/RuneDetails';

// Talents
import RedThirst from './modules/talents/RedThirst';
import BoneStorm from './modules/talents/Bonestorm';
import MarkOfBlood from './modules/talents/MarkOfBlood';
import Hemostasis from './modules/talents/Hemostasis';
import FoulBulwark from './modules/talents/FoulBulwark';
import Heartbreaker from './modules/talents/Heartbreaker';
import Bloodworms from './modules/talents/Bloodworms';
import Tombstone from './modules/talents/Tombstone';
import Voracious from './modules/talents/Voracious';
import RapidDecomposition from './modules/talents/RapidDecomposition';
import WillOfTheNecropolis from './modules/talents/WillOfTheNecropolis';
import Ossuary from './modules/talents/Ossuary';
import RuneStrike from './modules/talents/RuneStrike';
import Consumption from './modules/talents/Consumption';

// Items
import T20_2pc from './modules/items/T20_2pc';
import T20_4pc from './modules/items/T20_4pc';
import T21_2pc from './modules/items/T21_2pc';
import T21_4pc from './modules/items/T21_4pc';
import SkullflowersHaemostasis from './modules/items/SkullflowersHaemostasis';
import ShacklesofBryndaor from './modules/items/ShacklesofBryndaor';
import SoulflayersCorruption from './modules/items/SoulflayersCorruption';

// Azerite Traits
import BonesOfTheDamned from './modules/spells/azeritetraits/BonesOfTheDamned';
import BoneSpikeGraveyard from '../shared/spells/azeritetraits/BoneSpikeGraveyard';
import EternalRuneWeapon from './modules/spells/azeritetraits/EternalRuneWeapon';

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

    // Azerite Traits
    bonesOfTheDamned: BonesOfTheDamned,
    boneSpikeGraveyard: BoneSpikeGraveyard,
    eternalRuneWeapon: EternalRuneWeapon,
  };
}

export default CombatLogParser;
