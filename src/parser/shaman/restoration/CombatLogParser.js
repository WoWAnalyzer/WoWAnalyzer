import React from 'react';

import Tab from 'interface/others/Tab';
import RestorationShamanSpreadsheet from 'interface/others/RestorationShamanSpreadsheet';
import Feeding from 'interface/others/Feeding';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import HealingEfficiencyTracker from './modules/core/HealingEfficiencyTracker';
import Abilities from './modules/Abilities';

import HealingDone from './modules/core/HealingDone';
import ShamanAbilityTracker from './modules/core/ShamanAbilityTracker';
import HealingRainLocation from './modules/core/HealingRainLocation';
import Spreadsheet from './modules/core/Spreadsheet';

import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
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
import Undulation from './modules/talents/Undulation';
import FlashFlood from './modules/talents/FlashFlood';
import EarthShield from './modules/talents/EarthShield';
import AncestralVigor from './modules/talents/AncestralVigor';
import EarthenWallTotem from './modules/talents/EarthenWallTotem';
import Downpour from './modules/talents/Downpour';
import CloudburstTotem from './modules/talents/CloudburstTotem';
import Ascendance from './modules/talents/Ascendance';
import Wellspring from './modules/talents/Wellspring';
import HighTide from './modules/talents/HighTide';
import NaturesGuardian from './modules/talents/NaturesGuardian';
// Spells
import ChainHeal from './modules/spells/ChainHeal';
import HealingSurge from './modules/spells/HealingSurge';
import HealingRain from './modules/spells/HealingRain';
import HealingWave from './modules/spells/HealingWave';
import LavaSurge from './modules/spells/LavaSurge';
import Resurgence from './modules/spells/Resurgence';
//Azerite
import BaseHealerAzerite from './modules/azerite/BaseHealerAzerite';
import SwellingStream from './modules/azerite/SwellingStream';
import EbbAndFlow from './modules/azerite/EbbAndFlow';
import SoothingWaters from './modules/azerite/SoothingWaters';
// Shared
import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';

import CloudburstNormalizer from './normalizers/CloudburstNormalizer';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Override the ability tracker so we also get stats for Tidal Waves and beacon healing
    abilityTracker: ShamanAbilityTracker,
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],
    abilities: Abilities,
    healingRainLocation: HealingRainLocation,
    spreadsheet: Spreadsheet,
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    cooldownThroughputTracker: CooldownThroughputTracker,
    tidalWaves: TidalWaves,
    castBehavior: CastBehavior,
    checklist: Checklist,
    spellUsable: SpellUsable,
    statValues: StatValues,

    // Talents:
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    deluge: Deluge,
    flashFlood: FlashFlood,
    earthShield: EarthShield,
    ancestralVigor: AncestralVigor,
    earthenWallTotem: EarthenWallTotem,
    downpour: Downpour,
    cloudburstTotem: CloudburstTotem,
    ascendance: Ascendance,
    wellspring: Wellspring,
    highTide: HighTide,
    naturesGuardian: NaturesGuardian,
    talentStatisticBox: TalentStatisticBox,

    // Spells:
    chainHeal: ChainHeal,
    healingSurge: HealingSurge,
    healingRain: HealingRain,
    healingWave: HealingWave,
    lavaSurge: LavaSurge,
    resurgence: Resurgence,

    // Azerite
    baseHealerAzerite: BaseHealerAzerite,
    swellingStream: SwellingStream,
    ebbAndFlow: EbbAndFlow,
    soothingWaters: SoothingWaters,

    // Shared:
    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,

    // Normalizers:
    cloudburstNormalizer: CloudburstNormalizer,
  };

  generateResults(...args) {
    const results = super.generateResults(...args);

    results.tabs = [
      ...results.tabs,
      {
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab style={{ padding: '15px 22px 15px 15px' }}>
            <RestorationShamanSpreadsheet parser={this} />
          </Tab>
        ),
      },
      {
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <Tab style={{ padding: 0 }}>
            <Feeding
              cooldownThroughputTracker={this._modules.cooldownThroughputTracker}
            />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
