import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

import SpellManaCost from './Modules/Core/SpellManaCost';

// General Core
import HealingDone from './Modules/Core/HealingDone';

// Spell data
import PrayerOfMending from './Modules/Spells/PrayerOfMending';
import DivineHymn from './Modules/Spells/DivineHymn';
import Sanctify from './Modules/Spells/Sanctify';

// Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';

// Priest Core
import RenewTheFaith from './Modules/PriestCore/RenewTheFaith';
import Divinity from './Modules/PriestCore/Divinity';
import LightOfTuure from './Modules/PriestCore/LightOfTuure';
import EnduringRenewal from './Modules/PriestCore/EnduringRenewal';

// Items
import TrousersOfAnjuna from './Modules/Items/TrousersOfAnjuna';
import XanshiCloak from './Modules/Items/XanshiCloak';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

// Imports that will likely be used in the future but currently unused (go away npm warnings)
// import ItemLink from 'common/ItemLink';
// import PlayerBreakdownTab from 'Main/PlayerBreakdownTab';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}

function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    spellManaCost: SpellManaCost,
    healingDone: HealingDone,
    castEfficiency: CastEfficiency,
    lowHealthHealing: LowHealthHealing,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    renewTheFaith: RenewTheFaith,
    divinity: Divinity,
    lightOfTuure: LightOfTuure,
    enduringRenewal: EnduringRenewal,

    // Spells
    prayerOfMending: PrayerOfMending,
    divineHymn: DivineHymn,
    sanctify: Sanctify,

    // Items
    trousersOfAnjuna: TrousersOfAnjuna,
    xanshiCloak: XanshiCloak,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;
    const nonHealingTimePercentage = this.modules.alwaysBeCasting.totalHealingTimeWasted / fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    // Leggo Legs vars
    const legsPercHPS = formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.trousersOfAnjuna.healing));
    const legsHPS = formatNumber(this.modules.trousersOfAnjuna.healing / this.fightDuration * 1000);

    // Leggo cloak (Xan'shi) vars
    const cloakPercHPS = formatPercentage(this.getPercentageOfTotalHealingDone(this.modules.xanshiCloak.healing));
    const cloakHPS = formatNumber(this.modules.xanshiCloak.healing / this.fightDuration * 1000);

    results.statistics = [
      ...results.statistics,
    ];

    results.items = [
      ...results.items,
      this.modules.trousersOfAnjuna.active && {
        item: ITEMS.ENTRANCING_TROUSERS_OF_ANJUNA,
        result: (
          <span>
            { legsPercHPS } % / { legsHPS } HPS
          </span>
        ),
      },
      this.modules.xanshiCloak.active && {
        item: ITEMS.XANSHI_CLOAK,
        result: (
          <dfn data-tip="Value of spells cast during the cloak's buff. Does not assume all healing after cloak ends would be a result of the cloak.">
            { cloakPercHPS } % / { cloakHPS } HPS / { formatNumber(this.modules.xanshiCloak.manaSaved) } mana saved
          </dfn>
        ),
      },
    ];

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
