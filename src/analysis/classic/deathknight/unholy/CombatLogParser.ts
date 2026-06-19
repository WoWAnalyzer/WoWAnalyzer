import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import UnholyDKGuide from './Guide';
// Shared
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { GlobalCooldown } from 'analysis/classic/deathknight/shared';
import Haste from 'parser/shared/modules/Haste';
import Enemies from 'parser/shared/modules/Enemies';
// Core features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// MoP-specific analysis modules
import SuddenDoom from './modules/features/SuddenDoom';
import DarkTransformationUptime from './modules/features/DarkTransformationUptime';
import GargoyleTracker from './modules/features/GargoyleTracker';
import RuneTracker from './modules/features/RuneTracker';
import RunicPowerTracker from './modules/features/RunicPowerTracker';
import UnholyFrenzy from './modules/features/UnholyFrenzy';
import UnholyPresenceUptime from './modules/features/UnholyPresenceUptime';
import DeathAndDecayUptime from './modules/features/DeathAndDecayUptime';
import BloodPlagueUptime from './modules/features/BloodPlagueUptime';
import FrostFeverUptime from './modules/features/FrostFeverUptime';
import PlagueLeech from './modules/features/PlagueLeech';
import BloodTapCharges from './modules/features/BloodTapCharges';
import FesteringStrikeWaste from './modules/features/FesteringStrikeWaste';
import ERWEfficiency from './modules/features/ERWEfficiency';
import SoulReaperEfficiency from './modules/features/SoulReaperEfficiency';
import GhoulAnalyzer from './modules/features/GhoulAnalyzer';
import EnchantChecker from './modules/features/EnchantChecker';
// Shared DK
import ArmyOfTheDead from '../shared/ArmyOfTheDead';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared infrastructure
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,
    haste: Haste,
    enemies: Enemies,
    // Core features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Rune tracking
    runeTracker: RuneTracker,
    // MoP Unholy DK analysis
    suddenDoom: SuddenDoom,
    darkTransformationUptime: DarkTransformationUptime,
    gargoyleTracker: GargoyleTracker,
    runicPowerTracker: RunicPowerTracker,
    unholyFrenzy: UnholyFrenzy,
    unholyPresenceUptime: UnholyPresenceUptime,
    deathAndDecayUptime: DeathAndDecayUptime,
    bloodPlagueUptime: BloodPlagueUptime,
    frostFeverUptime: FrostFeverUptime,
    plagueLeech: PlagueLeech,
    bloodTapCharges: BloodTapCharges,
    festeringStrikeWaste: FesteringStrikeWaste,
    erwEfficiency: ERWEfficiency,
    soulReaperEfficiency: SoulReaperEfficiency,
    ghoulAnalyzer: GhoulAnalyzer,
    enchantChecker: EnchantChecker,
    // Disable base classic engineering bombs (not relevant for DK analysis)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bombs: null as any,
    // Shared DK
    armyOfTheDead: ArmyOfTheDead,
  };

  static guide = UnholyDKGuide;
}

export default CombatLogParser;
