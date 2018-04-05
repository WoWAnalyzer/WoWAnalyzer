import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
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
import TheEmperorsCapacitor from '../Items/TheEmperorsCapacitor';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
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
    theEmperorsCapacitor: TheEmperorsCapacitor,
  };
  rules = [
    new Rule({
      name: 'Use core abilities as often as possible',
      description: <Wrapper>Spells with short cooldowns like <SpellLink id={SPELLS.RISING_SUN_KICK.id} icon /> and <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} icon /> should be used as often as possible.</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.STRIKE_OF_THE_WINDLORD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RISING_SUN_KICK,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FISTS_OF_FURY_CAST,
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
      description: <Wrapper>Make sure to use your procs and spells at the correct time. Wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} icon /> procs and not hitting all your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} icon /> ticks is a loss of potential damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} icon /> procs used </Wrapper>,
            check: () => this.comboBreaker.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Average ticks hit with <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} icon /></Wrapper>,
            check: () => this.fistsofFury.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns effectively',
      description: <Wrapper>Your cooldowns have a big impact on your damage output. Make sure you use them as much as possible. <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id}icon/> is both a defensive and offensive cooldown, but is mostly used offensively.</Wrapper>,
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
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TOUCH_OF_KARMA_CAST,
          }),
          new Requirement({
            name: <Wrapper> Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> used</Wrapper>,
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
      description: <Wrapper>Windwalker is heavily dependent on having enough Chi to cast your core spells on cooldown. Wasting Chi either by generating while capped or using <SpellLink id={SPELLS.BLACKOUT_KICK.id}icon/> and <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id}icon/> too much will cause you to delay your hard hitting Chi spenders and lose damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: 'Chi Wasted per minute',
            check: () => this.chiDetails.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> casts per minute</Wrapper>,
            check: () => this.blackoutKick.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> casts</Wrapper>,
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
      name: "Don't break mastery",
      description: <Wrapper>Using the same damaging ability twice in a row will lose mastery benefit on the second cast and drop the <SpellLink id={SPELLS.HIT_COMBO_TALENT.id}icon/> buff if specced.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Times <SpellLink id={SPELLS.COMBO_STRIKES.id} icon /> was broken </Wrapper>,
            check: () => this.comboStrikes.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper> <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> uptime </Wrapper>,
            check: () => this.hitCombo.suggestionThresholds,
            when: this.hitCombo.active,
          }),
        ];
      },
    }),
    new Rule({
      name: "Use your defensive cooldowns effectively",
      description: <Wrapper>Make sure you use your defensive cooldowns at appropriate times throughout the fight. Make sure to use <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> as much as possible to maximize its offensive benefit and use <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} icon />/<SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id}icon/> for dangerous periods of damage intake.</Wrapper>,
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
          }),
          new Requirement({
            name: <Wrapper> Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> used</Wrapper>,
            check: () => this.touchOfKarma.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'Throughput gain of some legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id}icon/> stacks wasted </Wrapper>,
            check: () => this.theEmperorsCapacitor.wastedStacksSuggestionThresholds,
            when: this.theEmperorsCapacitor.active,
          }),
          new Requirement({
            name: <Wrapper>Average <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} icon /> stacks used on your <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} /></Wrapper>,
            check: () => this.theEmperorsCapacitor.averageStacksSuggestionThresholds,
            when: this.theEmperorsCapacitor.active,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
