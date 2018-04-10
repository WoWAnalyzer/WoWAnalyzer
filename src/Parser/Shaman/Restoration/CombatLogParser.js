import React from 'react';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';
import Feeding from 'Main/Feeding';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import Abilities from './Modules/Abilities';

import HealingDone from './Modules/ShamanCore/HealingDone';
import ShamanAbilityTracker from './Modules/ShamanCore/ShamanAbilityTracker';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist';
import SpellUsable from './Modules/Features/SpellUsable';
import StatValues from './Modules/Features/StatValues';

import AncestralVigor from './Modules/Features/AncestralVigor';
import TidalWaves from './Modules/Features/TidalWaves';
import CastBehavior from './Modules/Features/CastBehavior'; 

import EarthenShieldTotem from './Modules/Talents/EarthenShieldTotem';
import HighTide from './Modules/Talents/HighTide';

import Nazjatar from './Modules/Items/Nazjatar';
import UncertainReminder from './Modules/Items/UncertainReminder';
import Jonat from './Modules/Items/Jonat';
import Nobundo from './Modules/Items/Nobundo';
import Tidecallers from './Modules/Items/Tidecallers';
import Restoration_Shaman_T19_2Set from './Modules/Items/T19_2Set';
import Restoration_Shaman_T20_4Set from './Modules/Items/T20_4Set';
import Roots from './Modules/Items/Roots';
import Restoration_Shaman_T21_2Set from './Modules/Items/T21_2Set';
import Restoration_Shaman_T21_4Set from './Modules/Items/T21_4Set';
import DeceiversGrandDesign from './Modules/Items/DeceiversGrandDesign';
import SeaStarOfTheDepthmother from './Modules/Items/SeaStarOfTheDepthmother';
import ArchiveOfFaith from './Modules/Items/ArchiveOfFaith';
import HighfathersMachination from './Modules/Items/HighfathersMachination';
import EonarsCompassion from './Modules/Items/EonarsCompassion';
import TarratusKeystone from './Modules/Items/TarratusKeystone';
import VelensFutureSight from './Modules/Items/VelensFutureSight';

import ChainHeal from './Modules/Spells/ChainHeal';
import HealingSurge from './Modules/Spells/HealingSurge';
import GiftOfTheQueen from './Modules/Spells/GiftOfTheQueen';
import HealingRain from './Modules/Spells/HealingRain';
import HealingWave from './Modules/Spells/HealingWave';
import LavaSurge from './Modules/Spells/LavaSurge';
import Resurgence from './Modules/Spells/Resurgence';

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
    earthenShieldTotem: EarthenShieldTotem,
    highTide: HighTide,

    // Items:
    nobundo: Nobundo,
    nazjatar: Nazjatar,
    uncertainReminder: UncertainReminder,
    jonat: Jonat,
    tidecallers: Tidecallers,
    t19_2Set: Restoration_Shaman_T19_2Set,
    t20_4Set: Restoration_Shaman_T20_4Set,
    roots: Roots,
    t21_2Set: Restoration_Shaman_T21_2Set,
    t21_4Set: Restoration_Shaman_T21_4Set,
    deceiversGrandDesign: DeceiversGrandDesign,
    seaStarOfTheDepthmother: SeaStarOfTheDepthmother,
    archiveOfFaith: ArchiveOfFaith,
    highfathersMachinations: HighfathersMachination,
    eonarsCompassion: EonarsCompassion,
    tarratusKeystone: TarratusKeystone,
    velensFutureSight: VelensFutureSight,

    // Spells:
    chainHeal: ChainHeal,
    giftOfTheQueen: GiftOfTheQueen,
    healingSurge: HealingSurge,
    healingRain: HealingRain,
    healingWave: HealingWave,
    lavaSurge: LavaSurge,
    resurgence: Resurgence,

    // Normalizers:
    cloudburstNormalizer: CloudburstNormalizer,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      ...results.tabs,
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      {
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <Tab style={{ padding: 0 }}>
            <Feeding
              cooldownThroughputTracker={this.modules.cooldownThroughputTracker}
            />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
