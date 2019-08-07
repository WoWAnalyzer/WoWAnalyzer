import React from 'react';

import Panel from 'interface/others/Panel';
import HolyPriestSpreadsheet from 'interface/others/HolyPriestSpreadsheet';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/Abilities';

import SpellManaCost from './modules/core/SpellManaCost';
// Spell data
import DivineHymn from './modules/spells/DivineHymn';
import GuardianSpirit from './modules/spells/GuardianSpirit';
import HolyNova from './modules/spells/HolyNova';
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
import EchoOfLightMastery from './modules/core/EchoOfLightMastery';
import FortitudeRaidBuff from './modules/core/FortitudeRaidBuff';
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
import LoyalToTheEnd from '../../shared/modules/spells/bfa/azeritetraits/LoyalToTheEnd';

// Mana Tracker
import HealingEfficiencyDetails from './modules/features/HolyPriestHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HolyPriestHealingEfficiencyTracker';
import ManaTracker from '../../core/healingEfficiency/ManaTracker';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    spellManaCost: SpellManaCost,
    abilities: Abilities,
    lowHealthHealing: LowHealthHealing,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    healingReceived: HealingReceived,
    healingTargetTracker: HealingTargetTracker,

    // Core
    echoOfLightMastery: EchoOfLightMastery,
    fortitudeRaidBuff: FortitudeRaidBuff,
    holyWordsReductionBySpell: HolyWordsReductionBySpell,
    holyWordWastedAmounts: HolyWordWastedAmounts,

    // Spells
    divineHymn: DivineHymn,
    guardianSpirit: GuardianSpirit,
    holyNova: HolyNova,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWordSanctify: HolyWordSanctify,
    holyWordSerenity: HolyWordSerenity,
    holyWordChastise: HolyWordChastise,
    holyWordSalvation: HolyWordSalvationCooldown,

    spiritOfRedemption: SpiritOfRedemption,
    renew: Renew,
    prayerOfMending: PrayerOfMending,

    // Talents
    Enlightenment: Talents.t15.Enlightenment,
    TrailOfLight: Talents.t15.TrailOfLight,
    EnduringRenewal: Talents.t15.EnduringRenewal,

    AngelicFeather: Talents.t30.AngelicFeather,
    AngelsMercy: Talents.t30.AngelsMercy,
    Perseverance: Talents.t30.Perseverance,

    GuardianAngel: Talents.t45.GuardianAngel,
    Afterlife: Talents.t45.Afterlife,
    CosmicRipple: Talents.t45.CosmicRipple,

    Censure: Talents.t60.Censure,
    ShiningForce: Talents.t60.ShiningForce,
    PsychicVoice: Talents.t60.PsychicVoice,

    SurgeOfLight: Talents.t75.SurgeOfLight,
    CircleOfHealing: Talents.t75.CircleOfHealing,
    BindingHeal: Talents.t75.BindingHeal,

    Halo: Talents.t90.Halo,
    Benediction: Talents.t90.Benediction,
    DivineStar: Talents.t90.DivineStar,

    LightOfTheNaru: Talents.t100.LightOfTheNaaru,
    HolyWordSalvation: Talents.t100.HolyWordSalvation,
    Apotheosis: Talents.t100.Apotheosis,

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
    loyalToTheEnd: LoyalToTheEnd,

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
          <Panel style={{ padding: '15px 22px 15px 15px' }}>
            <HolyPriestSpreadsheet parser={this} />
          </Panel>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
