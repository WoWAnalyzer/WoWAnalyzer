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
import Renew from './Modules/Spells/Renew';
import PrayerOfMending from './Modules/Spells/PrayerOfMending';
//Talents
import Talents from './Modules/Talents';
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
    renew: Renew,
    prayerOfMending: PrayerOfMending,

    // Talents
    Enlightenment: Talents.talents_15.Enlightenment,
    TrailOfLight: Talents.talents_15.TrailOfLight,
    EnduringRenewal: Talents.talents_15.EnduringRenewal,

    AngelicFeather: Talents.talents_30.AngelicFeather,
    AngelsMercy: Talents.talents_30.AngelsMercy,
    Perseverance: Talents.talents_30.Perseverance,

    GuardianAngel: Talents.talents_45.GuardianAngel,
    Afterlife: Talents.talents_45.Afterlife,
    CosmicRipple: Talents.talents_45.CosmicRipple,

    Censure: Talents.talents_60.Censure,
    ShiningForce: Talents.talents_60.ShiningForce,
    PsychicVoice: Talents.talents_60.PsychicVoice,

    SurgeOfLight: Talents.talents_75.SurgeOfLight,
    CircleOfHealing: Talents.talents_75.CircleOfHealing,
    BindingHeal: Talents.talents_75.BindingHeal,

    Halo: Talents.talents_90.Halo,
    Benediction: Talents.talents_90.Benediction,
    DivineStar: Talents.talents_90.DivineStar,

    LightOfTheNaru: Talents.talents_100.LightOfTheNaru,
    HolyWordSalvation: Talents.talents_100.HolyWordSalvation,
    Apotheosis: Talents.talents_100.Apotheosis,

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
