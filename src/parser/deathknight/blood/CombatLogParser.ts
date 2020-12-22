import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import BloodPlagueUptime from './modules/features/BloodPlagueUptime';
import CrimsonScourge from './modules/features/CrimsonScourge';
import BlooddrinkerTicks from './modules/features/BlooddrinkerTicks';
import Checklist from './modules/features/checklist/Module';
import MarrowrendUsage from './modules/features/MarrowrendUsage';
import BoneShield from './modules/features/BoneShield';
import DancingRuneWeapon from './modules/features/DancingRuneWeapon';
import InitialMarrowrendCast from './modules/features/InitialMarrowrendCast';
import DeathStrikeTiming from './modules/features/DeathStrikeTiming';
import BoneShieldTimesByStacks from './modules/features/BoneShieldTimesByStacks';
import DeathsCaress from './modules/core/DeathsCaress';
import MitigationCheck from './modules/features/MitigationCheck';
import Ossuary from './modules/features/Ossuary';

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
import Consumption from './modules/talents/Consumption';
import RelishInBlood from './modules/talents/RelishInBlood';

// Runes
import RuneForgeChecker from './modules/core/RuneForgeChecker';
import RuneOfTheFallenCrusader from '../shared/runeforges/RuneOfTheFallenCrusader';
import RuneOfHysteria from '../shared/runeforges/RuneOfHysteria';

// Legendaries
import BrynadaorsMight from './modules/items/BrynadaorsMight';
import Superstrain from '../shared/items/Superstrain';

// Covenants
import SwarmingMist from '../shared/covenants/SwarmingMist';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
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
    consumption: Consumption,
    relishInBlood: RelishInBlood,

    // Runes
    runeForgeChecker: RuneForgeChecker,
    runeOfTheFallenCrusader: RuneOfTheFallenCrusader,
    runeOfHysteria: RuneOfHysteria,

    // Legendaries
    brynadaorsMight: BrynadaorsMight,
    superStrain: Superstrain,

    // Covenants
    swarmingMist: SwarmingMist
  };
}

export default CombatLogParser;
