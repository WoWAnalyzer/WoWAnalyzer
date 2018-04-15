import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CoreChecklist, { Requirement, Rule } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import ComboBreaker from '../Spells/ComboBreaker';
import FistsofFury from '../Spells/FistsofFury';
import SpinningCraneKick from '../Spells/SpinningCraneKick';
import TouchOfKarma from '../Spells/TouchOfKarma';
import ComboStrikes from '../Spells/ComboStrikes';
import BlackoutKick from '../Spells/BlackoutKick';

import HitCombo from '../Talents/HitCombo';
import EnergizingElixir from '../Talents/EnergizingElixir';
import ChiDetails from '../Chi/ChiDetails';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    abilityTracker: AbilityTracker,

    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    hitCombo: HitCombo,
    energizingElixir: EnergizingElixir,
    chiDetails: ChiDetails,
  };
  rules = [
    new Rule({
      name: 'Use core abilities as often as possible',
      description: <Wrapper>Spells with short cooldowns like <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> and <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> should be used as often as possible.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.STRIKE_OF_THE_WINDLORD,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RISING_SUN_KICK,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FISTS_OF_FURY_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.WHIRLING_DRAGON_PUNCH_TALENT,
            when: combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CHI_WAVE_TALENT,
            when: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your procs and short CDs',
      description: <Wrapper>Make sure to use your procs and spells at the correct time. Wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs and not hitting all your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> ticks is a loss of potential damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs used </Wrapper>,
            check: () => this.comboBreaker.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Average ticks hit with <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /></Wrapper>,
            check: () => this.fistsofFury.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns effectively',
      description: <Wrapper>Your cooldowns have a big impact on your damage output. Make sure you use them as much as possible. <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> is both a defensive and offensive cooldown, but is mostly used offensively.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.STORM_EARTH_AND_FIRE_CAST,
            when: !combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SERENITY_TALENT,
            when: combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOUCH_OF_DEATH,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOUCH_OF_KARMA_CAST,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <Wrapper> Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used</Wrapper>,
            check: () => this.touchOfKarma.suggestionThresholds,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
            when: combatant.hasTalent(SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Manage your resources',
      description: <Wrapper>Windwalker is heavily dependent on having enough Chi to cast your core spells on cooldown. Wasting Chi either by generating while capped or using <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> and <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> too much will cause you to delay your hard hitting Chi spenders and lose damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Chi Wasted per minute',
            check: () => this.chiDetails.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> casts per minute</Wrapper>,
            check: () => this.blackoutKick.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> casts</Wrapper>,
            check: () => this.spinningCraneKick.suggestionThresholds,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ENERGIZING_ELIXIR_TALENT,
            when: this.energizingElixir.active,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Don\'t break mastery',
      description: <Wrapper>Using the same damaging ability twice in a row will lose mastery benefit on the second cast and drop the <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> buff if specced.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Times <SpellLink id={SPELLS.COMBO_STRIKES.id} /> was broken </Wrapper>,
            check: () => this.comboStrikes.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper> <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> uptime </Wrapper>,
            check: () => this.hitCombo.suggestionThresholds,
            when: this.hitCombo.active,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your defensive cooldowns effectively',
      description: <Wrapper>Make sure you use your defensive cooldowns at appropriate times throughout the fight. Make sure to use <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> as much as possible to maximize its offensive benefit and use <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} />/<SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id} /> for dangerous periods of damage intake.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DIFFUSE_MAGIC_TALENT,
            when: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DAMPEN_HARM_TALENT,
            when: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_ELIXIR_TALENT,
            when: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOUCH_OF_KARMA_CAST,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <Wrapper> Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used</Wrapper>,
            check: () => this.touchOfKarma.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
