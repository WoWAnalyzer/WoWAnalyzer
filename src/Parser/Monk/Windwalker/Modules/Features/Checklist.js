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
        ];
      },
    }),
    new Rule({
      name: 'Use your cooldowns effictively',
      description: 'Your cooldowns have a big impact on your output. Make sure you use them as much as possible',
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
      name: 'Manage your resources efficiently',
      description: 'Wasting resources leads directly to loss of throughput',
      requirements: () => {
        return [
          new Requirement({
            name: 'Chi Wasted',
            check: () => this.chiDetails.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper>Bad <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> casts</Wrapper>,
            check: () => this.spinningCraneKick.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: "Don't break mastery",
      description: "Using a damaging ability twice in a row will lose mastery benefit and drop the Hit Combo buff",
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Times <SpellLink id={SPELLS.COMBO_STRIKES.id} icon /> was broken </Wrapper>,
            check: () => this.comboStrikes.suggestionThresholds,
          }),
          new Requirement({
            name: <Wrapper> <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> uptime </Wrapper>,
            check: () => this.hitCombo.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: "Use your defensive cooldowns effectively",
      description: "Use defensives to mitigate damage",
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
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'Throughput gain of some legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id}icon/> stacks wasted </Wrapper>,
            check: () => this.theEmperorsCapacitor.wastedStacksSuggestionThresholds,
            when: combatant.hasChest(ITEMS.THE_EMPERORS_CAPACITOR),
          }),
          new Requirement({
            name: <Wrapper>Average <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} icon /> stacks used on your <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} icon /></Wrapper>,
            check: () => this.theEmperorsCapacitor.averageStacksSuggestionThresholds,
            when: combatant.hasChest(ITEMS.THE_EMPERORS_CAPACITOR),
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
