import BaseCombatLogParser, { DependenciesDefinition } from '../core/CombatLogParser';
import Abilities from '../core/modules/Abilities';
import Auras from '../core/modules/Auras';
import SpellTimeWaitingOnGlobalCooldown from '../shared/enhancers/SpellTimeWaitingOnGlobalCooldown';
import AbilitiesMissing from '../shared/modules/AbilitiesMissing';
import AbilityTracker from '../shared/modules/AbilityTracker';
import AlwaysBeCasting from '../shared/modules/AlwaysBeCasting';
import CastEfficiency from '../shared/modules/CastEfficiency';
import CooldownHistory from '../shared/modules/CooldownHistory';
import DeathRecapTracker from '../shared/modules/DeathRecapTracker';
import DeathTracker from '../shared/modules/DeathTracker';
import DispelTracker from '../shared/modules/DispelTracker';
import DistanceMoved from '../shared/modules/DistanceMoved';
import Enemies from '../shared/modules/Enemies';
import EventHistory from '../shared/modules/EventHistory';
import RaidHealthTab from '../shared/modules/features/RaidHealthTab';
import FilteredActiveTime from '../shared/modules/FilteredActiveTime';
import GlobalCooldown from '../shared/modules/GlobalCooldown';
import Haste from '../shared/modules/Haste';
import CritEffectBonus from '../shared/modules/helpers/CritEffectBonus';
import Pets from '../shared/modules/Pets';
import SpellHistory from '../shared/modules/SpellHistory';
import SpellManaCost from '../shared/modules/SpellManaCost';
import VantusRune from '../shared/modules/spells/VantusRune';
import SpellUsable from '../shared/modules/SpellUsable';
import StatTracker from '../shared/modules/StatTracker';
import DamageDone from '../shared/modules/throughput/DamageDone';
import DamageTaken from '../shared/modules/throughput/DamageTaken';
import HealingDone from '../shared/modules/throughput/HealingDone';
import ThroughputStatisticGroup from '../shared/modules/throughput/ThroughputStatisticGroup';
import ApplyBuffNormalizer from '../shared/normalizers/ApplyBuff';
import CancelledCastsNormalizer from '../shared/normalizers/CancelledCasts';
import Channeling from 'parser/shared/normalizers/Channeling';
import MissingCastsNormalizer from '../shared/normalizers/MissingCasts';
import PhaseChangesNormalizer from '../shared/normalizers/PhaseChanges';
import PrePullCooldownsNormalizer from '../shared/normalizers/PrePullCooldowns';
import ManaValues from './modules/ManaValues';
import PreparationRuleAnalyzer from './modules/features/Checklist/PreparationRuleAnalyzer';
import CombatPotionChecker from './modules/items/CombatPotionChecker';
import HealthstoneChecker from './modules/items/HealthstoneChecker';
import EnchantChecker from './modules/items/EnchantChecker';
import ManaGained from './statistic/ManaGained';
// Engineering
import HyperspeedAccelerators from './modules/items/engineering/HyperspeedAccelerators';
import FragBelt from 'parser/classic/modules/items/engineering/FragBelt';
import Bombs from 'parser/classic/modules/items/engineering/Bombs';
// Guide
import FlaskChecker from 'parser/classic/modules/items/FlaskChecker';
import FoodChecker from 'parser/classic/modules/items/FoodChecker';
import PotionChecker from 'parser/classic/modules/items/PotionChecker';
import SynapseSprings from './modules/items/engineering/SynapseSprings';

class CombatLogParser extends BaseCombatLogParser {
  static defaultModules: DependenciesDefinition = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,
    cancelledCastsNormalizer: CancelledCastsNormalizer,
    prepullNormalizer: PrePullCooldownsNormalizer,
    phaseChangesNormalizer: PhaseChangesNormalizer,
    missingCastsNormalize: MissingCastsNormalizer,
    channeling: Channeling,

    // Enhancers
    spellTimeWaitingOnGlobalCooldown: SpellTimeWaitingOnGlobalCooldown,

    // Analyzers
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    throughputStatisticGroup: ThroughputStatisticGroup,
    deathTracker: DeathTracker,

    enchantChecker: EnchantChecker,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    combatPotionChecker: CombatPotionChecker,
    healthstoneChecker: HealthstoneChecker,

    enemies: Enemies,
    pets: Pets,
    spellManaCost: SpellManaCost,
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    haste: Haste,
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    filteredActiveTime: FilteredActiveTime,
    abilities: Abilities,
    buffs: Auras,
    abilitiesMissing: AbilitiesMissing,
    castEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    cooldownHistory: CooldownHistory,
    globalCooldown: GlobalCooldown,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,
    deathRecapTracker: DeathRecapTracker,
    dispels: DispelTracker,

    critEffectBonus: CritEffectBonus,

    // Tabs
    raidHealthTab: RaidHealthTab,

    // Migrated Functional Statistics
    manaGained: ManaGained,

    // Engineering
    hyperspeedAccelerators: HyperspeedAccelerators,
    fragBelt: FragBelt,
    bombs: Bombs,
    synapseSprings: SynapseSprings,

    // Guide
    foodChecker: FoodChecker,
    flaskChecker: FlaskChecker,
    potionChecker: PotionChecker,
  };
}

export default CombatLogParser;
