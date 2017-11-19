/*
  TODO:
  Remove Spirit Link Damage from Overall Healing

*/

import React from 'react';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';
import Feeding from 'Main/Feeding';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import ShamanAbilityTracker from './Modules/ShamanCore/ShamanAbilityTracker';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Abilities from './Modules/Features/Abilities';

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

import ChainHeal from './Modules/Spells/ChainHeal';
import HealingSurge from './Modules/Spells/HealingSurge';
import GiftOfTheQueen from './Modules/Spells/GiftOfTheQueen';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Override the ability tracker so we also get stats for Tidal Waves and beacon healing
    abilityTracker: ShamanAbilityTracker,
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    masteryEffectiveness: MasteryEffectiveness,
    highTide: HighTide,
    cooldownThroughputTracker: CooldownThroughputTracker,
    ancestralVigor: AncestralVigor,
    abilities: Abilities,
    tidalWaves: TidalWaves,
    castBehavior: CastBehavior,

    // Talents:
    earthenShieldTotem: EarthenShieldTotem,

    // Items:
    nobundo: Nobundo,
    nazjatar: Nazjatar,
    uncertainReminder: UncertainReminder,
    jonat: Jonat,
    tidecallers: Tidecallers,
    t19_2Set: Restoration_Shaman_T19_2Set,
    t20_4Set: Restoration_Shaman_T20_4Set,
    roots: Roots,

    // Spells:
    chainHeal: ChainHeal,
    giftOfTheQueen: GiftOfTheQueen,
    healingSurge: HealingSurge,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      ...results.tabs,
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      {
        title: 'Feeding',
        url: 'feeding',
        render: () => (
          <Tab title="Feeding" style={{ padding: 0 }}>
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
