import React from 'react';

import Tab from 'Interface/Others/Tab';
import Feeding from 'Interface/Others/Feeding';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import Abilities from './Modules/Abilities';

import HealingDone from './Modules/ShamanCore/HealingDone';
import ShamanAbilityTracker from './Modules/ShamanCore/ShamanAbilityTracker';
import HealingRainLocation from './Modules/ShamanCore/HealingRainLocation';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist/Module';
import SpellUsable from './Modules/Features/SpellUsable';
import StatValues from './Modules/Features/StatValues';

import AncestralVigor from './Modules/Features/AncestralVigor';
import TidalWaves from './Modules/Features/TidalWaves';
import CastBehavior from './Modules/Features/CastBehavior';
// Talents
import TalentStatisticBox from './Modules/Talents/TalentStatisticBox';
import Torrent from './Modules/Talents/Torrent';
import UnleashLife from './Modules/Talents/UnleashLife';
import Deluge from './Modules/Talents/Deluge';
import Undulation from './Modules/Talents/Undulation';
import FlashFlood from './Modules/Talents/FlashFlood';
import EarthShield from './Modules/Talents/EarthShield';
import EarthenWallTotem from './Modules/Talents/EarthenWallTotem';
import Downpour from './Modules/Talents/Downpour';
import CloudburstTotem from './Modules/Talents/CloudburstTotem';
import Ascendance from './Modules/Talents/Ascendance';
import Wellspring from './Modules/Talents/Wellspring';
import HighTide from './Modules/Talents/HighTide';
import NaturesGuardian from './Modules/Talents/NaturesGuardian';
// Spells
import ChainHeal from './Modules/Spells/ChainHeal';
import HealingSurge from './Modules/Spells/HealingSurge';
import HealingRain from './Modules/Spells/HealingRain';
import HealingWave from './Modules/Spells/HealingWave';
import LavaSurge from './Modules/Spells/LavaSurge';
import Resurgence from './Modules/Spells/Resurgence';
// Shared
import StaticCharge from '../Shared/Talents/StaticCharge';

import CloudburstNormalizer from './Normalizers/CloudburstNormalizer';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Override the ability tracker so we also get stats for Tidal Waves and beacon healing
    abilityTracker: ShamanAbilityTracker,
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],
    abilities: Abilities,
    healingRainLocation: HealingRainLocation,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    cooldownThroughputTracker: CooldownThroughputTracker,
    ancestralVigor: AncestralVigor,
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

    // Shared:
    staticCharge: StaticCharge,

    // Normalizers:
    cloudburstNormalizer: CloudburstNormalizer,
  };

  generateResults(...args) {
    const results = super.generateResults(...args);

    results.tabs = [
      ...results.tabs,
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
