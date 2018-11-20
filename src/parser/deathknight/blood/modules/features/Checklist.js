import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/core/modules/Abilities';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';

import BoneShield from './BoneShield';
import BloodPlagueUptime from './BloodPlagueUptime';
import AlwaysBeCasting from './AlwaysBeCasting';
import CrimsonScourge from './CrimsonScourge';
import MarrowrendUsage from './MarrowrendUsage';
import DeathsCaress from '../core/DeathsCaress';

import BoneStorm from '../talents/Bonestorm';
import MarkOfBloodUptime from '../talents/MarkOfBlood';
import Ossuary from '../talents/Ossuary';
import RuneStrike from '../talents/RuneStrike';
import Consumption from '../talents/Consumption';

import RunicPowerDetails from '../runicpower/RunicPowerDetails';
import RuneTracker from '../../../shared/RuneTracker';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    prePotion: PrePotion,
    bloodplagueUptime: BloodPlagueUptime,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,
    boneShield: BoneShield,
    ossuary: Ossuary,
    runeStrike: RuneStrike,
    deathsCaress: DeathsCaress,

    bonestorm: BoneStorm,
    consumption: Consumption,
    markOfBloodUptime: MarkOfBloodUptime,

    crimsonScourge: CrimsonScourge,
    marrowrendUsage: MarrowrendUsage,

    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  rules = [
    new Rule({
      name: 'Use your short cooldowns',
      description: 'These should generally always be recharging to maximize efficiency.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOOD_BOIL,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEATH_AND_DECAY,
            when: this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> procs spent</>,
            check: () => this.crimsonScourge.efficiencySuggestionThresholds,
            when: !this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLOODDRINKER_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RUNE_STRIKE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id),
          }),
        ];
      },
    }),

        new Rule({
      name: 'Do not overcap your resources',
      description: 'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities. Try to spend Runic Power before reaching the maximum amount and always keep atleast 3 Runes on cooldown to avoid wasting resources.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Runic Power Efficiency',
            check: () => this.runicPowerDetails.efficiencySuggestionThresholds,
          }),
          new Requirement({
            name: 'Rune Efficiency',
            check: () => this.runeTracker.suggestionThresholdsEfficiency,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.MARROWREND.id} /> Efficiency</>,
            check: () => this.marrowrendUsage.suggestionThresholdsEfficiency,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.RUNE_STRIKE_TALENT.id} /> Efficiency</>,
            check: () => this.runeStrike.cooldownReductionThresholds,
            when: this.selectedCombatant.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.DEATHS_CARESS.id} /> Efficiency</>,
            check: () => this.deathsCaress.averageCastSuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your offensive cooldowns',
      description: 'You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DANCING_RUNE_WEAPON,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <>Possible <SpellLink id={SPELLS.CONSUMPTION_TALENT.id} /> hits</>,
            check: () => this.consumption.hitSuggestionThreshold,
            when: this.selectedCombatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id),
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.BONESTORM_TALENT.id} /> efficiency</>,
            check: () => this.bonestorm.suggestionThresholds,
            when: this.selectedCombatant.hasTalent(SPELLS.BONESTORM_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maintain your buffs and debuffs',
      description: 'It is important to maintain these as they contribute a large amount to your DPS and HPS.',
      requirements: () => {
        return [
          new Requirement({
            name: <><SpellLink id={SPELLS.BLOOD_PLAGUE.id} /> Uptime</>,
            check: () => this.bloodplagueUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> Uptime</>,
            when: this.selectedCombatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id),
            check: () => this.markOfBloodUptime.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.BONE_SHIELD.id} /> Uptime</>,
            check: () => this.boneShield.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.OSSUARY.id} /> Uptime</>,
            when: this.selectedCombatant.hasTalent(SPELLS.OSSUARY_TALENT.id),
            check: () => this.ossuary.uptimeSuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive cooldowns',
      description: 'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VAMPIRIC_BLOOD,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ICEBOUND_FORTITUDE,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ANTI_MAGIC_SHELL,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RUNE_TAP_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.RUNE_TAP_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOMBSTONE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id),
          }),
        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
