import { RuneDetails, RuneOfTheFallenCrusader } from 'analysis/retail/deathknight/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import DeathsCaress from './modules/core/DeathsCaress';
import GlobalCooldown from './modules/core/GlobalCooldown';
import RuneForgeChecker from './modules/core/RuneForgeChecker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import BlooddrinkerTicks from './modules/features/BlooddrinkerTicks';
import BloodPlagueUptime from './modules/features/BloodPlagueUptime';
import BoneShield from './modules/features/BoneShield';
import BoneShieldTimesByStacks from './modules/features/BoneShieldTimesByStacks';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CrimsonScourge from './modules/features/CrimsonScourge';
import DancingRuneWeapon from './modules/features/DancingRuneWeapon';
import DeathStrikeTiming from './modules/features/DeathStrikeTiming';
import InitialMarrowrendCast from './modules/features/InitialMarrowrendCast';
import MarrowrendUsage from './modules/features/MarrowrendUsage';
import MitigationCheck from './modules/features/MitigationCheck';
import Ossuary from './modules/features/Ossuary';
import BloodGuide from './modules/guide';
import RunicPowerDetails from './modules/runicpower/RunicPowerDetails';
import RunicPowerTracker from './modules/runicpower/RunicPowerTracker';
import BloodShield from './modules/spells/BloodShield/BloodShield';
import BloodShieldNormalizer from './modules/spells/BloodShield/normalizer';
import DeathStrike from './modules/spells/DeathStrike';
import DeathStrikeLinkNormalizer from './modules/spells/DeathStrike/normalizer';
import Bloodworms from './modules/talents/Bloodworms';
import BoneStorm from './modules/talents/Bonestorm';
import Consumption from './modules/talents/Consumption';
import FoulBulwark from './modules/talents/FoulBulwark';
import Heartbreaker from './modules/talents/Heartbreaker';
import Hemostasis from './modules/talents/Hemostasis';
import MarkOfBlood from './modules/talents/MarkOfBlood';
import RapidDecomposition from './modules/talents/RapidDecomposition';
import RedThirst from './modules/talents/RedThirst';
import RelishInBlood from './modules/talents/RelishInBlood';
import Tombstone from './modules/talents/Tombstone';
import Voracious from './modules/talents/Voracious';
import WillOfTheNecropolis from './modules/talents/WillOfTheNecropolis';
import RuneTracker from './modules/core/RuneTracker';
import ResourceOrderNormalizer from './modules/core/ResourceOrderNormalizer';
import BoneShieldOrderNormalizer from './modules/core/BoneShieldOrderNormalizer';
import ExterminateCostNormalizer from '../shared/ExterminateCostNormalizer';

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

    // guide stuff
    deathStrike: DeathStrike,
    bloodShield: BloodShield,

    // normalizers
    deathStrikeNormalizer: DeathStrikeLinkNormalizer,
    bloodShieldNormalizer: BloodShieldNormalizer,
    resourceOrderNormalizer: ResourceOrderNormalizer,
    boneShieldOrderNormalizer: BoneShieldOrderNormalizer,
    ExterminateCostNormalizer,
  };

  static guide = BloodGuide;
}

export default CombatLogParser;
