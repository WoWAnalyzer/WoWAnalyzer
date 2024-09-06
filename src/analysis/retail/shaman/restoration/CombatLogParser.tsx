import { AstralShift, SpiritWolf, StaticCharge } from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/Abilities';
import HealingDone from './modules/core/HealingDone';
import HealingEfficiencyDetails from './modules/core/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/core/HealingEfficiencyTracker';
import HealingRainLocation from './modules/core/HealingRainLocation';
import RestorationAbilityTracker from './modules/core/RestorationAbilityTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CastBehavior from './modules/features/CastBehavior';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import SpellUsable from './modules/features/SpellUsable';
import TidalWaves from './modules/features/TidalWaves';
// Talents
import PrimordialWave from './modules/talents/PrimordialWave';
import ChainHeal from './modules/spells/ChainHeal';
import EarthShield from './modules/spells/EarthShield'; // technically shared
import HealingRain from './modules/spells/HealingRain';
import HealingSurge from './modules/spells/HealingSurge';
import HealingWave from './modules/spells/HealingWave';
import LavaSurge from './modules/spells/LavaSurge';
import ManaTideTotem from './modules/spells/ManaTideTotem';
import Resurgence from './modules/spells/Resurgence';
import SpiritLinkDamageReduction from './modules/spells/SpiritLinkDamageReduction';
import WaterShield from './modules/spells/WaterShield';
import AncestralProtectionTotem from './modules/talents/AncestralProtectionTotem';
import AncestralVigor from './modules/talents/AncestralVigor';
import Ascendance from './modules/talents/Ascendance';
import CloudburstTotem from './modules/talents/CloudburstTotem';
import Deluge from './modules/talents/Deluge';
import Downpour from './modules/talents/Downpour';
import EarthenWallTotem from './modules/talents/EarthenWallTotem';
import HighTide from './modules/talents/HighTide';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import TalentStatisticBox from './modules/features/TalentStatisticBox';
import Torrent from './modules/talents/Torrent';
import Undulation from './modules/talents/Undulation';
import UnleashLife from './modules/talents/UnleashLife';
import Wellspring from './modules/talents/Wellspring';
import Undercurrent from './modules/talents/Undercurrent';
import NaturesSwiftness from './modules/talents/NaturesSwiftness';
import SpiritwalkersTidalTotem from './modules/talents/SpiritwalkersTidalTotem';
import Tidewaters from './modules/talents/Tidewaters';
// Hero talents
import SurgingTotem from './modules/talents/totemic/SurgingTotem';
// Spells
// Tiers
import TWW1TierSet from './modules/tier/TWW1TierSet';
// Shared
import StoneBulwarkTotem from '../shared/talents/StoneBulwarkTotem';

// Normalizers
import CloudburstNormalizer from './normalizers/CloudburstNormalizer';
import RiptideNormalizer from './normalizers/RiptideNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import UnleashLifeNormalizer from './normalizers/UnleashLifeNormalizer';
import ChainHealNormalizer from './normalizers/ChainHealNormalizer';
import RiptideTracker from './modules/core/RiptideTracker';
import RiptideAttributor from './modules/core/RiptideAttributor';
import PrimalTideCore from './modules/talents/PrimalTideCore';
import WavespeakersBlessing from './modules/talents/WavespeakersBlessing';
import AncestralReach from './modules/talents/AncestralReach';
import FlowOfTheTides from './modules/talents/FlowOfTheTides';
import EarthShieldBreakdown from './modules/features/EarthShieldBreakdown';
import EarthenHarmony from './modules/talents/EarthenHarmony';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import Guide from './Guide';
import Riptide from './modules/talents/Riptide';
import CallToDominance from 'parser/retail/modules/items/dragonflight/CallToDominance';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    lowHealthHealing: LowHealthHealing,
    healingDone: HealingDone,
    abilities: Abilities,
    healingRainLocation: HealingRainLocation,
    restorationAbilityTracker: RestorationAbilityTracker,
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    cooldownThroughputTracker: CooldownThroughputTracker,
    tidalWaves: TidalWaves,
    castBehavior: CastBehavior,
    checklist: Checklist,
    spellUsable: SpellUsable,
    earthShieldBreakdown: EarthShieldBreakdown,

    // Talents
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    deluge: Deluge,
    ancestralVigor: AncestralVigor,
    earthenWallTotem: EarthenWallTotem,
    downpour: Downpour,
    cloudburstTotem: CloudburstTotem,
    ascendance: Ascendance,
    wellspring: Wellspring,
    highTide: HighTide,
    naturesGuardian: NaturesGuardian,
    ancestralProtectionTotem: AncestralProtectionTotem,
    talentStatisticBox: TalentStatisticBox,
    primordialWave: PrimordialWave,
    undercurrent: Undercurrent,
    primalTideCore: PrimalTideCore,
    wavespeakersBlessing: WavespeakersBlessing,
    ancestralReach: AncestralReach,
    flowOfTheTides: FlowOfTheTides,
    earthenHarmony: EarthenHarmony,
    manaSpring: ManaSpring,
    naturesSwiftness: NaturesSwiftness,
    spiritwalkersTidalTotem: SpiritwalkersTidalTotem,
    tidewaters: Tidewaters,

    // Hero talents
    surgingTotem: SurgingTotem,

    // Spells
    riptide: Riptide,
    chainHeal: ChainHeal,
    healingSurge: HealingSurge,
    healingRain: HealingRain,
    healingWave: HealingWave,
    lavaSurge: LavaSurge,
    resurgence: Resurgence,
    manaTideTotem: ManaTideTotem,
    waterShield: WaterShield,
    spiritLinkDamageReduction: SpiritLinkDamageReduction,

    // Shared
    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,
    astralShift: AstralShift,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,
    stoneBulwarkTotem: StoneBulwarkTotem,

    // Normalizers
    cloudburstNormalizer: CloudburstNormalizer,
    riptideNormalizer: RiptideNormalizer,
    castLinkNormalizer: CastLinkNormalizer,
    unleashLifeNormalizer: UnleashLifeNormalizer,
    chainHealNormalizer: ChainHealNormalizer,
    riptideTracker: RiptideTracker,
    riptideAttributor: RiptideAttributor,

    // Items
    callToDominance: CallToDominance,
    tww1TierSet: TWW1TierSet,
  };
  static guide = Guide;
}

export default CombatLogParser;
