import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import {
  AstralShift,
  ChainHarvest,
  ElementalConduit,
  SpiritWolf,
  StaticCharge,
  TumblingWaves,
} from '@wowanalyzer/shaman';

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
import EmbraceOfEarth from './modules/shadowlands/conduits/EmbraceOfEarth';
import HeavyRainfall from './modules/shadowlands/conduits/HeavyRainfall';
import NaturesFocus from './modules/shadowlands/conduits/NaturesFocus';
import SwirlingCurrents from './modules/shadowlands/conduits/SwirlingCurrents';
import EarthenHarmony from './modules/shadowlands/legendaries/EarthenHarmony';
import JonatsNaturalFocus from './modules/shadowlands/legendaries/JonatsNaturalFocus';
import PrimalTideCore from './modules/shadowlands/legendaries/PrimalTideCore';
import PrimordialWave from './modules/shadowlands/spells/PrimordialWave';
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
import FlashFlood from './modules/talents/FlashFlood';
import HighTide from './modules/talents/HighTide';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import SurgeOfEarth from './modules/talents/SurgeOfEarth';
import TalentStatisticBox from './modules/talents/TalentStatisticBox';
import Torrent from './modules/talents/Torrent';
import Undulation from './modules/talents/Undulation';
import UnleashLife from './modules/talents/UnleashLife';
import Wellspring from './modules/talents/Wellspring';
// Spells
// Potency Conduits
// Legendaries
// Covenants
// Shared
import CloudburstNormalizer from './normalizers/CloudburstNormalizer';
import RiptideNormalizer from './normalizers/RiptideNormalizer';

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

    // Talents
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    deluge: Deluge,
    surgeOfEarth: SurgeOfEarth,
    flashFlood: FlashFlood,
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

    // Spells
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

    // Normalizers
    cloudburstNormalizer: CloudburstNormalizer,
    riptideNormalizer: RiptideNormalizer,

    // Conduits
    embraceOfEarth: EmbraceOfEarth,
    heavyRainfall: HeavyRainfall,
    swirlingCurrents: SwirlingCurrents,
    naturesFocus: NaturesFocus,
    tumblingWaves: TumblingWaves,

    // Legendaries
    primalTideCore: PrimalTideCore,
    jonatsNaturalFocus: JonatsNaturalFocus,
    earthenHarmony: EarthenHarmony,
    elementalConduit: ElementalConduit,

    // Covenants
    chainHarvest: ChainHarvest,
    primordialWave: PrimordialWave,
  };
}

export default CombatLogParser;
