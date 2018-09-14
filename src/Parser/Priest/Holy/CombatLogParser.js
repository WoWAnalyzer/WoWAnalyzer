import React from 'react';

import Tab from 'Interface/Others/Tab';
import HolyPriestSpreadsheet from 'Interface/Others/HolyPriestSpreadsheet';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Abilities from './Modules/Abilities';

import SpellManaCost from './Modules/Core/SpellManaCost';
// Spell data
import DivineHymn from './Modules/Spells/DivineHymn';
import HolyWordSanctify from './Modules/Spells/HolyWordSanctify';
import SpiritOfRedemption from './Modules/Spells/SpiritOfRedemption';
import HymnBuffBenefit from './Modules/Spells/HymnBuffBenefit';
//Talents
import TrailOfLight from './Modules/Talents/TrailOfLight';
import CosmicRipple from './Modules/Talents/CosmicRipple';
import Perseverance from './Modules/Talents/Perseverance';
import EnduringRenewal from './Modules/Talents/EnduringRenewal';
// Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Checklist from './Modules/Checklist/Module';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import SpellUsable from './Modules/Features/SpellUsable';
import HealingReceived from './Modules/Features/HealingReceived';
// Priest Core
import EchoOfLight_Mastery from './Modules/PriestCore/EchoOfLight_Mastery';
import SerendipityWastedAmounts from './Modules/PriestCore/HolyWords/SerendipityWastedAmounts';
import SanctifyReduction from './Modules/PriestCore/HolyWords/ReductionCalculators/SanctifyReduction';
import SerenityReduction from './Modules/PriestCore/HolyWords/ReductionCalculators/SerenityReduction';
import HolyWordsReduction from './Modules/PriestCore/HolyWords/ReductionCalculators/HolyWordsReduction';
import Fortitude_RaidBuff from './Modules/PriestCore/Fortitude_RaidBuff';
import HolyWordsReductionBySpell from './Modules/PriestCore/HolyWords/HolyWordsReductionBySpell';


import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    spellManaCost: SpellManaCost,
    healingDone: [HealingDone, { showStatistic: true }],
    abilities: Abilities,
    lowHealthHealing: LowHealthHealing,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    healingReceived: HealingReceived,

    // Core
    echoOfLight_Mastery: EchoOfLight_Mastery,
    serendipityWastedAmounts: SerendipityWastedAmounts,
    sanctifyReduction: SanctifyReduction,
    serenityReduction: SerenityReduction,
    holyWordsReduction: HolyWordsReduction,
    fortitude_RaidBuff: Fortitude_RaidBuff,
    holyWordsReductionBySpell: HolyWordsReductionBySpell,

    // Spells
    divineHymn: DivineHymn,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWordSanctify: HolyWordSanctify,
    spiritOfRedemption: SpiritOfRedemption,

    // Talents
    trailOfLight: TrailOfLight,
    cosmicRipple: CosmicRipple,
    perseverance: Perseverance,
    enduringRenewal: EnduringRenewal,
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
            <HolyPriestSpreadsheet parser={this} />
          </Tab>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
