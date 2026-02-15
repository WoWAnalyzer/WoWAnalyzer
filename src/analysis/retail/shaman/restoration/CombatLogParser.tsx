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
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import SpellUsable from './modules/features/SpellUsable';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Talents
import ChainHeal from './modules/spells/ChainHeal';
import EarthShield from './modules/spells/EarthShield'; // technically shared
import HealingRain from './modules/spells/HealingRain';
import HealingWave from './modules/spells/HealingWave';
import LavaSurge from './modules/spells/LavaSurge';
import EarthlivingWeapon from './modules/talents/EarthlivingWeapon';

import Resurgence from './modules/spells/Resurgence';
import SpiritLinkDamageReduction from './modules/spells/SpiritLinkDamageReduction';
import WaterShield from './modules/spells/WaterShield';
import AncestralVigor from './modules/talents/AncestralVigor';
import Ascendance from './modules/talents/Ascendance';
import Deluge from './modules/talents/Deluge';
import Downpour from './modules/talents/Downpour';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import Torrent from './modules/talents/Torrent';
import UnleashLife from './modules/talents/UnleashLife';
import Undercurrent from './modules/talents/Undercurrent';
import NaturesSwiftness from './modules/talents/NaturesSwiftness';
import WhiteWater from './modules/talents/WhiteWater';
import CoalescingWater from './modules/talents/CoalescingWater';
// Hero talents
import SurgingTotem from './modules/talents/totemic/SurgingTotem';
import LivelyTotems from './modules/talents/totemic/LivelyTotems';
import TotemicRebound from './modules/talents/totemic/TotemicRebound';
import AmplificationCore from './modules/talents/totemic/AmplificationCore';
import Oversurge from './modules/talents/totemic/Oversurge';
import Splitstream from './modules/talents/totemic/Splitstream';
import ImbuementMastery from './modules/talents/totemic/ImbuementMastery';
// Spells
// Tiers
// Shared

// Normalizers
import RiptideNormalizer from './normalizers/RiptideNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import UnleashLifeNormalizer from './normalizers/UnleashLifeNormalizer';
import ChainHealNormalizer from './normalizers/ChainHealNormalizer';
import RiptideTracker from './modules/core/RiptideTracker';
import RiptideAttributor from './modules/core/RiptideAttributor';
import EarthlivingTracker from './modules/core/EarthlivingTracker';
import EarthlivingAttributor from './modules/core/EarthlivingAttributor';
import PrimalTideCore from './modules/talents/PrimalTideCore';
import WavespeakersBlessing from './modules/talents/WavespeakersBlessing';
import AncestralReach from './modules/talents/AncestralReach';
import FlowOfTheTides from './modules/talents/FlowOfTheTides';
import EarthShieldBreakdown from './modules/features/EarthShieldBreakdown';
import EarthenHarmony from './modules/talents/EarthenHarmony';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import Guide from './Guide';
import Riptide from './modules/talents/Riptide';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';
import SurgingTotemPrePullNormalizer from 'analysis/retail/shaman/restoration/normalizers/SurgingTotemPrePullNormalizer';

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
    spellUsable: SpellUsable,
    cooldownThroughputTracker: CooldownThroughputTracker,
    earthShieldBreakdown: EarthShieldBreakdown,

    // Talents
    torrent: Torrent,
    unleashLife: UnleashLife,
    deluge: Deluge,
    ancestralVigor: AncestralVigor,
    downpour: Downpour,
    ascendance: Ascendance,
    naturesGuardian: NaturesGuardian,
    undercurrent: Undercurrent,
    primalTideCore: PrimalTideCore,
    wavespeakersBlessing: WavespeakersBlessing,
    ancestralReach: AncestralReach,
    flowOfTheTides: FlowOfTheTides,
    earthenHarmony: EarthenHarmony,
    manaSpring: ManaSpring,
    naturesSwiftness: NaturesSwiftness,
    whiteWater: WhiteWater,
    coalescingWater: CoalescingWater,
    earthLivingWeapon: EarthlivingWeapon,

    // Hero talents
    surgingTotem: SurgingTotem,
    livelyTotems: LivelyTotems,
    totemicRebound: TotemicRebound,
    amplificationCore: AmplificationCore,
    oversurge: Oversurge,
    splitstream: Splitstream,
    imbuementMastery: ImbuementMastery,

    // Spells
    riptide: Riptide,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
    healingWave: HealingWave,
    lavaSurge: LavaSurge,
    resurgence: Resurgence,

    waterShield: WaterShield,
    spiritLinkDamageReduction: SpiritLinkDamageReduction,

    // Shared
    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,
    astralShift: AstralShift,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,

    // Normalizers
    surgingTotemPrePullNormalizer: SurgingTotemPrePullNormalizer,
    riptideNormalizer: RiptideNormalizer,
    castLinkNormalizer: CastLinkNormalizer,
    unleashLifeNormalizer: UnleashLifeNormalizer,
    chainHealNormalizer: ChainHealNormalizer,
    riptideTracker: RiptideTracker,
    riptideAttributor: RiptideAttributor,
    earthlivingTracker: EarthlivingTracker,
    earthlivingAttributor: EarthlivingAttributor,

    // Tiers

    // Items
  };
  static guide = Guide;
}

export default CombatLogParser;
