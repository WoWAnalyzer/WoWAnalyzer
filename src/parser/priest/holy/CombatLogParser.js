import React from 'react';

import Tab from 'interface/others/Tab';
import HolyPriestSpreadsheet from 'interface/others/HolyPriestSpreadsheet';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import HealingDone from 'parser/shared/modules/HealingDone';
import Abilities from './modules/Abilities';

import SpellManaCost from './modules/core/SpellManaCost';
// Spell data
import DivineHymn from './modules/spells/DivineHymn';
import HolyWordSanctify from './modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from './modules/spells/holyword/HolyWordSerenity';
import HolyWordChastise from './modules/spells/holyword/HolyWordChastise';
import HolyWordSalvationCooldown from './modules/spells/holyword/HolyWordSalvation';
import SpiritOfRedemption from './modules/spells/SpiritOfRedemption';
import HymnBuffBenefit from './modules/spells/HymnBuffBenefit';
import Renew from './modules/spells/Renew';
import PrayerOfMending from './modules/spells/PrayerOfMending';
//Talents
import Talents from './modules/talents';
// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import HealingReceived from './modules/features/HealingReceived';
import HealingTargetTracker from './modules/features/HealingTargetTracker';
// Priest Core
import EchoOfLight_Mastery from './modules/core/EchoOfLight_Mastery';
import Fortitude_RaidBuff from './modules/core/Fortitude_RaidBuff';
import HolyWordsReductionBySpell from './modules/core/HolyWordsReductionBySpell';
import HolyWordWastedAmounts from './modules/core/HolyWordWastedAmounts';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
// Azerite
import BlessedSanctuary from './modules/spells/azeritetraits/BlessedSanctuary';
import EverlastingLight from './modules/spells/azeritetraits/EverlastingLight';
import PermiatingGlow from './modules/spells/azeritetraits/PermeatingGlow';
import PrayerfulLitany from './modules/spells/azeritetraits/PrayerfulLitany';
import WordOfMending from './modules/spells/azeritetraits/WordOfMending';
import Sanctum from '../shared/modules/spells/azeritetraits/Sanctum';
import TwistMagic from '../shared/modules/spells/azeritetraits/TwistMagic';
import PromiseOfDeliverance from './modules/spells/azeritetraits/PromiseOfDeliverance';
import DeathDenied from '../shared/modules/spells/azeritetraits/DeathDenied';

// Mana Tracker
import HealingEfficiencyDetails from '../../core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HolyPriestHealingEfficiencyTracker';
import ManaTracker from '../../core/healingEfficiency/ManaTracker';

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
    healingTargetTracker: HealingTargetTracker,

    // Core
    echoOfLight_Mastery: EchoOfLight_Mastery,
    fortitude_RaidBuff: Fortitude_RaidBuff,
    holyWordsReductionBySpell: HolyWordsReductionBySpell,
    holyWordWastedAmounts: HolyWordWastedAmounts,

    // Spells
    divineHymn: DivineHymn,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWordSanctify: HolyWordSanctify,
    holyWordSerenity: HolyWordSerenity,
    holyWordChastise: HolyWordChastise,
    holyWordSalvation: HolyWordSalvationCooldown,

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

    LightOfTheNaru: Talents.talents_100.LightOfTheNaaru,
    HolyWordSalvation: Talents.talents_100.HolyWordSalvation,
    Apotheosis: Talents.talents_100.Apotheosis,

    // Azerite
    blessedSanctuary: BlessedSanctuary,
    everlastingLight: EverlastingLight,
    permiatingGlow: PermiatingGlow,
    prayerfulLitany: PrayerfulLitany,
    wordOfMending: WordOfMending,
    sanctum: Sanctum,
    twistMagic: TwistMagic,
    promiseOfDeliverance: PromiseOfDeliverance,
    deathDenied: DeathDenied,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,
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
