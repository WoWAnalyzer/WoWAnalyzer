import SPELLS from 'common/SPELLS/classic/deathknight';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import FrostDKGuide from './Guide';
// Shared
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {
  ERWEfficiency,
  GlobalCooldown,
  createBloodTapCharges,
} from 'analysis/classic/deathknight/shared';
import Haste from 'parser/shared/modules/Haste';
import Enemies from 'parser/shared/modules/Enemies';
// Core features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// MoP-specific analysis modules
import KillingMachine from './modules/features/KillingMachine';
import RimeEfficiency from './modules/features/RimeEfficiency';
import FrostFeverUptime from './modules/features/FrostFeverUptime';
import BloodPlagueUptime from './modules/features/BloodPlagueUptime';
import RuneTracker from './modules/features/RuneTracker';
import RunicPowerTracker from './modules/features/RunicPowerTracker';
import PillarOfFrost from './modules/features/PillarOfFrost';
import PlagueLeech from './modules/features/PlagueLeech';
import SoulReaperEfficiency from './modules/features/SoulReaperEfficiency';
import RaiseDeadTracker from './modules/features/RaiseDeadTracker';
import OutbreakTracker from './modules/features/OutbreakTracker';
import ObliterateRuneWaste from './modules/features/ObliterateRuneWaste';
import PlagueStrikeRuneWaste from './modules/features/PlagueStrikeRuneWaste';
import ObliterateWithRime from './modules/features/ObliterateWithRime';
import HowlingBlastAoE from './modules/features/HowlingBlastAoE';
import EnchantChecker from './modules/features/EnchantChecker';
// Shared DK
import ArmyOfTheDead from '../shared/ArmyOfTheDead';

const { analyzer: BloodTapCharges, normalizer: BloodChargeGainLinkNormalizer } =
  createBloodTapCharges(SPELLS.FROST_STRIKE, 'Frost Strike');

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared infrastructure
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,
    haste: Haste,
    enemies: Enemies,
    // Normalizers
    bloodChargeGainLinkNormalizer: BloodChargeGainLinkNormalizer,
    // Core features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Rune tracking (prerequisite for ERW efficiency)
    runeTracker: RuneTracker,
    // MoP Frost DK analysis
    killingMachine: KillingMachine,
    rimeEfficiency: RimeEfficiency,
    frostFeverUptime: FrostFeverUptime,
    bloodPlagueUptime: BloodPlagueUptime,
    runicPowerTracker: RunicPowerTracker,
    pillarOfFrost: PillarOfFrost,
    plagueLeech: PlagueLeech,
    bloodTapCharges: BloodTapCharges,
    erwEfficiency: ERWEfficiency,
    soulReaperEfficiency: SoulReaperEfficiency,
    raiseDeadTracker: RaiseDeadTracker,
    outbreakTracker: OutbreakTracker,
    obliterateRuneWaste: ObliterateRuneWaste,
    plagueStrikeRuneWaste: PlagueStrikeRuneWaste,
    obliterateWithRime: ObliterateWithRime,
    howlingBlastAoE: HowlingBlastAoE,
    enchantChecker: EnchantChecker,
    // Disable base classic engineering bombs (not relevant for DK analysis)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bombs: null as any,
    // Shared DK
    armyOfTheDead: ArmyOfTheDead,
  };

  static guide = FrostDKGuide;
}

export default CombatLogParser;
