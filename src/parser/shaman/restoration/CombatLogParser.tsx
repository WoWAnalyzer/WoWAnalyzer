import React from 'react';

import Panel from 'interface/others/Panel';
import Feeding from 'interface/others/Feeding';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import AlwaysBeCasting from 'parser/shaman/restoration/modules/features/AlwaysBeCasting';

import HealingEfficiencyDetails from './modules/core/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/core/HealingEfficiencyTracker';
import Abilities from './modules/Abilities';

import HealingDone from './modules/core/HealingDone';
import HealingRainLocation from './modules/core/HealingRainLocation';
import RestorationAbilityTracker from './modules/core/RestorationAbilityTracker';

import MasteryEffectiveness from './modules/features/MasteryEffectiveness';

import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/checklist/Module';
import SpellUsable from './modules/features/SpellUsable';
import StatValues from './modules/features/StatValues';

import TidalWaves from './modules/features/TidalWaves';
import CastBehavior from './modules/features/CastBehavior';
// Talents
import TalentStatisticBox from './modules/talents/TalentStatisticBox';
import Torrent from './modules/talents/Torrent';
import UnleashLife from './modules/talents/UnleashLife';
import Deluge from './modules/talents/Deluge';
import SurgeOfEarth from './modules/talents/SurgeOfEarth';
import Undulation from './modules/talents/Undulation';
import FlashFlood from './modules/talents/FlashFlood';
import AncestralVigor from './modules/talents/AncestralVigor';
import EarthenWallTotem from './modules/talents/EarthenWallTotem';
import Downpour from './modules/talents/Downpour';
import CloudburstTotem from './modules/talents/CloudburstTotem';
import Ascendance from './modules/talents/Ascendance';
import Wellspring from './modules/talents/Wellspring';
import HighTide from './modules/talents/HighTide';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import AncestralProtectionTotem from './modules/talents/AncestralProtectionTotem';
// Spells
import ChainHeal from './modules/spells/ChainHeal';
import HealingSurge from './modules/spells/HealingSurge';
import HealingRain from './modules/spells/HealingRain';
import HealingWave from './modules/spells/HealingWave';
import LavaSurge from './modules/spells/LavaSurge';
import Resurgence from './modules/spells/Resurgence';
import ManaTideTotem from './modules/spells/ManaTideTotem';
import WaterShield from './modules/spells/WaterShield';
import SpiritLinkDamageReduction from './modules/spells/SpiritLinkDamageReduction';
// Potency Conduits
import EmbraceOfEarth from './modules/shadowlands/conduits/EmbraceOfEarth';
import HeavyRainfall from './modules/shadowlands/conduits/HeavyRainfall';
import SwirlingCurrents from './modules/shadowlands/conduits/SwirlingCurrents';
import NaturesFocus from './modules/shadowlands/conduits/NaturesFocus';
// Legendaries
import PrimalTideCore from './modules/shadowlands/legendaries/PrimalTideCore';
import JonatsNaturalFocus from './modules/shadowlands/legendaries/JonatsNaturalFocus';
import EarthenHarmony from './modules/shadowlands/legendaries/EarthenHarmony';
// Covenants
import ChainHarvest from './modules/shadowlands/spells/ChainHarvest';
import PrimordialWave from './modules/shadowlands/spells/PrimordialWave';
// Shared
import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';
import EarthShield from './modules/spells/EarthShield'; // technically shared
import AstralShift from '../shared/spells/AstralShift';

import CloudburstNormalizer from './normalizers/CloudburstNormalizer';
import RiptideNormalizer from './normalizers/RiptideNormalizer';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

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
    statValues: StatValues,

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

    // Legendaries
    primalTideCore: PrimalTideCore,
    jonatsNaturalFocus: JonatsNaturalFocus,
    earthenHarmony: EarthenHarmony,

    // Covenants
    chainHarvest: ChainHarvest,
    primordialWave: PrimordialWave,
  };

  generateResults(options: any) {
    const results = super.generateResults(options);

    results.tabs = [
      ...results.tabs,
      {
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <Panel style={{ padding: 0 }}>
            <Feeding
              cooldownThroughputTracker={this.getModule(CooldownThroughputTracker)}
            />
          </Panel>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
