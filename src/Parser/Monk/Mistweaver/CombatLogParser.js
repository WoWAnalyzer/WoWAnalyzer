import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';
import MonkSpreadsheet from 'Main/MonkSpreadsheet';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import GlobalCooldown from './Modules/Core/GlobalCooldown';
import Channeling from './Modules/Core/Channeling';

// Features
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import EssenceFontMastery from './Modules/Features/EssenceFontMastery';
import Checklist from './Modules/Features/Checklist';
import StatValues from './Modules/Features/StatValues';

// Traits

// Spells
import UpliftingTrance from './Modules/Spells/UpliftingTrance';
import ThunderFocusTea from './Modules/Spells/ThunderFocusTea';
import EssenceFont from './Modules/Spells/EssenceFont';
import EnvelopingMists from './Modules/Spells/EnvelopingMists';
import SoothingMist from './Modules/Spells/SoothingMist';

// Talents
import ChiJi from './Modules/Talents/ChiJi';
import ChiBurst from './Modules/Talents/ChiBurst';
import ManaTea from './Modules/Talents/ManaTea';
import RefreshingJadeWind from './Modules/Talents/RefreshingJadeWind';
import Lifecycles from './Modules/Talents/Lifecycles';
import SpiritOfTheCrane from './Modules/Talents/SpiritOfTheCrane';

// Items

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Core
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    essenceFontMastery: EssenceFontMastery,
    checklist: Checklist,
    statValues: StatValues,

    // Traits

    // Spells
    essenceFont: EssenceFont,
    thunderFocusTea: ThunderFocusTea,
    upliftingTrance: UpliftingTrance,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist,

    // Talents
    chiBurst: ChiBurst,
    chiJi: ChiJi,
    manaTea: ManaTea,
    refreshingJadeWind: RefreshingJadeWind,
    lifecycles: Lifecycles,
    spiritOfTheCrane: SpiritOfTheCrane,

    // Legendaries / Items:

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
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab title="Player Log Data" style={{ padding: '15px 22px 15px 15px' }}>
            <MonkSpreadsheet parser={this} />
          </Tab>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
