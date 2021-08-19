import BaseCombatLogParser, { DependenciesDefinition } from '../core/CombatLogParser';
import Abilities from '../core/modules/Abilities';
import Buffs from '../core/modules/Buffs';
import SpellTimeWaitingOnGlobalCooldown from '../shared/enhancers/SpellTimeWaitingOnGlobalCooldown';
import AbilitiesMissing from '../shared/modules/AbilitiesMissing';
import AbilityTracker from '../shared/modules/AbilityTracker';
import AlwaysBeCasting from '../shared/modules/AlwaysBeCasting';
import CastEfficiency from '../shared/modules/CastEfficiency';
import Channeling from '../shared/modules/Channeling';
import DeathRecapTracker from '../shared/modules/DeathRecapTracker';
import DeathTracker from '../shared/modules/DeathTracker';
import DispelTracker from '../shared/modules/DispelTracker';
import DistanceMoved from '../shared/modules/DistanceMoved';
import Enemies from '../shared/modules/Enemies';
import EnemyInstances from '../shared/modules/EnemyInstances';
import EventHistory from '../shared/modules/EventHistory';
import RaidHealthTab from '../shared/modules/features/RaidHealthTab';
import FilteredActiveTime from '../shared/modules/FilteredActiveTime';
import GlobalCooldown from '../shared/modules/GlobalCooldown';
import Haste from '../shared/modules/Haste';
import CritEffectBonus from '../shared/modules/helpers/CritEffectBonus';
import Healthstone from '../shared/modules/items/Healthstone';
import ManaValues from '../shared/modules/ManaValues';
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
import MissingCastsNormalizer from '../shared/normalizers/MissingCasts';
import PhaseChangesNormalizer from '../shared/normalizers/PhaseChanges';
import PrePullCooldownsNormalizer from '../shared/normalizers/PrePullCooldowns';
import ManaGained from './statistic/ManaGained';

class CombatLogParser extends BaseCombatLogParser {
  static defaultModules: DependenciesDefinition = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,
    cancelledCastsNormalizer: CancelledCastsNormalizer,
    prepullNormalizer: PrePullCooldownsNormalizer,
    phaseChangesNormalizer: PhaseChangesNormalizer,
    missingCastsNormalize: MissingCastsNormalizer,

    // Enhancers
    spellTimeWaitingOnGlobalCooldown: SpellTimeWaitingOnGlobalCooldown,

    // Analyzers
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    throughputStatisticGroup: ThroughputStatisticGroup,
    deathTracker: DeathTracker,

    enemies: Enemies,
    enemyInstances: EnemyInstances,
    pets: Pets,
    spellManaCost: SpellManaCost,
    channeling: Channeling,
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    haste: Haste,
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    filteredActiveTime: FilteredActiveTime,
    abilities: Abilities,
    buffs: Buffs,
    abilitiesMissing: AbilitiesMissing,
    CastEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    globalCooldown: GlobalCooldown,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,
    deathRecapTracker: DeathRecapTracker,
    dispels: DispelTracker,

    critEffectBonus: CritEffectBonus,

    // Tabs
    raidHealthTab: RaidHealthTab,
    healthstone: Healthstone,
  };

  static suggestions = [...BaseCombatLogParser.suggestions];
  static statistics = [...BaseCombatLogParser.statistics, ManaGained];
}

export default CombatLogParser;
