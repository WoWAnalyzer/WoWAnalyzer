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
import Sanctify from './Modules/Spells/Sanctify';
import SpiritOfRedemption from './Modules/Spells/SpiritOfRedemption';
//Talents
import TrailOfLight from './Modules/Talents/TrailOfLight';
import CosmicRipple from './Modules/Talents/CosmicRipple';
import Perseverance from './Modules/Talents/Perseverance';
// Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Checklist from './Modules/Checklist/Module';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import SpellUsable from './Modules/Features/SpellUsable';
import HealingReceived from './Modules/Features/HealingReceived';
// Priest Core
import EnduringRenewal from './Modules/Talents/EnduringRenewal';
import EchoOfLight from './Modules/PriestCore/EchoOfLight';
import Serendipity from './Modules/PriestCore/Serendipity';
import SanctifyReduction from './Modules/PriestCore/SerendipityReduction/SanctifyReduction';
import SerenityReduction from './Modules/PriestCore/SerendipityReduction/SerenityReduction';
import HymnBuffBenefit from './Modules/PriestCore/HymnBuffBenefit';
import HolyWords from './Modules/PriestCore/HolyWords';
import Fortitude from './Modules/PriestCore/Fortitude';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';
// Azerite
import BlessedSanctuary from './Modules/Spells/AzeriteTraits/BlessedSanctuary';
import EverlastingLight from './Modules/Spells/AzeriteTraits/EverlastingLight';
import PermiatingGlow from './Modules/Spells/AzeriteTraits/PermeatingGlow';
import PrayerfulLitany from './Modules/Spells/AzeriteTraits/PrayerfulLitany';
import SacredFlame from './Modules/Spells/AzeriteTraits/SacredFlame';
import WordOfMending from './Modules/Spells/AzeriteTraits/WordOfMending';
import Sanctum from '../Shared/Modules/Spells/AzeriteTraits/Sanctum';
import TwistMagic from '../Shared/Modules/Spells/AzeriteTraits/TwistMagic';

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
    enduringRenewal: EnduringRenewal,
    echoOfLight: EchoOfLight,
    serendipity: Serendipity,
    sancReduction: SanctifyReduction,
    sereReduction: SerenityReduction,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWords: HolyWords,
    fortitude: Fortitude,

    // Spells
    divineHymn: DivineHymn,
    sanctify: Sanctify,
    spiritOfRedemption: SpiritOfRedemption,

    // Talents
    trailOfLight: TrailOfLight,
    cosmicRipple: CosmicRipple,
    perseverance: Perseverance,

    // Azerite
    blessedSanctuary: BlessedSanctuary,
    everlastingLight: EverlastingLight,
    permiatingGlow: PermiatingGlow,
    prayerfulLitany: PrayerfulLitany,
    sacredFlame: SacredFlame,
    wordOfMending: WordOfMending,
    sanctum: Sanctum,
    twistMagic: TwistMagic,
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
